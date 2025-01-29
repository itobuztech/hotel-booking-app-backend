import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { ResetPasswordInput } from "./dto/reset-password.input";
import { UsersService } from "../users/users.service";
import { UpdateProfileInput } from "./dto/update-profile.input";

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly logger: Logger
  ) {}

  async findOne(ctx: any): Promise<any> {
    const user = await this.usersService.findOneById(ctx.req.user.userId);

    user["image"] = user?.UploadRelation[0]?.upload
      ? {
          id: user?.UploadRelation[0]?.upload?.id,
          file: user?.UploadRelation[0]?.upload?.file,
          fileUrl: `${process.env.BACKEND_BASE_URL}/uploads/${user?.UploadRelation[0]?.upload?.file}`,
        }
      : null;

    const { password, ...result } = user;
    return result;
  }

  async resetPassword(
    ctx: any,
    resetPasswordInput: ResetPasswordInput
  ): Promise<boolean> {
    const user = await this.usersService.findOneById(ctx.req.user.userId);
    const { password, ...result } = user;

    const newPassword = await bcrypt.hash(resetPasswordInput.newPassword, 10);
    const match = await bcrypt.compare(
      resetPasswordInput.oldPassword,
      password
    );
    if (match)
      await this.usersService.updateUser(ctx.req.user.userId, {
        password: newPassword,
      });
    else throw new BadRequestException("Password doesn't match");

    return true;
  }

  async update(
    ctx: any,
    updateProfileInput: UpdateProfileInput
  ): Promise<boolean> {
    try {
      await this.usersService.updateUser(ctx.req.user.userId, {
        username: updateProfileInput?.username,
        contactNumber: updateProfileInput?.contactNumber,
      });

      if (updateProfileInput?.image) {
        const imagePresence = await this.prisma.upload.findUnique({
          where: { id: updateProfileInput.image },
        });

        if (!imagePresence) {
          throw new NotFoundException(`Image does not exist.`);
        }

        const previouslyUpload = await this.prisma.uploadRelation.findFirst({
          where: {
            userId: ctx.req.user.userId,
          },
        });

        if (previouslyUpload) {
          await this.prisma.uploadRelation.update({
            where: {
              id: previouslyUpload.id,
            },
            data: {
              userId: ctx.req.user.userId,
              uploadId: updateProfileInput.image,
            },
          });
        } else {
          await this.prisma.uploadRelation.create({
            data: {
              userId: ctx.req.user.userId,
              uploadId: updateProfileInput.image,
            },
          });
        }
      }

      return true;
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
