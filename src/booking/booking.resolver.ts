import { Resolver, Mutation, Args, Query, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Message } from "../types/inputtypes/message.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { PrivilegesList } from "../privileges/user-privileges";
import { CreateBookingInput } from "./dto/create-booking.input";
import { BookingService } from "./booking.service";
import { Booking, PaginatedBooking } from "./entities/booking.entity";
import { UniqueIdentifierInput } from "src/types/inputtypes/unique-id.input";
import { UpdateBookingInput } from "./dto/update-booking.input";
import { PaginationArgs } from "src/types/inputtypes/pagination.input";
import { FilterBookingInputs } from "./dto/filter-booking.input";
import { SortBookingInputs } from "./dto/sort-booking.input";
import { PaginatedNotification } from "./entities/notification.entity";

@Resolver()
export class BookingResolver {
  constructor(private readonly BookingService: BookingService) {}

  //Booking create
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.CREATE])
  booking(
    @Context() ctx: any,
    @Args("CreateBookingInput")
    CreateBookingInput: CreateBookingInput
  ) {
    return this.BookingService.bookingService(ctx, CreateBookingInput);
  }

  // Booking Listing
  @Query(() => PaginatedBooking)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.VIEW])
  bookingList(
    @Args("searchText", { nullable: true }) searchText: string,
    @Args("paginationArgs", { nullable: true }) paginationArgs: PaginationArgs,
    @Args("filterArgs", { nullable: true })
    filterArgs: FilterBookingInputs,
    @Args("sortInputs", { nullable: true })
    sortInputs: SortBookingInputs
  ) {
    return this.BookingService.bookingListService(
      paginationArgs,
      searchText,
      filterArgs,
      sortInputs
    );
  }

  // Booking details
  @Query(() => Booking)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.VIEW])
  bookingDetails(
    @Args("bookingId")
    bookingId: UniqueIdentifierInput
  ) {
    return this.BookingService.bookingDetailsService(bookingId);
  }

  // Booking update
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.EDIT])
  bookingUpdate(
    @Context() ctx: any,
    @Args("UpdateBookingInput")
    UpdateBookingInput: UpdateBookingInput
  ) {
    return this.BookingService.bookingUpdateService(ctx, UpdateBookingInput);
  }

  // Notification List
  @Query(() => PaginatedNotification)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.VIEW])
  notifications(@Context() ctx: any) {
    return this.BookingService.notificationsService(ctx);
  }

  // Notification read
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.EDIT])
  notificationsRead(
    @Args("notificationId")
    notificationId: UniqueIdentifierInput
  ) {
    return this.BookingService.notificationsReadService(notificationId);
  }
}
