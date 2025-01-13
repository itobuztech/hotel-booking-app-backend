import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoomInput } from "./dto/create-room.input";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async roomCreateService(createRoomInput: CreateRoomInput) {
    const {
      numberOfRooms,
      branchId,
      roomTypeId,
      setPrice,
      offerPrice,
      description,
      amenities = [],
      images,
    } = createRoomInput;

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
        if (!amenity) {
          throw new NotFoundException(`Amenities should not be blank!`);
        }

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

    if (!branchRoomTypeRelation) {
      // Creating relation between branch and room type!
      branchRoomTypeRelation = await this.prisma.branchRoomTypeRelation.create({
        data: {
          branchId,
          roomTypeId,
          setPrice,
          offerPrice,
          description: description || null,
        },
      });
    } else {
      // Updating relation between branch and room type!
      branchRoomTypeRelation = await this.prisma.branchRoomTypeRelation.update({
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

    try {
      return {
        message: `Room created successfully!`,
      };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }
}
