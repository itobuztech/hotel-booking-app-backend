import { Logger, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerModule } from '../logger/app-logger.module';

@Module({
  imports: [LoggerModule, LoggerModule],
  providers: [EmailService, PrismaService],
  exports: [EmailService],
})
export class EmailModule { }
