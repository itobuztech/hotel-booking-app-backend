import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { Express, Response, Request } from "express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { UploadVideoInput } from "./dto/upload-video-input.dto";
import { Context } from "@nestjs/graphql";
import { diskStorage } from "multer";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(FileInterceptor('file'))
  // @UsePipes(new ValidationPipe({ transform: true }))
  // @Post('/upload-video')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // async uploadVideo(
  //   @Context() ctx: any,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 150 * 1024 * 1024 }), // Max file size: 150 MB
  //         new FileTypeValidator({ fileType: 'video/mp4' }), // Only mp4 files allowed
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  //   @Body() uploadVideoInput: UploadVideoInput,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const uploadResponse = await this.uploadService.uploadVideo(
  //       ctx,
  //       file,
  //       uploadVideoInput,
  //     );
  //     res.status(HttpStatus.CREATED).json({
  //       message: 'Video started uploading...',
  //       video: {
  //         ...uploadResponse,
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     throw new BadRequestException('Error uploading video');
  //   }
  // }
}
