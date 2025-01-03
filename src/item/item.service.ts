import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UploadTableName } from "@prisma/client";
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
    const { name, description, status, image, roomTypeId } = createAmenityInput;

    // Validate if the entityId exists
    const uploadPresence = await this.prisma.upload.findUnique({
      where: { id: image },
    });
    if (!uploadPresence) {
      throw new NotFoundException(`Image ID does not exist.`);
    }

    // Validate if the entityId exists
    const roomType = await this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });
    if (!roomType) {
      throw new NotFoundException(`Parent Room ID does not exist.`);
    }

    try {
      let amenity = null;
      try {
        amenity = await this.prisma.amenities.create({
          data: {
            name,
            description,
            status,
            roomTypeId,
          },
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("name")) {
            throw new ConflictException("The amenity name must be unique.");
          }
        } else {
          console.log("Error=", error);
          throw new Error("Amenity could not be created!");
        }
      }

      await this.prisma.uploadRelation.create({
        data: {
          uploadId: image,
          amenitiesId: amenity.id,
          table: UploadTableName.AMENITIES,
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
    const { name, description, roomInitial, status } = createRoomTypeInput;

    try {
      let roomType = null;
      try {
        roomType = await this.prisma.roomType.create({
          data: {
            name,
            description,
            roomInitial,
            status,
          },
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("name")) {
            throw new ConflictException("The roomtype name must be unique.");
          }
        } else {
          console.log("Error=", error);
          throw new Error("Roomtype could not be created!");
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

  // async listEntity() {
  //   try {
  //     const entities = Entity;

  //     return { entities };
  //   } catch (error) {
  //     console.log("Error=", error);
  //     throw new Error("Internal Server Error. Please try after some time!");
  //   }
  // }

  // async listItem(filterArgs: FilterItemInput) {
  //   let extraWhere = {};

  //   if (filterArgs) {
  //     const { entity, parentRoom } = filterArgs;

  //     if (parentRoom) {
  //       // Validate if the entityId exists
  //       const parentRoomPresence = await this.prisma.item.findUnique({
  //         where: { id: parentRoom },
  //       });
  //       if (!parentRoomPresence) {
  //         throw new NotFoundException(`Room ID does not exist.`);
  //       }

  //       extraWhere["parentRoomId"] = parentRoom;
  //     }

  //     extraWhere = { entityId: entity, ...extraWhere };
  //   }

  //   try {
  //     const items = await this.prisma.item.findMany({
  //       where: { status: true, ...extraWhere },
  //       include: {
  //         uploadRelation: {
  //           include: {
  //             upload: true,
  //           },
  //         },
  //       },
  //     });

  //     items?.map((item): any => {
  //       if (item.uploadRelation[0] && item.uploadRelation[0].upload) {
  //         item.uploadRelation[0].upload["fileUrl"] =
  //           `${process.env.BACKEND_BASE_URL}/uploads/${item.uploadRelation[0].upload.file}`;
  //         item["image"] = item.uploadRelation[0].upload;
  //       }
  //     });

  //     return { items, total: items.length };
  //   } catch (error) {
  //     throw new Error("Internal Server Error. Please try after some time!");
  //   }
  // }

  // async viewItem(itemId: UniqueIdentifierInput) {
  //   const { id } = itemId;

  //   try {
  //     // Fetch item with all necessary relations
  //     const item = await this.prisma.item.findUnique({
  //       where: { id, status: true },
  //       include: {
  //         uploadRelation: {
  //           include: {
  //             upload: true,
  //           },
  //         },
  //       },
  //     });

  //     // Check if item exists
  //     if (!item) {
  //       throw new NotFoundException("No item found with this ID!");
  //     }

  //     const backendBaseUrl = process.env.BACKEND_BASE_URL;
  //     const uploadData = item.uploadRelation?.[0]?.upload;
  //     const image = uploadData
  //       ? {
  //           ...uploadData,
  //           fileUrl: `${backendBaseUrl}/uploads/${uploadData.file}`,
  //         }
  //       : null;
  //     return { ...item, image };
  //   } catch (error) {
  //     throw new Error("Internal Server Error. Please try after some time!");
  //   }
  // }

  // async deleteItem(itemId: UniqueIdentifierInput) {
  //   const { id } = itemId;

  //   // Validate if the entityId exists
  //   const itemPresence = await this.prisma.item.findUnique({
  //     where: { id },
  //   });
  //   if (!itemPresence) {
  //     throw new NotFoundException(`Item ID does not exist.`);
  //   }

  //   try {
  //     // Fetch item with all necessary relations
  //     await this.prisma.item.delete({
  //       where: { id },
  //     });

  //     return { message: `Item deleted succesully with the Id ${id}` };
  //   } catch (error) {
  //     console.log("Error=", error);
  //     throw new Error("Internal Server Error. Please try after some time!");
  //   }
  // }

  // async toggleItem(itemId: UniqueIdentifierInput) {
  //   const { id } = itemId;

  //   // Validate if the entityId exists
  //   const itemPresence = await this.prisma.item.findUnique({
  //     select: { status: true },
  //     where: { id },
  //   });
  //   if (!itemPresence) {
  //     throw new NotFoundException(`Item ID does not exist.`);
  //   }

  //   try {
  //     // Fetch item with all necessary relations
  //     await this.prisma.item.update({
  //       where: { id },
  //       data: { status: !itemPresence.status },
  //     });

  //     return {
  //       message: `Item ${
  //         !itemPresence.status === true ? "Enabled" : "Disabled"
  //       }!`,
  //     };
  //   } catch (error) {
  //     console.log("Error=", error);
  //     throw new Error("Internal Server Error. Please try after some time!");
  //   }
  // }
}
