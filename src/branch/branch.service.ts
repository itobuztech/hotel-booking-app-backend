import { ConflictException, Injectable } from "@nestjs/common";
import { CreateBranchInput } from "./dto/create-branch.input";
import { UpdateBranchInput } from "./dto/update-branch.input";
import { PrismaService } from "../prisma/prisma.service";

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
}
