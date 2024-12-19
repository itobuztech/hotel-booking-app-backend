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
    const { name, description, roomInitial, status, entity, image } =
      createItemInput;

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

    try {
      let item = null;
      try {
        item = await this.prisma.item.create({
          data: {
            name,
            description,
            roomInitial,
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

      try {
        await this.prisma.uploadRelation.create({
          data: {
            imageUploadId: image,
            tableId: item.id,
            table: TableName.ITEM,
          },
        });
      } catch (error) {
        console.log("Error=", error);
        throw new Error("Upload relation creation error!");
      }

      return { message: `Item created succesully with the Id ${item.id}` };
    } catch (error) {
      throw error;
    }
  }

  async listEntity() {
    try {
      const entities = await this.prisma.entity.findMany();

      return { entities, total: entities.length };
    } catch (error) {
      throw error;
    }
  }

  async listItem(filterArgs: FilterItemInput) {
    let extraWhere = null;

    if (filterArgs) {
      const { entity } = filterArgs;

      // Validate if the entityId exists
      const entityPresence = await this.prisma.entity.findUnique({
        where: { id: entity },
      });
      if (!entityPresence) {
        throw new NotFoundException(`Entity ID does not exist.`);
      } else {
        extraWhere = { entityId: entity };
      }
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
        item.uploadRelation[0].upload[
          "fileUrl"
        ] = `${process.env.BACKEND_BASE_URL}/uploads/${item.uploadRelation[0].upload.file}`;
        item["image"] = item.uploadRelation[0].upload;
      });

      return { items, total: items.length };
    } catch (error) {
      throw error;
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

      // Item image realation added
      item.uploadRelation[0].upload[
        "fileUrl"
      ] = `${process.env.BACKEND_BASE_URL}/uploads/${item.uploadRelation[0].upload.file}`;
      item["image"] = item.uploadRelation[0].upload;

      // Check if item exists
      if (!item) {
        throw new NotFoundException("No item found with this ID!");
      }

      return item;
    } catch (error) {
      throw error;
    }
  }
}
