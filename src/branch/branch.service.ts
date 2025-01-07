import { ConflictException, Injectable } from "@nestjs/common";
import { CreateBranchInput } from "./dto/create-branch.input";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";

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
    console.log("paginationArgs: ", paginationArgs);
    console.log("searchInput: ", searchInput);
    const allBranches = await this.prisma.branch.findMany({});

    const filteredBranches = await this.prisma.branch.findMany({
      skip: paginationArgs.skip || 0,
      take: paginationArgs.limit || 10,
      // where: {
      //   name: {
      //     contains: searchInput.search,
      //     mode: "insensitive",
      //   },
      // },
      where: {
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
        ],
      },
    });

    // console.log("filteredBranches: ", filteredBranches);
    console.log({ branches: filteredBranches, total: allBranches.length });

    return filteredBranches;
  }
}
