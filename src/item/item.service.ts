import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TableName } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateItemInput } from "./dto/create-item.input";
import { PrismaService } from "../prisma/prisma.service";
import { FilterItemInput } from "./dto/filter-item.input";
import { Item } from "./entities/item.entity";
import { UniqueIdentifierInput } from "src/types/inputtypes/unique-id.input";

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(ctx, createItemInput: CreateItemInput) {
    const {
      name,
      description,
      roomInitial,
      parentRoomId,
      status,
      entity,
      image,
    } = createItemInput;

    // Validate if the entityId exists
    const entityPresence = await this.prisma.entity.findUnique({
      where: { id: entity },
    });
    if (!entityPresence) {
      throw new NotFoundException(`Entity ID does not exist.`);
    }

    // Validate if the entityId exists
    const uploadPresence = await this.prisma.upload.findUnique({
      where: { id: image },
    });
    if (!uploadPresence) {
      throw new NotFoundException(`Image ID does not exist.`);
    }

    // Validate if the entityId exists
    const parentRoom = await this.prisma.item.findUnique({
      where: { id: parentRoomId },
    });
    if (!parentRoom) {
      throw new NotFoundException(`Parent Room ID does not exist.`);
    }

    try {
      let item = null;
      try {
        item = await this.prisma.item.create({
          data: {
            name,
            description,
            roomInitial,
            parentRoomId,
            entityId: entity,
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
            throw new ConflictException("The item name must be unique.");
          }
          if (target.includes("room_initial")) {
            throw new ConflictException("The room initial must be unique.");
          }
        } else {
          console.log("Error=", error);
          throw new Error("Item could not be created!");
        }
      }

      await this.prisma.uploadRelation.create({
        data: {
          imageUploadId: image,
          tableId: item.id,
          table: TableName.ITEM,
        },
      });

      return { message: `Item created succesully with the Id ${item.id}` };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async listEntity() {
    try {
      const entities = await this.prisma.entity.findMany();

      return { entities, total: entities.length };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async listItem(filterArgs: FilterItemInput) {
    let extraWhere = {};

    if (filterArgs) {
      const { entity, parentRoom } = filterArgs;

      // Validate if the entityId exists
      const entityPresence = await this.prisma.entity.findUnique({
        where: { id: entity },
      });
      if (!entityPresence) {
        throw new NotFoundException(`Entity ID does not exist.`);
      }

      if (parentRoom) {
        // Validate if the entityId exists
        const parentRoomPresence = await this.prisma.item.findUnique({
          where: { id: parentRoom },
        });
        if (!entityPresence) {
          throw new NotFoundException(`Entity ID does not exist.`);
        }

        extraWhere["parentRoomId"] = parentRoom;
      }

      extraWhere = { entityId: entity, ...extraWhere };
    }

    try {
      const items = await this.prisma.item.findMany({
        where: { status: true, ...extraWhere },
        include: {
          entity: true,
          uploadRelation: {
            include: {
              upload: true,
            },
          },
        },
      });

      items?.map((item): any => {
        if (item.uploadRelation[0] && item.uploadRelation[0].upload) {
          item.uploadRelation[0].upload["fileUrl"] =
            `${process.env.BACKEND_BASE_URL}/uploads/${item.uploadRelation[0].upload.file}`;
          item["image"] = item.uploadRelation[0].upload;
        }
      });

      return { items, total: items.length };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async viewItem(itemId: UniqueIdentifierInput) {
    const { id } = itemId;

    try {
      // Fetch item with all necessary relations
      const item = await this.prisma.item.findUnique({
        where: { id, status: true },
        include: {
          entity: true,
          uploadRelation: {
            include: {
              upload: true,
            },
          },
        },
      });

      // Check if item exists
      if (!item) {
        throw new NotFoundException("No item found with this ID!");
      }

      // Item image realation added
      if (item.uploadRelation[0] && item.uploadRelation[0].upload) {
        item.uploadRelation[0].upload["fileUrl"] =
          `${process.env.BACKEND_BASE_URL}/uploads/${item.uploadRelation[0].upload.file}`;
        item["image"] = item.uploadRelation[0].upload;
      }

      return item;
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async deleteItem(itemId: UniqueIdentifierInput) {
    const { id } = itemId;

    // Validate if the entityId exists
    const itemPresence = await this.prisma.item.findUnique({
      where: { id },
    });
    if (!itemPresence) {
      throw new NotFoundException(`Item ID does not exist.`);
    }

    try {
      // Fetch item with all necessary relations
      await this.prisma.item.delete({
        where: { id },
      });

      return { message: `Item deleted succesully with the Id ${id}` };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async deleteEntity(entityId: UniqueIdentifierInput) {
    const { id } = entityId;

    // Validate if the entityId exists
    const entityPresence = await this.prisma.entity.findUnique({
      where: { id },
    });
    if (!entityPresence) {
      throw new NotFoundException(`Entity ID does not exist.`);
    }

    try {
      // Fetch item with all necessary relations
      await this.prisma.entity.delete({
        where: { id },
      });

      return { message: `Entity deleted succesully with the Id ${id}` };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }

  async toggleItem(itemId: UniqueIdentifierInput) {
    const { id } = itemId;

    // Validate if the entityId exists
    const itemPresence = await this.prisma.item.findUnique({
      select: { status: true },
      where: { id },
    });
    if (!itemPresence) {
      throw new NotFoundException(`Item ID does not exist.`);
    }

    try {
      // Fetch item with all necessary relations
      await this.prisma.item.update({
        where: { id },
        data: { status: !itemPresence.status },
      });

      return {
        message: `Item ${
          !itemPresence.status === true ? "Enabled" : "Disabled"
        }!`,
      };
    } catch (error) {
      console.log("Error=", error);
      throw new Error("Internal Server Error. Please try after some time!");
    }
  }
}
