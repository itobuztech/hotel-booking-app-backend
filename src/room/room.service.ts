import { Injectable } from "@nestjs/common";
import { CreateRoomInput } from "./dto/create-room.input";
import { UpdateRoomInput } from "./dto/update-room.input";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomInput: CreateRoomInput) {
    console.log("createRoomInput:", createRoomInput);
    const { roomName, branchRoomTypeId } = createRoomInput;
    return await this.prisma.room.create({
      data: {
        roomName,
        branchRoomTypeId,
      },
    });
  }
}
