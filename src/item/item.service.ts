import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateItemInput } from "./dto/create-item.input";
import { PrismaService } from "../prisma/prisma.service";
import { GraphQLError } from "graphql";
import { SearchPaginationArgs } from "../types/inputtypes/search-pagination.input";
import { SortByFilters } from "../types/inputtypes/sortBy-filters.input";
// import { viewCourseInputArgs } from "./dto/view-item.input";
import { AccountService } from "../account/account.service";
// import { Course as PrismaCourse, Prisma, UserRole } from "@prisma/client";
import { UniqueIdentifierInput } from "../types/inputtypes/unique-id.input";
import { ApolloError } from "apollo-server-express";
// import { courseWishlisted } from "../util/extended-types";
import { createWriteStream } from "fs";
import { Item } from "./entities/item.entity";
import { TableName } from "@prisma/client";

@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(ctx, createItemInput: CreateItemInput) {
    const { name, description, roomInitial, status, entity, png } =
      createItemInput;

    try {
      const item = await this.prisma.item.create({
        data: {
          name,
          description,
          roomInitial,
          entityId: entity,
          status,
        },
      });

      await this.prisma.uploadRelation.create({
        data: {
          imageUploadId: png,
          tableId: item.id,
          table: TableName.ITEM,
        },
      });

      return { message: `Item created succesully with the Id ${item.id}` };
    } catch (error) {
      throw new NotAcceptableException("Item couldn't be created", {
        cause: new Error(),
        description: error,
      });
    }
  }
}
