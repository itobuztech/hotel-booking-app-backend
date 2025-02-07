import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingInput } from "./dto/create-booking.input";
import { BookingStatus, Prisma, UserRole } from "@prisma/client";
import { UpdateBookingInput } from "./dto/update-booking.input";
import { PaginationArgs } from "src/types/inputtypes/pagination.input";
import { FilterBookingInputs } from "./dto/filter-booking.input";
import { SortBookingInputs } from "./dto/sort-booking.input";
import { GraphQLError } from "graphql";
import { EmailService } from "../email/email.service";

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async bookingService(ctx, CreateBookingInput: CreateBookingInput) {
    try {
      const {
        fullName,
        contactNumber,
        image,
        branch,
        roomType,
        roomIds,
        finalPrice,
        checkInDate,
        checkOutDate,
        description,
        email,
        region = "",
        numberOfRooms,
      } = CreateBookingInput;

      const bookedById = ctx.req.user.userId;
      const loggedInUserRole = ctx.req.user.role.userType;

      // Validate if branch exists
      const branchPresence = await this.prisma.branch.findUnique({
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

      // Validate each room for adimin login
      if (loggedInUserRole === "ADMIN") {
        if (roomIds.length === 0) {
          throw new BadRequestException(`Need to assign rooms!`);
        }
        if (roomIds.length !== numberOfRooms) {
          throw new BadRequestException(
            `Need to assign rooms as per number of rooms given!`
          );
        }

        for (const roomId of roomIds) {
          const roomPresence = await this.prisma.room.findUnique({
            where: { id: roomId },
          });
          if (!roomPresence) {
            throw new NotFoundException(`Some/One Room number does not exist.`);
          }

          const roomLinkedToBranchRoomtype = await this.prisma.room.findFirst({
            where: {
              id: roomId,
              branchRoomType: {
                id: roomTypeLinkedToBranch.id,
              },
            },
          });
          if (!roomLinkedToBranchRoomtype) {
            throw new BadRequestException(
              `Room ${roomPresence.roomName} is not linked with branch and room type.`
            );
          }

          // Validate if room is available for the selected dates
          const conflictingBookings =
            await this.prisma.bookingRoomRelation.findFirst({
              where: {
                roomId, // If roomId is an array, check multiple rooms
                booking: {
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
              },
              include: {
                booking: true, // Ensures we fetch related booking details
              },
            });

          if (conflictingBookings) {
            throw new BadRequestException(
              `Room ${roomPresence.roomName} is already booked for the selected dates.`
            );
          }
        }
      }

      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(contactNumber)) {
        throw new BadRequestException(`Invalid phone number.`);
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

      // Validate check-in and check-out dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(checkInDate) < today) {
        throw new BadRequestException(
          `Check-in date must be today or in the future.`
        );
      }
      if (checkInDate > checkOutDate) {
        throw new BadRequestException(
          `Checkout date must be more than checkin date.`
        );
      }

      const booking = await this.prisma.booking.create({
        data: {
          fullName,
          contactNumber,
          finalPrice,
          checkInDate,
          checkOutDate,
          description,
          source: loggedInUserRole === "CUSTOMER" ? "online" : "walk-in",
          bookingStatus: BookingStatus.BOOKED,
          email,
          region,
          numberOfRooms,
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
          bookedBy: {
            connect: {
              id: bookedById,
            },
          },
        },
      });

      let finalRooms = null;
      if (loggedInUserRole === "ADMIN") {
        const roomRelationData = roomIds.map((roomId) => {
          return {
            roomId,
            bookingId: booking.id,
          };
        });

        const roomsCreated =
          await this.prisma.bookingRoomRelation.createManyAndReturn({
            data: roomRelationData,
            include: {
              room: {
                select: {
                  roomName: true,
                },
              },
            },
          });

        finalRooms = roomsCreated.map((rooms) => {
          return rooms.room.roomName;
        });
      }

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

      await this.prisma.notification.create({
        data: {
          bookedById,
          userType:
            loggedInUserRole === "ADMIN" ? UserRole.ADMIN : UserRole.CUSTOMER,
          bookingId: booking.id,
          description: `Booking request generated from ${loggedInUserRole === "ADMIN" ? "walk-in" : "online"} for ${branchPresence.name} branch ${loggedInUserRole === "ADMIN" ? `of room ${[...finalRooms]}` : ""}`,
          customerNumber: contactNumber,
          customerEmail: email,
        },
      });

      const rawCheckInDate = new Date(checkInDate);
      const formattedCheckedInDate = rawCheckInDate.toLocaleDateString("en-GB"); // en-GB uses DD/MM/YYYY
      const rawCheckOutDate = new Date(checkOutDate);
      const formattedCheckedOutDate =
        rawCheckOutDate.toLocaleDateString("en-GB"); // en-GB uses DD/MM/YYYY

      const subject = "Booking request!";
      const body = `<p>Hello ${fullName},</p> 
        <p>Your booking request for the ${branchPresence.name} branch for ${numberOfRooms} ${numberOfRooms === 1 ? "room" : "rooms"} from date ${formattedCheckedInDate} to ${formattedCheckedOutDate} is generated successfully.
        <p>You will get a call from your branch shortly.</p>
        <p>Best regards,<br>The Hotel Management Team</p>
        `;

      const emailSent = await this.emailService.run(email, subject, body);

      if (!emailSent) {
        throw new Error(
          "No Confirmation email is sent. Please try again after some time!"
        );
      }

      return { message: "Bookings successful!" };
    } catch (error) {
      console.error("Error=", error);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(
          "Internal Server Error. Please try again later."
        );
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
          branch: {
            select: { id: true, name: true },
          },
          upload: true,
          BookingRoomRelation: {
            select: { roomId: true, room: true },
          },
          BranchRoomTypeRelation: {
            include: {
              roomType: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!Booking) {
        throw new NotFoundException("No booking found!");
      }

      Booking["roomType"] = Booking.BranchRoomTypeRelation.roomType;
      Booking["setPrice"] = Number(Booking.BranchRoomTypeRelation.setPrice);
      Booking["offerPrice"] = Number(Booking.BranchRoomTypeRelation.offerPrice);
      Booking["roomNumbers"] =
        Booking?.BookingRoomRelation?.length > 0
          ? Booking?.BookingRoomRelation.map((room) => {
              return {
                id: room?.roomId,
                roomNumber: room?.room?.roomName,
              };
            })
          : [];

      if (Booking.uploadId) {
        Booking.upload["fileUrl"] =
          `${process.env.BACKEND_BASE_URL}/uploads/${Booking?.upload?.file}`;

        Booking["image"] = Booking.upload;

        delete Booking.upload;
      }

      delete Booking.BranchRoomTypeRelation;
      delete Booking.BookingRoomRelation;

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

  private async getNotIdenticalElements<T>(
    array1: T[],
    array2: T[]
  ): Promise<T[]> {
    return array1.filter((item) => !array2.includes(item));
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
        roomIds,
        finalPrice,
        checkInDate,
        checkOutDate,
        description,
        numberOfRooms,
        email,
      } = UpdateBookingInput;

      const bookedById = ctx.req.user.userId;

      const Booking = await this.prisma.booking.findUnique({
        where: {
          id,
        },
        include: {
          BookingRoomRelation: true,
        },
      });

      if (!Booking) {
        throw new NotFoundException("No booking found!");
      }

      const BookedRoomIds = Booking.BookingRoomRelation.map((relation) => {
        return relation.roomId;
      });

      // Validate if branch exists
      const branchPresence = await this.prisma.branch.findUnique({
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

      let updatedRooms = [];
      if (roomIds.length !== numberOfRooms) {
        throw new BadRequestException(
          `Need to assign rooms as per number of rooms given!`
        );
      }
      // Validate if room exists
      for (const roomId of roomIds) {
        const roomPresence = await this.prisma.room.findUnique({
          where: { id: roomId },
        });
        if (!roomPresence) {
          throw new NotFoundException(`Some/One Room number does not exist.`);
        }

        const roomLinkedToBranchRoomtype = await this.prisma.room.findFirst({
          where: {
            id: roomId,
            branchRoomType: {
              id: roomTypeLinkedToBranch.id,
            },
          },
        });
        if (!roomLinkedToBranchRoomtype) {
          throw new BadRequestException(
            `Room ${roomPresence.roomName} is not linked with branch and room type.`
          );
        }

        // Validate if room is available for the selected dates
        const conflictingBookings =
          await this.prisma.bookingRoomRelation.findFirst({
            where: {
              roomId, // If roomId is an array, check multiple rooms
              booking: {
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
            },
            include: {
              booking: true, // Ensures we fetch related booking details
            },
          });

        if (conflictingBookings) {
          throw new BadRequestException(
            `Room ${roomPresence.roomName} is already booked for the selected dates.`
          );
        }

        if (!BookedRoomIds.includes(roomId)) {
          updatedRooms.push(roomId);
        }
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

      if (Booking.fullName !== fullName) {
        updateDataObj = { ...updateDataObj, fullName };
      }
      if (Booking.email !== email) {
        updateDataObj = { ...updateDataObj, email };
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

      if (
        Object.keys(updateDataObj).length === 0 &&
        updatedRooms.length === 0
      ) {
        throw new BadRequestException("There is no data to be updated!");
      }

      // Updating Booking
      if (Object.keys(updateDataObj).length !== 0) {
        await this.prisma.booking.update({
          where: {
            id,
          },
          data: updateDataObj,
        });
      }

      if (updatedRooms.length !== 0) {
        const roomsToLink = await this.getNotIdenticalElements(
          roomIds,
          BookedRoomIds
        );
        const roomsToDlink = await this.getNotIdenticalElements(
          BookedRoomIds,
          roomIds
        );

        // Create Images
        if (roomsToLink.length > 0) {
          const roomsLinkArr = roomsToLink.map((room) => {
            return {
              roomId: room,
              bookingId: id,
            };
          });

          await this.prisma.bookingRoomRelation.createMany({
            data: roomsLinkArr,
          });
        }
        // Delete Images
        if (roomsToDlink.length > 0) {
          const roomsDlinkArr = roomsToDlink.map((room) => {
            return {
              roomId: room,
              bookingId: id,
            };
          });

          await this.prisma.bookingRoomRelation.deleteMany({
            where: {
              OR: roomsDlinkArr,
            },
          });
        }
      }

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

        const bookedRooms = await this.prisma.bookingRoomRelation.findMany({
          where: {
            bookingId: id,
          },
          include: {
            room: {
              select: {
                roomName: true,
              },
            },
          },
        });

        const finalRooms = bookedRooms.map((rooms) => {
          return rooms.room.roomName;
        });

        await this.prisma.notification.create({
          data: {
            bookedById,
            userType: UserRole.ADMIN,
            bookingId: id,
            description: `The booking status is being changed from ${Booking.bookingStatus} to ${bookingStatus} for ${branchPresence.name} branch of room ${[...finalRooms]}.`,
            customerNumber: contactNumber,
          },
        });

        const rawCheckInDate = new Date(checkInDate);
        const formattedCheckedInDate =
          rawCheckInDate.toLocaleDateString("en-GB"); // en-GB uses DD/MM/YYYY
        const rawCheckOutDate = new Date(checkOutDate);
        const formattedCheckedOutDate =
          rawCheckOutDate.toLocaleDateString("en-GB"); // en-GB uses DD/MM/YYYY

        const subject = "Booking status changed!";
        const body = `<p>Hello ${fullName},</p> 
        <p>Your booking status for the ${branchPresence.name} branch for ${numberOfRooms} ${numberOfRooms === 1 ? "room" : "rooms"} from date ${formattedCheckedInDate} to ${formattedCheckedOutDate} is being changed from ${Booking.bookingStatus} to ${bookingStatus}.
        <p>Best regards,<br>The Hotel Management Team</p>
        `;

        const emailSent = await this.emailService.run(email, subject, body);

        if (!emailSent) {
          throw new Error(
            "No Confirmation email is sent. Please try again after some time!"
          );
        }
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

  // This is the function that returns the Custom BookingList Where Clause. STARTS.
  async generatingBookingListWhereClause({ ...whereArgs }) {
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
  // This is the function that returns the Custom BookingList Where Clause. ENDS.

  async bookingListService(
    paginationArgs: PaginationArgs,
    searchText,
    filterArgs: FilterBookingInputs,
    sortInputs: SortBookingInputs
  ) {
    try {
      let { skip = 0, limit = 10 } = paginationArgs || {};
      skip = skip ?? 0;
      limit = limit ?? 10;

      const whereClause = await this.generatingBookingListWhereClause({
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
          BranchRoomTypeRelation: {
            include: {
              roomType: true,
            },
          },
          BookingRoomRelation: {
            select: { roomId: true, room: true },
          },
        },
      };

      const bookings: any = await this.prisma.booking.findMany({
        ...searchObject,
        orderBy: sortBy || { updatedAt: "desc" },
      });

      if (bookings.length > 0) {
        bookings?.map((booking) => {
          booking["roomType"] = booking.BranchRoomTypeRelation.roomType;
          booking["setPrice"] = Number(
            booking?.BranchRoomTypeRelation?.setPrice
          );
          booking["offerPrice"] = Number(
            booking?.BranchRoomTypeRelation?.offerPrice
          );
          booking["roomNumbers"] =
            booking?.BookingRoomRelation?.length > 0
              ? booking?.BookingRoomRelation?.map((room) => {
                  return {
                    id: room?.roomId,
                    roomNumber: room?.room?.roomName,
                  };
                })
              : [];
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

  async notificationsService(ctx) {
    try {
      const notifications = await this.prisma.notification.findMany({
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          status: "asc", // Assuming 'false' is represented as 0 and 'true' as 1
        },
      });
      const unreadNotificationCount = await this.prisma.notification.count({
        where: { status: false },
      });

      return {
        notifications,
        total: notifications.length,
        unreadNotificationCount,
      };
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

  async notificationsReadService(notificationId) {
    try {
      const { id } = notificationId;

      const notificationPresent = await this.prisma.notification.count({
        where: {
          id,
        },
      });

      if (!notificationPresent) {
        throw new NotFoundException("No notification found with this ID!");
      }

      await this.prisma.notification.update({
        where: {
          id,
        },
        data: {
          status: true,
        },
      });

      return { message: "Notification read." };
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

  // This is the function that returns the Custom BookingList Where Clause. STARTS.
  async generatingBookingCalenderWhereClause({ ...whereArgs }) {
    const { searchText = null, filterArgs = null } = whereArgs;

    try {
      const searchQuery = [];
      if (searchText) {
        searchQuery.push({
          roomName: {
            contains: searchText,
            mode: "insensitive",
          },
        });
      }

      let where = {};
      if (filterArgs) {
        const { branch, roomType, bookingStatus } = filterArgs;

        if (branch) {
          where = {
            ...where,
            branchRoomType: { branchId: branch },
          };
        }

        if (roomType) {
          where = {
            ...where,
            branchRoomType: { roomTypeId: roomType },
          };
        }

        if (bookingStatus) {
          where = {
            ...where,
            BookingRoomRelation: { booking: { bookingStatus } },
          };
        }
      }

      if (searchQuery.length > 0) {
        where = { ...where, OR: searchQuery };
      }

      return { where };
    } catch (error) {
      console.log("Error:", error);
      throw new GraphQLError(
        "Internal Server Error. Please try after sometime!"
      );
    }
  }
  // This is the function that returns the Custom BookingList Where Clause. ENDS.

  async bookingCalenderService(searchText, filterArgs) {
    try {
      const whereClause = await this.generatingBookingCalenderWhereClause({
        searchText,
        filterArgs,
      });

      let { where } = whereClause;

      const BookingCalender: any = await this.prisma.room.findMany({
        where,
        select: {
          id: true,
          roomName: true,
          createdAt: true,
          branchRoomType: {
            select: {
              branch: {
                select: { id: true, name: true },
              },
              roomType: {
                select: { id: true, name: true, roomInitial: true },
              },
            },
          },
          BookingRoomRelation: {
            select: {
              booking: {
                select: {
                  id: true,
                  fullName: true,
                  checkInDate: true,
                  checkOutDate: true,
                  bookingStatus: true,
                },
              },
            },
          },
        },
      });

      if (BookingCalender.length > 0) {
        BookingCalender.map((room) => {
          room["branch"] = room?.branchRoomType?.branch;
          room["roomType"] = room?.branchRoomType?.roomType;
          room["booking"] = room?.BookingRoomRelation?.map((booking) => {
            return booking.booking;
          });

          delete room?.branchRoomType;
          delete room?.BookingRoomRelation;
        });
      }

      return BookingCalender;
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
