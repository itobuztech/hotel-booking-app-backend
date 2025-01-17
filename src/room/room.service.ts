import { Injectable } from "@nestjs/common";
import { CreateRoomInput } from "./dto/create-room.input";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createRoomInput: CreateRoomInput) {
    const { roomName, branchRoomTypeId } = createRoomInput;
    return await this.prisma.room.create({
      data: {
        roomName,
        branchRoomTypeId,
      },
    });
  }
}
