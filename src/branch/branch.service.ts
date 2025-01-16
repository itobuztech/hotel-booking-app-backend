import {
  NotFoundException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { CreateBranchInput } from "./dto/create-branch.input";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { GetBranchInput } from "./dto/get-branch.input";
import { DeleteBranchInput } from "./dto/delete-branch.input";
import { UpdateBranchInput } from "./dto/update-branch.input";

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async get(getBranchInput: GetBranchInput) {
    const { id } = getBranchInput;
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: id,
      },
    });
    if (!branch) throw new NotFoundException("Branch not found!");
    return branch;
  }

  async create(createBranchInput: CreateBranchInput) {
    const {
      name,
      address,
      areaPincode,
      city,
      contactNumber,
      description,
      location,
      amenityIds,
      uploadFileIds,
    } = createBranchInput;

    const amenityIdsExist = await this.prisma.amenities.findMany({
      where: {
        id: {
          in: amenityIds,
        },
      },
    });

    if (amenityIdsExist.length !== amenityIds.length) {
      const foundAmenityIds = amenityIdsExist.map((amenityId) => amenityId.id);
      const missingAmenityIds = amenityIds.filter(
        (id) => !foundAmenityIds.includes(id)
      );

      throw new NotFoundException(
        `Amenities not found : ${missingAmenityIds.join(", ")}`
      );
    }

    const amenityIdsArr = amenityIds.map((amenitiesId) => {
      return {
        amenitiesId,
      };
    });

    if (uploadFileIds.length < 4) {
      throw new NotFoundException("Upload atleast 4 files");
    }

    const selectedFiles: any = await this.prisma.upload.findMany({
      where: {
        id: { in: uploadFileIds },
      },
    });

    if (selectedFiles.length !== uploadFileIds.length) {
      const foundFileIds = selectedFiles.map((fileId) => fileId.id);
      const missingFileIds = uploadFileIds.filter(
        (id) => !foundFileIds.includes(id)
      );

      throw new NotFoundException(
        `Files not found : ${missingFileIds.join(", ")}`
      );
    }

    const fileIdsArr = uploadFileIds.map((fileId) => {
      return {
        uploadId: fileId,
      };
    });

    return await this.prisma.branch.create({
      data: {
        name,
        address,
        areaPincode,
        city,
        contactNumber,
        description,
        location,
        BranchAmenitiesRelation: {
          createMany: {
            data: amenityIdsArr,
          },
        },
        UploadRelation: {
          createMany: {
            data: fileIdsArr,
          },
        },
      },
      include: {
        BranchAmenitiesRelation: true,
        UploadRelation: true,
      },
    });
  }

  async list(paginationArgs: PaginationArgs, searchInput: SearchInput) {
    const { search = "" } = searchInput;
    const { limit = 10, skip = 0 } = paginationArgs;
    const currentPage = Math.floor(skip / limit) + 1;
    const recordCount = await this.prisma.branch.count();
    const filteredBranches = await this.prisma.branch.findMany({
      skip: skip,
      take: limit,
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        BranchAmenitiesRelation: true,
        UploadRelation: true,
      },
    });

    return {
      branches: filteredBranches,
      pagination: {
        totalRecords: recordCount,
        totalPages: Math.ceil(recordCount / limit),
        currentPage: currentPage,
      },
    };
  }

  async delete(deleteBranchInput: DeleteBranchInput): Promise<string> {
    const { id } = deleteBranchInput;
    await this.prisma.branch.delete({
      where: {
        id: id,
      },
    });
    return "Branch deleted successfully";
  }

  async update(
    getBranchInput: GetBranchInput,
    updateBranchInput: UpdateBranchInput
  ) {
    const { id } = getBranchInput;
    return await this.prisma.branch.update({
      where: {
        id: id,
      },
      data: updateBranchInput,
    });
  }
}
