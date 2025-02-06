import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingResolver } from "./booking.resolver";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [EmailModule],
  providers: [PrismaService, BookingResolver, BookingService],
})
export class BookingModule {}
