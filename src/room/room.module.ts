import { Module } from "@nestjs/common";
import { RoomService } from "./room.service";
import { RoomResolver } from "./room.resolver";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  providers: [PrismaService, RoomResolver, RoomService],
})
export class RoomModule {}
