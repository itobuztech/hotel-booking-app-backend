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
      const {
        fullName,
        contactNumber,
        image,
        branch,
        roomType,
        roomNumber,
        setPrice,
        offerPrice,
        checkInDate,
        checkOutDate,
        description,
      } = CreateBookingInput;

      // Validate if branch exists
      const branchPresence = await this.prisma.branch.count({
        where: { id: branch },
      });
      if (!branchPresence) {
        throw new NotFoundException(`Branch does not exist.`);
      }

      // Validate if room type exists
      const roomTypePresence = await this.prisma.roomType.findUnique({
        where: { id: roomType },
      });
      if (!roomTypePresence) {
        throw new NotFoundException(`Room type does not exist.`);
      }

      // Validate if room exists
      const roomPresence = await this.prisma.roomType.findUnique({
        where: { id: roomNumber },
      });
      if (!roomPresence) {
        throw new NotFoundException(`Room number does not exist.`);
      }

      // Validate if image exists
      const imagePresence = await this.prisma.upload.findUnique({
        where: { id: image },
      });

      if (!imagePresence) {
        throw new NotFoundException(`Image does not exist.`);
      }

      // Validate if checkout date more than check in date.
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      if (checkIn > checkOut) {
        throw new BadRequestException(
          `Checkout date must be more than checkin date.`
        );
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(contactNumber)) {
        throw new BadRequestException(`Invalid phone number.`);
      }
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
