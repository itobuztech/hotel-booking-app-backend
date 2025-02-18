import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

// List of models that does not have the `deletedAt` field.
const excludedModels = [
  "Role",
  "Upload",
  "BookingStatusHistory",
  "UploadRelation",
  "BranchRoomTypeAmenitiesRelation",
  "BranchAmenitiesRelation",
  "BookingRoomRelation",
  "Notification",
];

const excludedMasterModels = ["RoomType", "Amenities"];

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    this.$use(this.findQueryMiddleware()); // Applying middleware
    this.$use(this.softDeleteMiddleware()); // Applying middleware
  }

  /**
   * Middleware for handling `find` queries, ensuring soft-deleted records are excluded.
   */
  private findQueryMiddleware(): Prisma.Middleware {
    return async (params, next) => {
      const { model, action, args = {} } = params;

      // Skip models that should not be affected
      if (
        excludedModels.includes(model) ||
        excludedMasterModels.includes(model)
      ) {
        return next(params);
      }

      // If the action is a find query, ensure `deletedAt: null` is applied
      if (["findUnique", "findFirst", "findMany", "count"].includes(action)) {
        if (!args.where) {
          args.where = {};
        }
        args.where.deletedAt = null;
      }

      return next(params);
    };
  }

  // Soft delete middleware
  private softDeleteMiddleware(): Prisma.Middleware {
    return async (params, next) => {
      const { model, action, args = {} } = params;

      // Skip models in the excluded list
      if (excludedModels.includes(model)) {
        return next(params);
      }

      // Handle `delete` action (convert to soft delete)
      if (action === "delete") {
        params.action = "update"; // Convert delete to update
        params.args.data = { deletedAt: new Date() }; // Soft delete by setting `deletedAt`
      }

      // Handle `deleteMany` action (convert to soft delete for multiple records)
      if (action === "deleteMany") {
        params.action = "updateMany"; // Convert deleteMany to updateMany
        if (!params.args.data) {
          params.args.data = {};
        }
        params.args.data.deletedAt = new Date(); // Soft delete by setting `deletedAt`
      }
      return next(params);
    };
  }

  async onModuleInit() {
    await this.$connect(); // Establish Prisma connection on module initialization
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Disconnect Prisma client when module is destroyed
  }
}
