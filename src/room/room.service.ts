import { Injectable } from "@nestjs/common";
import { CreateRoomInput } from "./dto/create-room.input";
import { UpdateRoomInput } from "./dto/update-room.input";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomInput: CreateRoomInput) {
    console.log("createRoomInput:", createRoomInput);
    const { roomName, branchRoomTypeId, status } = createRoomInput;
    return await this.prisma.room.create({
      data: {
        roomName,
        branchRoomTypeId,
        status,
      },
    });
  }

  findAll() {
    return `This action returns all room`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomInput: UpdateRoomInput) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
