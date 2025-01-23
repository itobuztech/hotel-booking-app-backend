import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingInput } from "./dto/create-booking.input";
import { BookingStatus, Prisma } from "@prisma/client";
import { UpdateBookingInput } from "./dto/update-booking.input";

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async bookingService(ctx, CreateBookingInput: CreateBookingInput) {
    try {
      const {
        fullName,
        contactNumber,
        image,
        branch,
        roomType,
        roomId,
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
      if (!roomTypeLinkedToBranch) {
        throw new BadRequestException(`Room type is not linked with branch.`);
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
      if (!roomLinkedToBranchRoomtype) {
        throw new BadRequestException(
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
      if (checkInDate > checkOutDate) {
        throw new BadRequestException(
          `Checkout date must be more than checkin date.`
        );
      }

      // Validate if check-in and check-out dates do not collide with other bookings for the same room
      const conflictingBookings = await this.prisma.booking.findMany({
        where: {
          roomId: roomId,
          bookingStatus: {
            notIn: [BookingStatus.CHECKDOUT, BookingStatus.CANCELLED],
          },
          AND: [
            {
              checkInDate: {
                lte: checkOutDate,
              },
            },
            {
              checkOutDate: {
                gte: checkInDate,
              },
            },
          ],
        },
      });

      if (conflictingBookings.length > 0) {
        throw new BadRequestException(
          `The room is already booked for the selected dates.`
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
          finalPrice,
          checkInDate,
          checkOutDate,
          description,
          source: "walk-in",
          bookingStatus: BookingStatus.BOOKED,
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
              id: roomId,
            },
          },
          bookedBy: {
            connect: {
              id: bookedById,
            },
          },
        },
      });

      await this.prisma.bookingStatusHistory.create({
        data: {
          booking: { connect: { id: booking.id } },
          bookedBy: {
            connect: {
              id: bookedById,
            },
          },
          bookingStatus: BookingStatus.BOOKED,
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

  async bookingDetailsService(bookingId) {
    try {
      const { id } = bookingId;

      const Booking = await this.prisma.booking.findUnique({
        where: {
          id,
        },
        include: {
          branch: true,
          upload: true,
          room: true,
          BranchRoomTypeRelation: {
            include: {
              roomType: true,
            },
          },
        },
      });

      if (!Booking) {
        throw new NotFoundException("No booking found!");
      }

      Booking["branchName"] = Booking.branch.name;
      Booking["roomtypeName"] = Booking.BranchRoomTypeRelation.roomType.name;
      Booking["setPrice"] = Number(Booking.BranchRoomTypeRelation.setPrice);
      Booking["offerPrice"] = Number(Booking.BranchRoomTypeRelation.offerPrice);
      Booking["roomNumber"] = Booking.room.roomName;

      if (Booking.uploadId) {
        Booking.upload["fileUrl"] =
          `${process.env.BACKEND_BASE_URL}/uploads/${Booking?.upload?.file}`;

        Booking["image"] = Booking.upload;

        delete Booking.upload;
      }

      delete Booking.branch;
      delete Booking.BranchRoomTypeRelation;
      delete Booking.room;

      return Booking;
    } catch (error) {
      console.error("Error=", error);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error("Internal Server Error. Please try again later.");
      }
    }
  }

  async bookingUpdateService(ctx, UpdateBookingInput: UpdateBookingInput) {
    try {
      const {
        id,
        bookingStatus,
        source,
        fullName,
        contactNumber,
        image,
        branch,
        roomType,
        roomId,
        finalPrice,
        checkInDate,
        checkOutDate,
        description,
      } = UpdateBookingInput;

      const bookedById = ctx.req.user.userId;

      const Booking = await this.prisma.booking.findUnique({
        where: {
          id,
        },
      });

      if (!Booking) {
        throw new NotFoundException("No booking found!");
      }

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
      if (!roomTypeLinkedToBranch) {
        throw new BadRequestException(`Room type is not linked with branch.`);
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
      if (!roomLinkedToBranchRoomtype) {
        throw new BadRequestException(
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
      if (checkInDate > checkOutDate) {
        throw new BadRequestException(
          `Checkout date must be more than checkin date.`
        );
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(contactNumber)) {
        throw new BadRequestException(`Invalid phone number.`);
      }

      // Validate if check-in and check-out dates do not collide with other bookings for the same room
      const conflictingBookings = await this.prisma.booking.findMany({
        where: {
          roomId: roomId,
          bookingStatus: {
            notIn: [BookingStatus.CHECKDOUT, BookingStatus.CANCELLED],
          },
          AND: [
            {
              checkInDate: {
                lte: checkOutDate,
              },
            },
            {
              checkOutDate: {
                gte: checkInDate,
              },
            },
          ],
        },
      });

      if (conflictingBookings.length > 0) {
        throw new BadRequestException(
          `The room is already booked for the selected dates.`
        );
      }

      // Updating Booking

      let updateDataObj: any = {};

      if (Booking.fullName !== fullName) {
        updateDataObj = { ...updateDataObj, fullName };
      }
      if (Booking.contactNumber !== contactNumber) {
        updateDataObj = { ...updateDataObj, contactNumber };
      }
      if (!Booking.finalPrice.equals(new Prisma.Decimal(finalPrice))) {
        updateDataObj = { ...updateDataObj, finalPrice };
      }
      if (
        new Date(Booking.checkInDate).getTime() !==
        new Date(checkInDate).getTime()
      ) {
        updateDataObj = { ...updateDataObj, checkInDate };
      }
      if (
        new Date(Booking.checkOutDate).getTime() !==
        new Date(checkOutDate).getTime()
      ) {
        updateDataObj = { ...updateDataObj, checkOutDate };
      }

      if (Booking.description !== description) {
        updateDataObj = { ...updateDataObj, description };
      }
      if (Booking.source !== source) {
        updateDataObj = { ...updateDataObj, source };
      }
      if (Booking.bookingStatus !== bookingStatus) {
        updateDataObj = { ...updateDataObj, bookingStatus };
      }
      if (Booking.branchId !== branch) {
        updateDataObj = {
          ...updateDataObj,
          branch: {
            connect: {
              id: branch,
            },
          },
        };
      }
      if (Booking.branchRoomTypeRelationId !== roomTypeLinkedToBranch.id) {
        updateDataObj = {
          ...updateDataObj,
          BranchRoomTypeRelation: {
            connect: {
              id: roomTypeLinkedToBranch.id,
            },
          },
        };
      }
      if (Booking.roomId !== roomId) {
        updateDataObj = {
          ...updateDataObj,
          room: {
            connect: {
              id: roomId,
            },
          },
        };
      }
      if (Booking.uploadId !== image) {
        updateDataObj = {
          ...updateDataObj,
          upload: {
            connect: {
              id: image || null,
            },
          },
        };
      }

      if (Object.keys(updateDataObj).length === 0) {
        throw new BadRequestException("There is no data to be updated!");
      }

      // Updating Booking
      await this.prisma.booking.update({
        where: {
          id,
        },
        data: updateDataObj,
      });

      if (Booking.bookingStatus !== bookingStatus) {
        await this.prisma.bookingStatusHistory.create({
          data: {
            booking: { connect: { id } },
            bookedBy: {
              connect: {
                id: bookedById,
              },
            },
            bookingStatus:
              BookingStatus[bookingStatus as keyof typeof BookingStatus],
          },
        });
      }

      return { message: "Booking Updated!" };
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
