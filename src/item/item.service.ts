import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "../prisma/prisma.service";
import { FilterItemInput } from "./dto/filter-item.input";
import { UniqueIdentifierInput } from "src/types/inputtypes/unique-id.input";
import { CreateAmenityInput } from "./dto/create-amenity.input";
import { CreateRoomTypeInput } from "./dto/create-roomType.input";

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async createAmenity(createAmenityInput: CreateAmenityInput) {
    const { name, description, image } = createAmenityInput;

    // Validate if the entityId exists
    const uploadPresence = await this.prisma.upload.findUnique({
      where: { id: image },
    });
    if (!uploadPresence) {
      throw new NotFoundException(`Image ID does not exist.`);
    }

    try {
      let amenity = null;
      try {
        amenity = await this.prisma.amenities.create({
          data: {
            name,
            description,
          },
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("name")) {
            return new ConflictException("The amenity name must be unique.");
          }
        } else {
          console.log("Error=", error);
          return new Error("Amenity could not be created!");
        }
      }

      await this.prisma.uploadRelation.create({
        data: {
          uploadId: image,
          amenitiesId: amenity.id,
        },
      });

      return {
        message: `Amenity created succesully with the Id ${amenity.id}`,
      };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async createRoomType(createRoomTypeInput: CreateRoomTypeInput) {
    const { name, description, roomInitial } = createRoomTypeInput;

    try {
      let roomType = null;
      try {
        roomType = await this.prisma.roomType.create({
          data: {
            name,
            description,
            roomInitial,
          },
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("name")) {
            return new ConflictException("The roomtype name must be unique.");
          }
        } else {
          console.log("Error=", error);
          return new Error("Roomtype could not be created!");
        }
      }

      return {
        message: `Roomtype created succesully with the Id ${roomType.id}`,
      };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async listItems(filterArg: FilterItemInput) {
    const { entity } = filterArg;

    try {
      if (entity === "ROOMTYPE") {
        const roomTypes = await this.prisma.roomType.findMany();

        return { roomTypes, total: roomTypes.length };
      } else {
        const aminities = await this.prisma.amenities.findMany({
          include: {
            UploadRelation: {
              include: {
                upload: true,
              },
            },
          },
        });

        aminities?.map((item): any => {
          if (item.UploadRelation[0] && item.UploadRelation[0].upload) {
            item.UploadRelation[0].upload["fileUrl"] =
              `${process.env.BACKEND_BASE_URL}/uploads/${item.UploadRelation[0].upload.file}`;
            item["image"] = item.UploadRelation[0].upload;
          }
        });

        return { aminities, total: aminities.length };
      }
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async toggleItems(itemArg: FilterItemInput, itemId: UniqueIdentifierInput) {
    const { entity } = itemArg;
    const { id } = itemId;

    try {
      if (entity === "ROOMTYPE") {
        // Validate if the entityId exists
        const roomTypePresence = await this.prisma.roomType.findUnique({
          where: { id },
        });
        if (!roomTypePresence) {
          throw new NotFoundException(`Roomtype ID does not exist.`);
        }

        if (roomTypePresence.deletedAt === null) {
          await this.prisma.roomType.delete({
            where: { id },
          });
          return {
            message: `Roomtype Disabled!`,
          };
        } else {
          await this.prisma.roomType.update({
            where: { id },
            data: {
              deletedAt: null,
            },
          });
          return {
            message: `Roomtype Enabled!`,
          };
        }
      } else {
        // Validate if the aminityId exists
        const amenityPresence = await this.prisma.amenities.findUnique({
          where: { id },
        });
        if (!amenityPresence) {
          throw new NotFoundException(`Amenity ID does not exist.`);
        }

        if (amenityPresence.deletedAt === null) {
          await this.prisma.amenities.delete({
            where: { id },
          });
          return {
            message: `Amenity Disabled!`,
          };
        } else {
          await this.prisma.amenities.update({
            where: { id },
            data: {
              deletedAt: null,
            },
          });

          return {
            message: `Amenity Enabled!`,
          };
        }
      }
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }
}
