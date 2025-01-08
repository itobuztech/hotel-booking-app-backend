import { ConflictException, Injectable } from "@nestjs/common";
import { CreateBranchInput } from "./dto/create-branch.input";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { BranchListResponse } from "./dto/branch-response";

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

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
    const allBranches = await this.prisma.branch.findMany({});

    let conditions: any = {};
    if (search !== "") {
      conditions["where"] = {
        OR: [
          {
            name: {
              contains: searchInput.search,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: searchInput.search,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: searchInput.search,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: searchInput.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchInput.search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    const filteredBranches = await this.prisma.branch.findMany({
      skip: (paginationArgs.skip - 1) * paginationArgs.limit || 0,
      take: paginationArgs.limit || 10,
      where: conditions.where,
    });

    const branchInfo: BranchListResponse = {
      branches: filteredBranches,
      pagination: {
        totalRecords: allBranches.length,
        totalPages: Math.ceil(allBranches.length / paginationArgs.limit),
        currentPage: paginationArgs.skip,
      },
    };

    return branchInfo;
  }
}
