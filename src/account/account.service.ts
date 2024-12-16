import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ResetPasswordInput } from './dto/reset-password.input';
import { UsersService } from '../users/users.service';
import { UpdateProfileInput } from './dto/update-profile.input';
@Injectable()
export class AccountService {
    constructor(
        private prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly logger: Logger,
    ) { }

    async findOne(ctx: any): Promise<any> {
        const user = await this.usersService.findOneById(ctx.req.user.userId);
        const { password, ...result } = user;
        return result;
    }

    async resetPassword(ctx: any, resetPasswordInput: ResetPasswordInput): Promise<boolean> {
        const user = await this.usersService.findOneById(ctx.req.user.userId);
        const { password, ...result } = user;

        const newPassword = await bcrypt.hash(resetPasswordInput.newPassword, 10);
        const match = await bcrypt.compare(resetPasswordInput.oldPassword, password);
        if (match) await this.usersService.updateUser(ctx.req.user.userId, { password: newPassword });
        else throw new BadRequestException("Password doesn't match");

        return true;
    }

    async update(ctx: any, updateProfileInput: UpdateProfileInput): Promise<boolean> {
        await this.usersService.updateUser(ctx.req.user.userId, { name: updateProfileInput.name, username: updateProfileInput.username });
        return true;
    }
}
