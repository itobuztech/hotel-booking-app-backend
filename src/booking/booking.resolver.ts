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

@Resolver()
export class BookingResolver {
  constructor(private readonly BookingService: BookingService) {}

  // Room Creation or Update
  @Mutation(() => Message)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Permissions([PrivilegesList.BOOKING_MANAGEMENT.CAPABILITIES.CREATE])
  bookingCreate(
    @Context() ctx: any,
    @Args("CreateBookingInput")
    CreateBookingInput: CreateBookingInput
  ) {
    return this.BookingService.bookingCreateService(ctx, CreateBookingInput);
  }
}
