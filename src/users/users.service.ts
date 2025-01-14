import {
  Injectable,
  UnprocessableEntityException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, User, Role, UserRole } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger
  ) {}

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({});
  }

  async findOne(email: string): Promise<User & { role: Partial<Role> }> {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        role: {
          select: {
            privileges: true,
            userType: true,
          },
        },
      },
    });
  }

  async create(createUserInput) {
    console.log("createUserInput", createUserInput);

    const defaultRole = await this.prisma.role.findFirst({
      where: {
        userType: UserRole.CUSTOMER,
      },
      select: {
        id: true,
      },
    });
    if (!defaultRole)
      throw new UnprocessableEntityException(
        "Can't find the role related information"
      );
    return await this.prisma.user.create({
      data: {
        email: createUserInput.email,
        username: createUserInput.username,
        password: createUserInput.password,
        emailConfirmationToken: createUserInput.confirmationToken,
        roleId: defaultRole.id,
      },
      include: {
        role: {
          select: {
            privileges: true,
            userType: true,
          },
        },
      },
    });
  }

  async findOneById(
    id: string
  ): Promise<User & { role: Pick<Role, "userType" | "privileges"> }> {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        role: {
          select: {
            userType: true,
            privileges: true,
          },
        },
      },
    });
  }

  async updateUser(id: string, data) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async findOneByToken(
    emailConfirmationToken: string
  ): Promise<User & { role: Partial<Role> }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          emailConfirmationToken,
        },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new Error(
          "Their is no user with this token Or the token has expired Or The user is already confirmed!!"
        );
      }

      const confirmingUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailConfirmationToken: "",
          isEmailConfirmed: true,
        },
      });

      if (!confirmingUser) {
        throw new Error("User not confirmed. Please try after some time!");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
