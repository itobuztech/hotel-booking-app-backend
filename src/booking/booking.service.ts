import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingInput } from "./dto/create-booking.input";
import { BookingStatus, Prisma } from "@prisma/client";
import { UpdateBookingInput } from "./dto/update-booking.input";
import { log } from "console";
import { PaginationArgs } from "src/types/inputtypes/pagination.input";
import { FilterBookingInputs } from "./dto/filter-booking.input";
import { SortBookingInputs } from "./dto/sort-booking.input";
import { GraphQLError } from "graphql";

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

      // Validate if check-in date is today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison
      if (new Date(checkInDate) < today) {
        throw new BadRequestException(
          `Check-in date must be today or in the future.`
        );
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

      // Validate if check-in date is today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison
      if (new Date(checkInDate) < today) {
        throw new BadRequestException(
          `Check-in date must be today or in the future.`
        );
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

      // Updating Booking
      let updateDataObj: any = {};

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
            {
              id: {
                not: id,
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

  // This is the function that returns the Custom Where Clause. STARTS.
  async generatingWhereClause({ ...whereArgs }) {
    const {
      searchText = null,
      sortInputs = null,
      filterArgs = null,
    } = whereArgs;

    try {
      let sortBy = [];
      if (sortInputs) {
        sortBy = Object.keys(sortInputs).map((key) => {
          return {
            [key]: sortInputs[key],
          };
        });
      }

      const searchQuery = [];
      if (searchText) {
        searchQuery.push(
          {
            fullName: {
              contains: searchText,
              mode: "insensitive",
            },
          },
          {
            branch: {
              name: {
                contains: searchText,
                mode: "insensitive",
              },
            },
          },
          {
            room: {
              roomName: {
                contains: searchText,
                mode: "insensitive",
              },
            },
          }
        );
      }

      let where = {};
      if (filterArgs) {
        const {
          branch,
          bookingDate,
          roomType,
          checkInDate,
          checkOutDate,
          bookingStatus,
        } = filterArgs;

        if (branch) {
          where = { ...where, branchId: branch };
        }

        if (bookingDate) {
          where = { ...where, createdAt: new Date(bookingDate) };
        }

        if (roomType) {
          where = {
            ...where,
            BranchRoomTypeRelation: { roomTypeId: roomType },
          };
        }

        if (checkInDate) {
          where = { ...where, checkInDate: { gte: new Date(checkInDate) } };
        }

        if (checkOutDate) {
          where = { ...where, checkOutDate: { lte: new Date(checkOutDate) } };
        }

        if (bookingStatus) {
          where = { ...where, bookingStatus };
        }
      }

      if (searchQuery.length > 0) {
        where = { ...where, OR: searchQuery };
      }

      return { where, sortBy };
    } catch (error) {
      console.log("Error:", error);
      throw new GraphQLError(
        "Internal Server Error. Please try after sometime!"
      );
    }
  }
  // This is the function that returns the Custom Where Clause. ENDS.

  async bookingListService(
    paginationArgs: PaginationArgs,
    searchText,
    filterArgs: FilterBookingInputs,
    sortInputs: SortBookingInputs
  ) {
    try {
      const { skip = 0, limit = 10 } = paginationArgs || {};

      const whereClause = await this.generatingWhereClause({
        searchText,
        sortInputs,
        filterArgs,
      });

      let { where, sortBy } = whereClause;

      const bookingCount = await this.prisma.booking.count({
        where,
      });

      let searchObject: any = {
        skip,
        take: limit,
        where,
        include: {
          branch: true,
          room: true,
          BranchRoomTypeRelation: {
            include: {
              roomType: true,
            },
          },
        },
      };

      const bookings: any = await this.prisma.booking.findMany({
        ...searchObject,
        orderBy: sortBy || { updatedAt: "desc" },
      });

      if (bookings.length > 0) {
        bookings?.map((booking) => {
          booking["branchName"] = booking?.branch?.name;
          booking["roomtypeName"] =
            booking?.BranchRoomTypeRelation?.roomType.name;
          booking["setPrice"] = Number(
            booking?.BranchRoomTypeRelation?.setPrice
          );
          booking["offerPrice"] = Number(
            booking?.BranchRoomTypeRelation?.offerPrice
          );
          booking["roomNumber"] = booking?.room?.roomName;
        });
      }

      return { bookings, total: bookingCount };
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
