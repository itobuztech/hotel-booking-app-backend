import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { BranchService } from "./branch.service";
import { Branch } from "./entities/branch.entity";
import { CreateBranchInput } from "./dto/create-branch.input";
import {
  BookingBranchResponse,
  BranchCreationMessage,
  BranchListResponse,
  BranchResponse,
} from "./dto/branch-response";
import { UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { PaginationArgs } from "../types/inputtypes/pagination.input";
import { SearchInput } from "../types/inputtypes/search-input";
import { GetBranchInput } from "./dto/get-branch.input";
import { DeleteBranchInput } from "./dto/delete-branch.input";
import { UpdateBranchInput } from "./dto/update-branch.input";
import { checkIfExists } from "../helpers/custom-decorators/checkIfExists-decorators";
import { Message } from "../types/inputtypes/message.entity";
import { FilterBookingBranchInputs } from "./dto/filter-booking-branch.input";

@Resolver(() => Branch)
export class BranchResolver {
  constructor(private readonly branchService: BranchService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => BranchCreationMessage)
  createBranch(
    @Args("createBranchInput") createBranchInput: CreateBranchInput,
    @checkIfExists("createBranchInputData")
    createBranchInputData: CreateBranchInput
  ) {
    return this.branchService.create(createBranchInput);
  }

  @Query(() => BranchListResponse)
  listBranches(
    @Args("paginationArgs", { nullable: true }) paginationArgs: PaginationArgs,
    @Args("searchInput", { nullable: true }) searchInput: SearchInput
  ) {
    return this.branchService.list(paginationArgs, searchInput);
  }

  @Query(() => [BookingBranchResponse])
  listBookingBranches(
    @Args("filterInput", { nullable: true })
    filterInput: FilterBookingBranchInputs,
    @Args("searchInput", { nullable: true }) searchInput: SearchInput
  ) {
    return this.branchService.listBookingBranches(filterInput, searchInput);
  }

  @Query(() => BranchResponse)
  getBranch(@Args("getBranchInput") getBranchInput: GetBranchInput) {
    return this.branchService.get(getBranchInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => String)
  deleteBranch(
    @Args("deleteBranchInput") deleteBranchInput: DeleteBranchInput
  ) {
    return this.branchService.delete(deleteBranchInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Message)
  updateBranch(
    @Args("getBranchInput") getBranchInput: GetBranchInput,
    @Args("updateBranchInput") updateBranchInput: UpdateBranchInput
  ) {
    return this.branchService.update(getBranchInput, updateBranchInput);
  }
}
