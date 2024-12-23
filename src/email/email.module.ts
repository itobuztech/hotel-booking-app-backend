<<<<<<< HEAD
import { Module } from '@nestjs/common';
=======
import { Logger, Module } from '@nestjs/common';
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerModule } from '../logger/app-logger.module';

@Module({
<<<<<<< HEAD
  imports: [LoggerModule],
  providers: [EmailService, PrismaService],
  exports: [EmailService],
})
export class EmailModule {}
=======
  imports: [LoggerModule, LoggerModule],
  providers: [EmailService, PrismaService],
  exports: [EmailService],
})
export class EmailModule { }
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
