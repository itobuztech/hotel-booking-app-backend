import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingInput } from "./dto/create-booking.input";

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async bookingCreateService(CreateBookingInput: CreateBookingInput) {
    try {
    } catch (error) {
      console.error("Error=", error);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try again later.");
      }
    }
  }
}
