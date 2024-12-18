import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserRole } from "@prisma/client";
import { UseGuards } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuardOR } from "../auth/guards/permissions-or.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrivilegesList } from "../privileges/user-privileges";
import { UploadFileInput } from "./dto/upload-file-input.dto";
import { UploadFileResponse } from "./dto/upload-file-response.dto";
import { PaginatedFile, File } from "./entities/files.entity";
import { GetUploadedFile } from "./dto/get-upload-file.dto";
import { PaginationArgs } from "src/types/inputtypes/pagination.input";

@Resolver("Video")
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => UploadFileResponse)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.OWNER)
  // @Permissions([PrivilegesList.FILE_MANAGEMENT.CAPABILITIES.CREATE])
  uploadFiles(@Args("uploadFileInput") uploadFileInput: UploadFileInput) {
    return this.uploadService.uploadFiles(uploadFileInput);
  }

  @Query(() => PaginatedFile)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.OWNER)
  // @Permissions([PrivilegesList.FILE_MANAGEMENT.CAPABILITIES.VIEW])
  listFiles(
    @Args("paginationArgs", { nullable: true })
    paginationArgs: PaginationArgs
  ) {
    return this.uploadService.listFiles(paginationArgs);
  }

  @Query(() => File)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.OWNER)
  // @Permissions([PrivilegesList.FILE_MANAGEMENT.CAPABILITIES.VIEW])
  File(@Args("getUploadedFile") getUploadedFile: GetUploadedFile) {
    return this.uploadService.file(getUploadedFile);
  }

  @Mutation(() => String)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuardOR)
  // @Roles(UserRole.OWNER)
  // @Permissions([PrivilegesList.FILE_MANAGEMENT.CAPABILITIES.DELETE])
  deleteFile(@Args("deleteUploadedFile") deleteUploadedFile: GetUploadedFile) {
    return this.uploadService.deleteFile(deleteUploadedFile);
  }
}
