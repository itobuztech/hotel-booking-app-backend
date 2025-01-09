import { ConflictException, Injectable } from "@nestjs/common";
import { CreateBranchInput } from "./dto/create-branch.input";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { BranchListResponse } from "./dto/branch-response";

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) { }

  async create(createBranchInput: CreateBranchInput) {
    const branchNameExists = await this.prisma.branch.findUnique({
      where: { name: createBranchInput.name },
    });

    const contactNumberExists = await this.prisma.branch.findUnique({
      where: { contactNumber: createBranchInput.contactNumber },
    });

    if (branchNameExists) {
      throw new ConflictException("Branch name already exists.");
    }

    if (contactNumberExists) {
      throw new ConflictException("Contact number already exists.");
    }

    return await this.prisma.branch.create({
      data: {
        ...createBranchInput,
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
        ]
      },
      orderBy: {
        createdAt: "desc",
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
}
