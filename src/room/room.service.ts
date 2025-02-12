import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ActionTypeInput,
  CreateOrUpdateRoomInput,
} from "./dto/create-or-update-room.input";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateRoomNumberInput } from "./dto/update-room-number.input";
import { FilterBranchRoomTypeInput } from "./dto/filter-branch-room-type.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { UniqueIdentifierInput } from "src/types/inputtypes/unique-id.input";

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  private async roomCreation(
    numberOfRooms: number,
    roomTypePresence,
    branchId,
    branchRoomTypeRelation
  ) {
    const roomNameArr = [];
    for (let i = 1; i <= numberOfRooms; i++) {
      let roomName: string;
      // Loop from 1 to numberOfRooms
      let roomNamePresent: number;

      // Generate room name using sequential number
      roomName = roomTypePresence.roomInitial + i; // Append the loop index to the room type initial
      // Check if the generated roomName already exists in the database
      roomNamePresent = await this.prisma.room.count({
        where: {
          roomName,
          branchRoomType: {
            branchId,
          },
        },
      });

      // If room name is taken, keep generating the next number
      let j = 0;
      while (roomNamePresent > 0 || roomNameArr.length !== numberOfRooms) {
        j++; // Increment the number for uniqueness
        roomName = roomTypePresence.roomInitial + j; // Update room name with the new sequential number

        roomNamePresent = await this.prisma.room.count({
          where: {
            roomName,
            branchRoomType: {
              branchId,
            },
          },
        });

        if (roomNamePresent === 0 && !roomNameArr.includes(roomName)) {
          roomNameArr.push(roomName);
        }
      }
    }

    const roomCreateArr = roomNameArr.map((roomName) => {
      return {
        roomName,
        branchRoomTypeId: branchRoomTypeRelation.id,
      };
    });

    return roomCreateArr;
  }

  private async getNotIdenticalElements<T>(
    array1: T[],
    array2: T[]
  ): Promise<T[]> {
    return array1.filter((item) => !array2.includes(item));
  }

  async roomCreateOrUpdateService(
    createOrUpdateRoomInput: CreateOrUpdateRoomInput,
    actionTypeInput: ActionTypeInput
  ) {
    const { action } = actionTypeInput;

    const {
      numberOfRooms,
      branchId,
      roomTypeId,
      setPrice,
      offerPrice,
      description,
      amenities = [],
      images,
    } = createOrUpdateRoomInput;

    try {
      // Validate if branch exists
      const branchPresence = await this.prisma.branch.count({
        where: { id: branchId },
      });
      if (!branchPresence) {
        throw new NotFoundException(`Branch does not exist.`);
      }

      // Validate if room type exists
      const roomTypePresence = await this.prisma.roomType.findUnique({
        where: { id: roomTypeId },
      });
      if (!roomTypePresence) {
        throw new NotFoundException(`Room type does not exist.`);
      }

      // Validate if amenities exist
      if (amenities.length > 0) {
        for (const amenity of amenities) {
          const amenityPresence = await this.prisma.amenities.count({
            where: { id: amenity },
          });

          if (!amenityPresence) {
            throw new NotFoundException(`Some amenity does not exist.`);
          }
        }
      }

      // Validate if images exist
      for (const image of images) {
        const imagePresence = await this.prisma.upload.findUnique({
          where: { id: image },
        });

        if (!imagePresence) {
          throw new NotFoundException(`Some image does not exist.`);
        }
      }

      // Check if the "branchRoomTypeRelation" is already present or not.
      let branchRoomTypeRelation =
        await this.prisma.branchRoomTypeRelation.findFirst({
          where: { branchId, roomTypeId },
        });

      const result = await this.prisma.$transaction(async (prisma) => {
        if (branchRoomTypeRelation && action === "CREATE") {
          throw new BadRequestException(
            `Room type already exists for this branch.`
          );
        } else if (action === "CREATE") {
          // Creating relation between branch and room type!
          branchRoomTypeRelation = await prisma.branchRoomTypeRelation.create({
            data: {
              branchId,
              roomTypeId,
              setPrice,
              offerPrice,
              description: description || null,
            },
          });

          const imageCreateArr = images.map((image) => {
            return {
              uploadId: image,
              branchRoomTypeId: branchRoomTypeRelation.id,
            };
          });

          await prisma.uploadRelation.createMany({
            data: imageCreateArr,
          });
        } else if (action === "UPDATE") {
          // Updating relation between branch and room type!
          await prisma.branchRoomTypeRelation.update({
            where: {
              id: branchRoomTypeRelation.id,
            },
            data: {
              setPrice,
              offerPrice,
              description: description || null,
            },
          });

          const branchRoomTypesImages = await prisma.uploadRelation.findMany({
            select: { uploadId: true },
            where: {
              branchRoomTypeId: branchRoomTypeRelation.id,
            },
          });

          const branchRoomTypesImagesIdArr = branchRoomTypesImages.map(
            (item) => item.uploadId
          );

          const imagesToCreate = await this.getNotIdenticalElements(
            images,
            branchRoomTypesImagesIdArr
          );
          const imagesToDelete = await this.getNotIdenticalElements(
            branchRoomTypesImagesIdArr,
            images
          );

          // Create Images
          if (imagesToCreate.length > 0) {
            const imageCreateArr = imagesToCreate.map((image) => {
              return {
                uploadId: image,
                branchRoomTypeId: branchRoomTypeRelation.id,
              };
            });

            await prisma.uploadRelation.createMany({
              data: imageCreateArr,
            });
          }
          // Delete Images
          if (imagesToDelete.length > 0) {
            const imageDeleteArr = imagesToDelete.map((image) => {
              return {
                uploadId: image,
                branchRoomTypeId: branchRoomTypeRelation.id,
              };
            });

            await prisma.uploadRelation.deleteMany({
              where: {
                OR: imageDeleteArr,
              },
            });
          }
        }

        if (amenities.length > 0) {
          const branchRoomTypesAmenities =
            await prisma.branchRoomTypeAmenitiesRelation.findMany({
              select: { amenitiesId: true },
              where: {
                branchRoomTypeId: branchRoomTypeRelation.id,
              },
            });

          const branchRoomTypesAmenitiesIdArr = branchRoomTypesAmenities.map(
            (item) => item.amenitiesId
          );

          const amenitiesToCreate = await this.getNotIdenticalElements(
            amenities,
            branchRoomTypesAmenitiesIdArr
          );
          const amenitiesToDelete = await this.getNotIdenticalElements(
            branchRoomTypesAmenitiesIdArr,
            amenities
          );

          // Create Amenity
          if (amenitiesToCreate.length > 0) {
            const amenitiesCreateArr = amenitiesToCreate.map((amenity) => {
              return {
                amenitiesId: amenity,
                branchRoomTypeId: branchRoomTypeRelation.id,
              };
            });

            await prisma.branchRoomTypeAmenitiesRelation.createMany({
              data: amenitiesCreateArr,
            });
          }
          // Delete Amenity
          if (amenitiesToDelete.length > 0) {
            const amenitiesDeleteArr = amenitiesToDelete.map((amenity) => {
              return {
                amenitiesId: amenity,
                branchRoomTypeId: branchRoomTypeRelation.id,
              };
            });

            await prisma.branchRoomTypeAmenitiesRelation.deleteMany({
              where: {
                OR: amenitiesDeleteArr,
              },
            });
          }
        } else if (amenities.length === 0 && action === "UPDATE") {
          await prisma.branchRoomTypeAmenitiesRelation.deleteMany({
            where: {
              branchRoomTypeId: branchRoomTypeRelation.id,
            },
          });
        }

        if (action === "CREATE") {
          const roomCreateArr = await this.roomCreation(
            numberOfRooms,
            roomTypePresence,
            branchId,
            branchRoomTypeRelation
          );

          await prisma.room.createMany({
            data: roomCreateArr,
          });

          return {
            message: `Room created successfully!`,
          };
        } else if (action === "UPDATE") {
          const rooms = await prisma.room.findMany({
            select: { id: true, roomName: true, createdAt: true },
            where: {
              branchRoomTypeId: branchRoomTypeRelation.id,
            },
            orderBy: {
              createdAt: "asc", // Order by createdAt in ascending order
            },
          });

          const roomsCount = rooms.length;

          if (roomsCount > numberOfRooms) {
            const unnecessaryRooms = roomsCount - numberOfRooms;

            // Delete extra rooms
            await this.prisma.room.deleteMany({
              where: {
                id: {
                  in: rooms.slice(0, unnecessaryRooms).map((room) => room.id), // Select the first unnecessaryRooms rooms to delete
                },
              },
            });
          }
          if (roomsCount < numberOfRooms) {
            const extraRooms = numberOfRooms - roomsCount;

            const roomCreateArr = await this.roomCreation(
              extraRooms,
              roomTypePresence,
              branchId,
              branchRoomTypeRelation
            );

            await prisma.room.createMany({
              data: roomCreateArr,
            });
          }

          return {
            message: `Room updated successfully!`,
          };
        }
      });

      return result;
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

  async roomNumberUpdateService(
    updateRoomNumberInput: UpdateRoomNumberInput[]
  ) {
    const updatingRoomNumbersObjArr = [];

    try {
      for (const roomNumberObj of updateRoomNumberInput) {
        const { room, roomNumber } = roomNumberObj;

        // Validate if room exists
        const roomPresence = await this.prisma.room.findUnique({
          where: { id: room },
          include: {
            branchRoomType: true,
          },
        });

        if (!roomPresence) {
          throw new NotFoundException(`Room does not exist.`);
        }

        // Separate text from number in roomName
        const roomName = roomPresence.roomName.replace(/\d+$/, "") + roomNumber;

        // Validate if room number is unique
        const roomNumberPresence = await this.prisma.room.count({
          where: {
            roomName,
            branchRoomType: {
              branchId: roomPresence.branchRoomType.branchId,
            },
          },
        });

        if (roomNumberPresence) {
          throw new NotFoundException(`Room number already exists.`);
        } else {
          updatingRoomNumbersObjArr.push({
            id: room,
            roomName,
          });
        }
      }

      // Update all room numbers at once
      await this.prisma.$transaction(
        updatingRoomNumbersObjArr.map((room) =>
          this.prisma.room.update({
            where: { id: room.id },
            data: { roomName: room.roomName },
          })
        )
      );

      return { message: "Room numbers updated successfully!" };
    } catch (error) {
      console.log("Error=", error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try after some time!");
      }
    }
  }

  async branchRoomTypeListingService(
    filterArgs: FilterBranchRoomTypeInput,
    search: SearchInput
  ) {
    const {
      branchId,
      roomTypeId = null,
      checkInDate,
      checkOutDate,
    } = filterArgs;

    try {
      // Validate if branch exists
      const branchPresence = await this.prisma.branch.count({
        where: { id: branchId },
      });
      if (!branchPresence) {
        throw new NotFoundException(`Branch does not exist.`);
      }

      let searchInput = "";
      if (roomTypeId) {
        // Validate if Room type exists
        const roomPresence = await this.prisma.roomType.count({
          where: { id: roomTypeId },
        });
        if (!roomPresence) {
          throw new NotFoundException(`Roomtype does not exist.`);
        }
        if (search) {
          const { search: searchString = "" } = search;

          searchInput = searchString.trim().toLowerCase();
        }
      }

      const branchRoomTypeRelation =
        await this.prisma.branchRoomTypeRelation.findMany({
          where: {
            branchId,
            roomTypeId: roomTypeId || undefined,
          },
          include: {
            roomType: { select: { id: true, name: true, roomInitial: true } },
            Room: {
              select: { id: true, roomName: true },
              where: {
                roomName: {
                  contains: searchInput || undefined,
                  mode: "insensitive",
                },
                deletedAt: null,
                NOT:
                  roomTypeId && checkInDate && checkOutDate
                    ? {
                        BookingRoomRelation: {
                          some: {
                            booking: {
                              AND: [
                                { checkInDate: { lt: checkOutDate } }, // Booking starts before given checkOutDate
                                { checkOutDate: { gt: checkInDate } }, // Booking ends after given checkInDate
                              ],
                            },
                          },
                        },
                      }
                    : {},
              },
            },
          },
        });

      if (!roomTypeId) {
        branchRoomTypeRelation?.map((branchRoomType) => {
          const offerPriceVal = Number(branchRoomType.offerPrice);

          branchRoomType["offerPriceShown"] = offerPriceVal;
          branchRoomType["roomTypeId"] = branchRoomType.roomType.id;
          branchRoomType["type"] = branchRoomType.roomType.name;
          branchRoomType["total"] = branchRoomType.Room.length;
          branchRoomType["rooms"] = branchRoomType.Room.map(
            (room) => room.roomName
          );
        });

        return { roomsOverAlls: branchRoomTypeRelation || [] };
      } else {
        const roomsWithInitials = branchRoomTypeRelation[0]?.Room;

        roomsWithInitials?.map((room) => {
          room["roomNumber"] = parseInt(room.roomName.replace(/\D/g, ""));
          room["roomInitial"] = branchRoomTypeRelation[0].roomType.roomInitial;
        });

        return {
          roomsWithInitials: roomsWithInitials || [],
          setPrice: Number(branchRoomTypeRelation[0].setPrice),
          offerPrice: Number(branchRoomTypeRelation[0].offerPrice),
        };
      }
    } catch (error) {
      console.log("Error=", error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try after some time!");
      }
    }
  }

  async branchRoomTypeDetailsService(branchRoomTypeId: UniqueIdentifierInput) {
    try {
      // Validate if branchRoomTypeRelation exists
      const branchRoomTypeRelationPresence =
        await this.prisma.branchRoomTypeRelation.findUnique({
          where: { id: branchRoomTypeId.id },
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
            Room: {
              select: { id: true, roomName: true },
              where: {
                deletedAt: null,
              },
            },
            roomType: {
              select: { name: true, roomInitial: true },
            },
            BranchRoomTypeAmenitiesRelation: {
              include: {
                amenities: {
                  select: { id: true, name: true },
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
            UploadRelation: {
              include: {
                upload: true,
              },
            },
          },
        });
      if (branchRoomTypeRelationPresence) {
        const branchRoomAmenitiesIdArr =
          branchRoomTypeRelationPresence?.BranchRoomTypeAmenitiesRelation?.map(
            (item) => {
              return item?.amenities.id;
            }
          ) || [];

        const branchAmenities = await this.prisma.amenities.findMany({
          where: {
            BranchAmenitiesRelation: {
              some: {
                branchId: branchRoomTypeRelationPresence.branch.id,
              },
            },
          },
          include: {
            UploadRelation: {
              include: {
                upload: true,
              },
            },
          },
        });

        if (branchAmenities.length > 0) {
          branchAmenities?.map((item) => {
            if (item?.UploadRelation[0]?.upload) {
              item.UploadRelation[0].upload["fileUrl"] =
                `${process.env.BACKEND_BASE_URL}/uploads/${item?.UploadRelation[0]?.upload?.file}`;
              item["image"] = item?.UploadRelation[0]?.upload;
            }

            if (branchRoomAmenitiesIdArr?.includes(item.id)) {
              item["selected"] = true;
            } else {
              item["selected"] = false;
            }
          });
        } else {
          branchAmenities?.map((item) => {
            item["selected"] = false;
          });
        }

        branchRoomTypeRelationPresence["amenities"] = branchAmenities;

        const offerPriceVal = Number(branchRoomTypeRelationPresence.offerPrice);
        const setPriceVal = Number(branchRoomTypeRelationPresence.setPrice);

        branchRoomTypeRelationPresence["offerPriceEditable"] = offerPriceVal;
        branchRoomTypeRelationPresence["setPriceEditable"] = setPriceVal;
        branchRoomTypeRelationPresence.setPrice;
        branchRoomTypeRelationPresence["branchName"] =
          branchRoomTypeRelationPresence.branch.name;
        branchRoomTypeRelationPresence["roomTypeName"] =
          branchRoomTypeRelationPresence.roomType.name;
        branchRoomTypeRelationPresence["roomTypeInitial"] =
          branchRoomTypeRelationPresence.roomType.roomInitial;
        branchRoomTypeRelationPresence["totalRooms"] =
          branchRoomTypeRelationPresence.Room.length;
        branchRoomTypeRelationPresence["image"] =
          branchRoomTypeRelationPresence.UploadRelation.map((item) => {
            return {
              id: item.upload.id,
              file: item.upload.file,
              fileUrl: `${process.env.BACKEND_BASE_URL}/uploads/${item.upload.file}`,
            };
          });
      } else {
        throw new NotFoundException(`Branch room type does not exist.`);
      }

      return branchRoomTypeRelationPresence;
    } catch (error) {
      console.log("Error=", error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try after some time!");
      }
    }
  }

  /**
   * Deletes a branch room type and its related entities from the database.
   *
   * @param {UniqueIdentifierInput} branchRoomTypeId - The unique identifier of the branch room type to be deleted.
   * @returns {Promise<{ message: string }>} A promise that resolves to an object containing a success message.
   * @throws {NotFoundException} If the branch room type does not exist.
   * @throws {Error} If an internal server error occurs.
   */
  async branchRoomTypeDeleteService(branchRoomTypeId: UniqueIdentifierInput) {
    try {
      // Validate if branchRoomTypeRelation exists
      const branchRoomTypeRelationPresence =
        await this.prisma.branchRoomTypeRelation.findUnique({
          where: { id: branchRoomTypeId.id },
        });

      if (!branchRoomTypeRelationPresence) {
        throw new NotFoundException(`Branch room type does not exist.`);
      }

      await this.prisma.$transaction([
        this.prisma.branchRoomTypeRelation.delete({
          where: { id: branchRoomTypeId.id },
        }),
        this.prisma.room.deleteMany({
          where: { branchRoomTypeId: branchRoomTypeId.id },
        }),
        this.prisma.uploadRelation.deleteMany({
          where: { branchRoomTypeId: branchRoomTypeId.id },
        }),
        this.prisma.branchRoomTypeAmenitiesRelation.deleteMany({
          where: { branchRoomTypeId: branchRoomTypeId.id },
        }),
      ]);

      return { message: "Branch room type deleted successfully!" };
    } catch (error) {
      console.log("Error=", error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try after some time!");
      }
    }
  }

  async roomDeleteService(roomId: UniqueIdentifierInput) {
    try {
      // Validate if room exists
      const roomPresence = await this.prisma.room.findUnique({
        where: { id: roomId.id },
      });

      if (!roomPresence) {
        throw new NotFoundException(`Room does not exist.`);
      }

      await this.prisma.room.delete({
        where: { id: roomId.id },
      });

      return { message: "Room deleted successfully!" };
    } catch (error) {
      console.log("Error=", error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try after some time!");
      }
    }
  }
}
