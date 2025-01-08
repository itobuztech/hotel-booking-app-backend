import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { BranchService } from "./branch.service";
import { Branch } from "./entities/branch.entity";
import { CreateBranchInput } from "./dto/create-branch.input";
import { BranchListResponse, BranchResponse } from "./dto/branch-response";
import { UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Query(() => BranchListResponse)
  listBranches(
    @Args("paginationArgs", { nullable: true }) paginationArgs: PaginationArgs,
    @Args("searchInput", { nullable: true }) searchInput: SearchInput
  ) {
    return this.branchService.list(paginationArgs, searchInput);
  }
}
