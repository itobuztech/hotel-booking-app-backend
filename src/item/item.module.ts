import { Module } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ItemResolver } from "./item.resolver";
import { PrismaService } from "../prisma/prisma.service";
import { AccountService } from "../account/account.service";
import { UsersService } from "../users/users.service";
import { LoggerModule } from "../logger/app-logger.module";

@Module({
  imports: [LoggerModule],
  providers: [
    ItemResolver,
    ItemService,
    PrismaService,
    AccountService,
    UsersService,
  ],
})
export class ItemModule {}
