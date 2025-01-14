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

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  private async roomCreation(
    numberOfRooms: number,
    roomTypePresence,
    branchId,
    branchRoomTypeRelation
  ) {
    for (let i = 1; i <= numberOfRooms; i++) {
      // Loop from 1 to numberOfRooms
      let roomName: string;
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
      let j = i;
      while (roomNamePresent > 0) {
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
      }

      // Create the room after finding a unique room name
      await this.prisma.room.create({
        data: {
          roomName,
          branchRoomTypeId: branchRoomTypeRelation.id,
        },
      });
    }
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

      if (branchRoomTypeRelation && action === "CREATE") {
        throw new BadRequestException(
          `Room type already exists for this branch.`
        );
      } else if (action === "CREATE") {
        // Creating relation between branch and room type!
        branchRoomTypeRelation =
          await this.prisma.branchRoomTypeRelation.create({
            data: {
              branchId,
              roomTypeId,
              setPrice,
              offerPrice,
              description: description || null,
            },
          });
      } else if (action === "UPDATE") {
        // Updating relation between branch and room type!
        await this.prisma.branchRoomTypeRelation.update({
          where: {
            id: branchRoomTypeRelation.id,
          },
          data: {
            setPrice,
            offerPrice,
            description: description || null,
          },
        });
      }

      if (amenities.length > 0) {
        const amenitiesCreateArr = await Promise.all(
          amenities.map(async (amenity) => {
            const branchRoomTypeAmenitiesRelationPresent =
              await this.prisma.branchRoomTypeAmenitiesRelation.count({
                where: {
                  amenitiesId: amenity,
                  branchRoomTypeId: branchRoomTypeRelation.id,
                },
              });

            if (!branchRoomTypeAmenitiesRelationPresent) {
              return {
                amenitiesId: amenity,
                branchRoomTypeId: branchRoomTypeRelation.id,
              };
            }
            return null; // Return null for amenities that don't need to be created
          })
        );

        // Filter out null values from the array
        const filteredAmenitiesCreateArr = amenitiesCreateArr.filter(
          (item) => item !== null
        );

        if (filteredAmenitiesCreateArr.length > 0) {
          await this.prisma.branchRoomTypeAmenitiesRelation.createMany({
            data: filteredAmenitiesCreateArr,
          });
        }
      } else if (amenities.length === 0 && action === "UPDATE") {
        await this.prisma.branchRoomTypeAmenitiesRelation.deleteMany({
          where: {
            branchRoomTypeId: branchRoomTypeRelation.id,
          },
        });
      }

      if (action === "CREATE") {
        await this.roomCreation(
          numberOfRooms,
          roomTypePresence,
          branchId,
          branchRoomTypeRelation
        );

        return {
          message: `Room created successfully!`,
        };
      } else if (action === "UPDATE") {
        const rooms = await this.prisma.room.findMany({
          select: { id: true, roomName: true, createdAt: true },
          where: {
            branchRoomTypeId: branchRoomTypeRelation.id,
          },
        });

        const roomsCount = rooms.length;

        if (roomsCount > numberOfRooms) {
          const unnecessaryRooms = roomsCount - numberOfRooms;
          // Delete extra rooms
          await this.prisma.room.deleteMany({
            where: {
              branchRoomTypeId: branchRoomTypeRelation.id,
              createdAt: {
                lte: rooms[unnecessaryRooms - 1].createdAt,
              },
            },
          });
        } else if (roomsCount < numberOfRooms) {
          const extraRooms = numberOfRooms - roomsCount;

          await this.roomCreation(
            extraRooms,
            roomTypePresence,
            branchId,
            branchRoomTypeRelation
          );
        }

        return {
          message: `Room updated successfully!`,
        };
      }
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
    const { branchId, roomTypeId = null } = filterArgs;

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
            roomType: { select: { name: true, roomInitial: true } },
            Room: {
              select: { id: true, roomName: true },
              where: {
                roomName: {
                  contains: searchInput || undefined,
                  mode: "insensitive",
                },
                deletedAt: null,
              },
            },
          },
        });

      if (!roomTypeId) {
        branchRoomTypeRelation?.map((branchRoomType) => {
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

        return { roomsWithInitials: roomsWithInitials || [] };
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
}
