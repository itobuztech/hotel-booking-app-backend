import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { BranchService } from "./branch.service";
import { Branch } from "./entities/branch.entity";
import { CreateBranchInput } from "./dto/create-branch.input";
import { UpdateBranchInput } from "./dto/update-branch.input";
import { BranchResponse } from "./dto/branch-response";
import { UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";

@Resolver(() => Branch)
export class BranchResolver {
  constructor(private readonly branchService: BranchService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => BranchResponse)
  createBranch(
    @Args("createBranchInput") createBranchInput: CreateBranchInput
  ) {
    return this.branchService.create(createBranchInput);
  }
}
