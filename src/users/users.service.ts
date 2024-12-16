import { Injectable, UnprocessableEntityException, Logger } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger
  ) { }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({});
  }

  async findOne(email: string): Promise<User & { role: Partial<Role> }> {
    return await this.prisma.user.findFirst({
      where: {
        email
      },
      include: {
        role: {
          select: {
            privileges: true,
            userType: true
          }
        }
      }
    });
  }

  async create(createUserInput: CreateUserInput) {
    const defaultRole = await this.prisma.role.findFirst({
      where: {
        userType: UserRole.USER,
      },
      select: {
        id: true,
      }
    });
    if (!defaultRole) throw new UnprocessableEntityException("Can't find the role related information");
    return await this.prisma.user.create({
      data: {
        email: createUserInput.email,
        username: createUserInput.username,
        password: createUserInput.password,
        roleId: defaultRole.id
      },
      include: {
        role: {
          select: {
            privileges: true,
            userType: true
          }
        },
      }
    });
  }

  async findOneById(id: string): Promise<User & { role: Pick<Role, 'userType' | 'privileges'> }> {
    return await this.prisma.user.findFirst({
      where: {
        id
      },
      include: {
        role: {
          select: {
            userType: true,
            privileges: true
          }
        }
      }
    });
  }

  async updateUser(id: string, data) {
    await this.prisma.user.update({
      where: {
        id
      },
      data
    })
  }
}
