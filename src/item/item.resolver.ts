import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserRole } from "@prisma/client";
import { UseGuards } from "@nestjs/common";
import { ItemService } from "./item.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { PrivilegesList } from "../privileges/user-privileges";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CreateItemInput } from "./dto/create-item.input";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { SearchPaginationArgs } from "../types/inputtypes/search-pagination.input";
import { SortByFilters } from "../types/inputtypes/sortBy-filters.input";
import { UniqueIdentifierInput } from "../types/inputtypes/unique-id.input";
// import { ToggleCourseInput } from "./dto/delete-item-input";
// import { FilterCourseInputs } from "./dto/filter-item.input";
import { UpdateItemInput } from "./dto/update-item.input";
import { PaginatedItem } from "./entities/item.entity";
import { createSucess } from "src/types/inputtypes/create-success.entity";
import { FilterItemInput } from "./dto/filter-item.input";
// import { courseWishlisted } from "../util/extended-types";

@Resolver()
export class ItemResolver {
  constructor(private readonly itemService: ItemService) {}

  @Mutation(() => createSucess)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.CREATE])
  itemCreate(
    @Context() ctx,
    @Args("createItemInput") createItemInput: CreateItemInput
  ) {
    return this.itemService.createItem(ctx, createItemInput);
  }

  // @Query(() => PaginatedItem)
  // // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // // @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ENDUSER)
  // // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  // itemListing(
  //   @Context() ctx: any,
  //   @Args("filterArgs", { nullable: true })
  //   filterArgs?: FilterItemInput
  // ) {
  //   return this.itemService.listItems(ctx, filterArgs);
  // }

  // @Query(() => CourseListResponse)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.ADMIN, UserRole.ENDUSER)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.VIEW])
  // viewCourse(
  //   @Context() ctx,
  //   @Args("viewCourseInput")
  //   viewCourseInput: UniqueIdentifierInput
  // ) {
  //   return this.coursesService.viewCourse(ctx, viewCourseInput);
  // }

  // @Mutation(() => Boolean)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  // @Permissions([PrivilegesList.COURSE_MANAGEMENT.CAPABILITIES.DELETE])
  // toggleCourseStatus(
  //   @Context() ctx,
  //   @Args("uniqueIdentifierInput") uniqueIdentifierInput: UniqueIdentifierInput,
  //   @Args("toggleCourseInput") toggleCourseInput: ToggleCourseInput
  // ) {
  //   return this.coursesService.toggleCourseStatus(
  //     ctx,
  //     uniqueIdentifierInput,
  //     toggleCourseInput
  //   );
  // }
}
