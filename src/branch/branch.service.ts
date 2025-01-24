import { NotFoundException, Injectable } from "@nestjs/common";
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
      const branch = await this.prisma.branch.findUnique({
        where: {
          id: id,
        },
        include: {
          BranchAmenitiesRelation: {
            include: {
              amenities: true,
            },
          },
          UploadRelation: {
            include: {
              upload: true,
            },
          },
          BranchRoomTypeRelation: {
            select: {
              id: true,
              offerPrice: true,
            },
            orderBy: {
              offerPrice: "asc",
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
          include: {
            UploadRelation: {
              include: {
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
      await this.prisma.branch.create({
        data: {
          name,
          address,
          areaPincode,
          city,
          contactNumber,
          description,
          location,
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
          },
          orderBy: {
            offerPrice: "asc",
          },
        },
      },
    });

    if (filteredBranches.length > 0) {
      filteredBranches.map((branch) => {
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

  async update(
    getBranchInput: GetBranchInput,
    updateBranchInput: UpdateBranchInput
  ) {
    const { id } = getBranchInput;
    return await this.prisma.branch.update({
      where: {
        id: id,
      },
      data: updateBranchInput,
    });
  }
}
