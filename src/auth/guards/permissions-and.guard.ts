import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionsGuardAND implements CanActivate {
    constructor(private reflector: Reflector, private readonly prisma: PrismaService) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;
        const role = await this.prisma.role.findFirst({
            where: {
                userType: user.role.userType
            },
            select: {
                privileges: true
            }
        });


        const privileges = (role.privileges as Prisma.JsonArray);
        return requiredRoles.every(role => privileges.includes(role));
    }
}