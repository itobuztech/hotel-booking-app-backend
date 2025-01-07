import { Module } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { BranchResolver } from "./branch.resolver";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  providers: [PrismaService, BranchResolver, BranchService],
})
export class BranchModule {}
