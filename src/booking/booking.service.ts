import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingInput } from "./dto/create-booking.input";
import { BookingStatus } from "@prisma/client";

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async bookingCreateService(ctx, CreateBookingInput: CreateBookingInput) {
    try {
      const {
        fullName,
        contactNumber,
        image,
        branch,
        roomType,
        roomId,
        roomNumber,
        finalPrice,
        checkInDate,
        checkOutDate,
        description,
      } = CreateBookingInput;

      const bookedById = ctx.req.user.userId;

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
      const roomTypeLinkedToBranch =
        await this.prisma.branchRoomTypeRelation.findFirst({
          where: {
            branchId: branch,
            roomTypeId: roomType,
          },
        });
      if (roomTypeLinkedToBranch) {
        throw new NotFoundException(`Room type is not linked with branch.`);
      }

      // Validate if room exists
      const roomPresence = await this.prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!roomPresence) {
        throw new NotFoundException(`Room number does not exist.`);
      }

      const roomLinkedToBranchRoomtype = await this.prisma.room.findUnique({
        where: {
          id: roomId,
          branchRoomType: {
            id: roomTypeLinkedToBranch.id,
          },
        },
      });
      if (roomLinkedToBranchRoomtype) {
        throw new NotFoundException(
          `Room is not linked with branch and room type.`
        );
      }

      // Validate if image exists
      if (image) {
        const imagePresence = await this.prisma.upload.findUnique({
          where: { id: image },
        });

        if (!imagePresence) {
          throw new NotFoundException(`Image does not exist.`);
        }
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

      // Creation of booking
      const booking = await this.prisma.booking.create({
        data: {
          fullName,
          contactNumber,
          upload: {
            connect: {
              id: image || null,
            },
          },
          branch: {
            connect: {
              id: branch,
            },
          },
          BranchRoomTypeRelation: {
            connect: {
              id: roomTypeLinkedToBranch.id,
            },
          },
          room: {
            connect: {
              id: roomNumber,
            },
          },
          finalPrice,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          description,
          source: "walk-in",
          roomNumber,
          bookingStatus: BookingStatus.BOOKED,
          bookedBy: {
            connect: {
              id: bookedById,
            },
          },
        },
      });

      return { message: "Booking successfull!" };
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
