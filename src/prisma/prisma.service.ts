import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

// List of models that have the `deletedAt` column (soft-delete enabled models)
const excludedModels = [
  "Role",
  "Upload",
  "BookingStatusHistory",
  "UploadRelation",
  "BranchRoomTypeAmenitiesRelation",
  "BranchAmenitiesRelation",
];

const excludedMasterModels = ["RoomType", "Amenities"];

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    this.$use(this.softDeleteMiddleware()); // Applying middleware
  }

  // Soft delete middleware
  private softDeleteMiddleware(): Prisma.Middleware {
    return async (params, next) => {
      const { model, action, args = {} } = params;

      // Skip models in the excluded list
      if (excludedModels.includes(model)) {
        return next(params);
      }

      // Helper function to handle `deletedAt` field logic for find queries
      const handleFindQuery = () => {
        if (!args.where) {
          args.where = {};
        }
        // Ensure soft-deleted records are excluded by adding `deletedAt: null`
        args.where.deletedAt = null;
      };

      // Handle `find` queries (findUnique, findFirst, findMany, count) with exclusion of models
      if (
        ["findUnique", "findFirst", "findMany", "count"].includes(action) &&
        !excludedMasterModels.includes(model)
      ) {
        handleFindQuery();
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
