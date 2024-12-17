import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { UploadResolver } from "./upload.resolver";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [UploadController],
  providers: [UploadService, UploadResolver, PrismaService],
})
export class UploadModule {}
