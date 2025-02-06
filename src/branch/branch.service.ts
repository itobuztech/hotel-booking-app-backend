import {
  NotFoundException,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { CreateBranchInput } from "./dto/create-branch.input";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { GetBranchInput } from "./dto/get-branch.input";
import { DeleteBranchInput } from "./dto/delete-branch.input";
import { UpdateBranchInput } from "./dto/update-branch.input";

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async get(getBranchInput: GetBranchInput) {
    const { id } = getBranchInput;

    try {
      const branch: any = await this.prisma.branch.findUnique({
        where: {
          id: id,
        },
        include: {
          BranchAmenitiesRelation: {
            select: {
              amenities: true,
            },
          },
          UploadRelation: {
            select: {
              upload: true,
            },
          },
          BranchRoomTypeRelation: {
            select: {
              id: true,
              offerPrice: true,
              roomType: {
                select: {
                  id: true,
                  name: true,
                },
              },
              Room: {
                select: {
                  id: true,
                },
              },
            },
            orderBy: {
              offerPrice: "asc",
            },
          },
          Booking: {
            where: {
              checkInDate: {
                lte: new Date(),
              },
              checkOutDate: {
                gte: new Date(),
              },
            },
            select: {
              BranchRoomTypeRelation: {
                select: {
                  roomTypeId: true,
                },
              },
            },
          },
        },
      });

      if (!branch) {
        throw new NotFoundException("Branch not found!");
      } else {
        const branchAmenitiesIdArr =
          branch?.BranchAmenitiesRelation?.map((item) => {
            return item?.amenities.id;
          }) || [];

        let amenities = await this.prisma.amenities.findMany({
          select: {
            id: true,
            name: true,
            UploadRelation: {
              select: {
                upload: true,
              },
            },
          },
        });

        if (amenities.length > 0) {
          amenities?.map((item) => {
            if (item?.UploadRelation[0].upload) {
              item.UploadRelation[0].upload["fileUrl"] =
                `${process.env.BACKEND_BASE_URL}/uploads/${item?.UploadRelation[0]?.upload?.file}`;
              item["image"] = item?.UploadRelation[0]?.upload;
            }
            if (branchAmenitiesIdArr?.includes(item.id)) {
              item["selected"] = true;
            } else {
              item["selected"] = false;
            }
          });
        } else {
          amenities?.map((item) => {
            item["selected"] = false;
          });
        }

        branch["amenities"] = amenities;

        branch["image"] = branch?.UploadRelation?.map((item) => {
          return {
            id: item.upload.id,
            file: item.upload.file,
            fileUrl: `${process.env.BACKEND_BASE_URL}/uploads/${item.upload.file}`,
          };
        });

        branch["startingPrice"] = Number(
          branch?.BranchRoomTypeRelation?.[0]?.offerPrice
        );

        branch["status"] = branch.BranchRoomTypeRelation.map((relation) => {
          let bookedRooms = 0;
          if (branch?.Booking?.length === 0) {
            bookedRooms = 0;
          } else {
            branch?.Booking?.map((room) => {
              if (
                relation?.roomType?.id ===
                room?.BranchRoomTypeRelation?.roomTypeId
              ) {
                bookedRooms++;
              }
            });
          }

          return {
            ...relation.roomType,
            totalRooms: relation?.Room?.length,
            availabeRooms: relation?.Room?.length - bookedRooms,
          };
        });

        branch.geoLocation = JSON.parse(branch.geoLocation);
      }

      return branch;
    } catch (error) {
      console.log("Error=", error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try after some time!");
      }
    }
  }

  async create(createBranchInput: CreateBranchInput) {
    const {
      name,
      address,
      areaPincode,
      city,
      contactNumber,
      description,
      location,
      geoLocation,
      amenityIds,
      uploadFileIds,
    } = createBranchInput;

    const amenityIdsExist = await this.prisma.amenities.findMany({
      where: {
        id: {
          in: amenityIds,
        },
      },
    });

    if (amenityIdsExist.length !== amenityIds.length) {
      const foundAmenityIds = amenityIdsExist.map((amenityId) => amenityId.id);
      const missingAmenityIds = amenityIds.filter(
        (id) => !foundAmenityIds.includes(id)
      );

      throw new NotFoundException(
        `Amenities not found : ${missingAmenityIds.join(", ")}`
      );
    }

    const amenityIdsArr = amenityIds.map((amenitiesId) => {
      return {
        amenitiesId,
      };
    });

    if (uploadFileIds.length < 4) {
      throw new NotFoundException("Upload atleast 4 files");
    }

    const selectedFiles: any = await this.prisma.upload.findMany({
      where: {
        id: { in: uploadFileIds },
      },
    });

    if (selectedFiles.length !== uploadFileIds.length) {
      const foundFileIds = selectedFiles.map((fileId) => fileId.id);
      const missingFileIds = uploadFileIds.filter(
        (id) => !foundFileIds.includes(id)
      );

      throw new NotFoundException(
        `Files not found : ${missingFileIds.join(", ")}`
      );
    }

    const fileIdsArr = uploadFileIds.map((fileId) => {
      return {
        uploadId: fileId,
      };
    });

    try {
      const newBranch = await this.prisma.branch.create({
        data: {
          name,
          address,
          areaPincode,
          city,
          contactNumber,
          description,
          location,
          geoLocation: JSON.stringify(geoLocation),
          BranchAmenitiesRelation: {
            createMany: {
              data: amenityIdsArr,
            },
          },
          UploadRelation: {
            createMany: {
              data: fileIdsArr,
            },
          },
        },
        include: {
          BranchAmenitiesRelation: true,
          UploadRelation: true,
        },
      });

      return {
        id: newBranch.id,
        message: "Branch created successfully!",
      };
    } catch (error) {
      throw new Error(`Error : ${error}`);
    }
  }

  async list(paginationArgs: PaginationArgs, searchInput: SearchInput) {
    const { search = "" } = searchInput;
    const { limit = 10, skip = 0 } = paginationArgs;
    const currentPage = Math.floor(skip / limit) + 1;
    const recordCount = await this.prisma.branch.count({});
    const filteredBranches = await this.prisma.branch.findMany({
      skip: skip,
      take: limit,
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        UploadRelation: {
          include: {
            upload: true,
          },
        },
        BranchRoomTypeRelation: {
          select: {
            id: true,
            offerPrice: true,
            roomType: {
              select: {
                id: true,
                name: true,
              },
            },
            Room: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            offerPrice: "asc",
          },
        },
        Booking: {
          where: {
            checkInDate: {
              lte: new Date(),
            },
            checkOutDate: {
              gte: new Date(),
            },
          },
          select: {
            BranchRoomTypeRelation: {
              select: {
                roomTypeId: true,
              },
            },
          },
        },
      },
    });

    if (filteredBranches.length > 0) {
      filteredBranches.map((branch: any) => {
        branch["image"] = branch?.UploadRelation?.map((item) => {
          return {
            id: item.upload.id,
            file: item.upload.file,
            fileUrl: `${process.env.BACKEND_BASE_URL}/uploads/${item.upload.file}`,
          };
        });

        delete branch.UploadRelation;

        branch["startingPrice"] = Number(
          branch?.BranchRoomTypeRelation?.[0]?.offerPrice || 0
        );

        branch["status"] = branch.BranchRoomTypeRelation.map((relation) => {
          let bookedRooms = 0;
          if (branch?.Booking?.length === 0) {
            bookedRooms = 0;
          } else {
            branch?.Booking?.map((room) => {
              if (
                relation?.roomType?.id ===
                room?.BranchRoomTypeRelation?.roomTypeId
              ) {
                bookedRooms++;
              }
            });
          }

          return {
            ...relation.roomType,
            totalRooms: relation?.Room?.length,
            availabeRooms: relation?.Room?.length - bookedRooms,
          };
        });

        branch.geoLocation = JSON.parse(branch.geoLocation);
      });
    }

    return {
      branches: filteredBranches,
      pagination: {
        totalRecords: recordCount,
        totalPages: Math.ceil(recordCount / limit),
        currentPage: currentPage,
      },
    };
  }

  async delete(deleteBranchInput: DeleteBranchInput): Promise<string> {
    const { id } = deleteBranchInput;
    await this.prisma.branch.delete({
      where: {
        id: id,
      },
    });
    return "Branch deleted successfully";
  }

  private async getNotIdenticalElements<T>(
    array1: T[],
    array2: T[]
  ): Promise<T[]> {
    return array1.filter((item) => !array2.includes(item));
  }

  async update(
    getBranchInput: GetBranchInput,
    updateBranchInput: UpdateBranchInput
  ) {
    const { id } = getBranchInput;
    const { amenityIds, uploadFileIds } = updateBranchInput;

    delete updateBranchInput?.amenityIds;
    delete updateBranchInput?.uploadFileIds;

    try {
      if (uploadFileIds && uploadFileIds.length < 4) {
        throw new NotFoundException("Upload atleast 4 files");
      }

      // Validate if branch exists
      const branchPresence = await this.prisma.branch.findUnique({
        where: { id },
      });
      if (!branchPresence) {
        throw new NotFoundException(`Branch does not exist.`);
      }

      const data: any = updateBranchInput;
      if (updateBranchInput.geoLocation) {
        const stringedGeo = JSON.stringify(updateBranchInput.geoLocation);
        data.geoLocation = stringedGeo;
      }

      await this.prisma.branch.update({
        where: {
          id: id,
        },
        data,
      });

      // Handling Amenities!
      if (amenityIds.length > 0) {
        const amenityIdsExist = await this.prisma.amenities.findMany({
          where: {
            id: {
              in: amenityIds,
            },
          },
        });

        if (amenityIdsExist.length !== amenityIds.length) {
          throw new NotFoundException(`Some amenities are not found!}`);
        }

        const branchAmenities =
          await this.prisma.branchAmenitiesRelation.findMany({
            select: { amenitiesId: true },
            where: {
              branchId: id,
            },
          });

        const branchAmenitiesIdArr = branchAmenities.map(
          (item) => item.amenitiesId
        );

        const amenitiesToCreate = await this.getNotIdenticalElements(
          amenityIds,
          branchAmenitiesIdArr
        );
        const amenitiesToDelete = await this.getNotIdenticalElements(
          branchAmenitiesIdArr,
          amenityIds
        );

        // Create Amenity
        if (amenitiesToCreate.length > 0) {
          const amenitiesCreateArr = amenitiesToCreate.map((amenity) => {
            return {
              amenitiesId: amenity,
              branchId: id,
            };
          });

          await this.prisma.branchAmenitiesRelation.createMany({
            data: amenitiesCreateArr,
          });
        }
        // Delete Amenity
        if (amenitiesToDelete.length > 0) {
          const amenitiesDeleteArr = amenitiesToDelete.map((amenity) => {
            return {
              amenitiesId: amenity,
              branchId: id,
            };
          });

          await this.prisma.branchAmenitiesRelation.deleteMany({
            where: {
              OR: amenitiesDeleteArr,
            },
          });
        }
      } else if (amenityIds && amenityIds.length === 0) {
        await this.prisma.branchAmenitiesRelation.deleteMany({
          where: {
            branchId: id,
          },
        });
      }

      // Handeling Images
      if (uploadFileIds && uploadFileIds.length === 4) {
        const selectedFiles: any = await this.prisma.upload.findMany({
          where: {
            id: { in: uploadFileIds },
          },
        });

        if (selectedFiles.length !== uploadFileIds.length) {
          throw new NotFoundException(`Some files are not found!`);
        }

        const branchImages = await this.prisma.uploadRelation.findMany({
          select: { uploadId: true },
          where: {
            branchId: id,
          },
        });

        const branchImagesIdArr = branchImages.map((item) => item.uploadId);

        const imagesToCreate = await this.getNotIdenticalElements(
          uploadFileIds,
          branchImagesIdArr
        );
        const imagesToDelete = await this.getNotIdenticalElements(
          branchImagesIdArr,
          uploadFileIds
        );

        // Create Images
        if (imagesToCreate.length > 0) {
          const imageCreateArr = imagesToCreate.map((image) => {
            return {
              uploadId: image,
              branchId: id,
            };
          });

          await this.prisma.uploadRelation.createMany({
            data: imageCreateArr,
          });
        }
        // Delete Images
        if (imagesToDelete.length > 0) {
          const imageDeleteArr = imagesToDelete.map((image) => {
            return {
              uploadId: image,
              branchId: id,
            };
          });

          await this.prisma.uploadRelation.deleteMany({
            where: {
              OR: imageDeleteArr,
            },
          });
        }
      }

      return { message: "Branch updated Successfully!" };
    } catch (error) {
      console.error("Error=", error);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try again later.");
      }
    }
  }
}
