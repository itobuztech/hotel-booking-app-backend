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
import { Booking } from "./entities/booking.entity";
import { UniqueIdentifierInput } from "src/types/inputtypes/unique-id.input";
import { UpdateBookingInput } from "./dto/update-booking.input";

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
    @Args("UpdateBookingInput")
    UpdateBookingInput: UpdateBookingInput
  ) {
    return this.BookingService.bookingUpdateService(UpdateBookingInput);
  }
}
