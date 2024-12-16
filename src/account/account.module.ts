import { Logger, Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountResolver } from './account.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [],
  providers: [AccountResolver, AccountService, PrismaService, Logger, UsersService]
})
export class AccountModule { }
