<<<<<<< HEAD
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { AwsConfigService } from "../config/aws.config";
import { ConfigService } from "@nestjs/config";

import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
=======
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { AwsConfigService } from '../config/aws.config';
import { ConfigService } from '@nestjs/config';

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3

const createSendEmailCommand = (toAddress, Subject, Body) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
<<<<<<< HEAD
          Charset: "UTF-8",
          Data: Body,
        },
        Text: {
          Charset: "UTF-8",
=======
          Charset: 'UTF-8',
          Data: Body,
        },
        Text: {
          Charset: 'UTF-8',
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
          Data: Body,
        },
      },
      Subject: {
<<<<<<< HEAD
        Charset: "UTF-8",
=======
        Charset: 'UTF-8',
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
        Data: Subject,
      },
    },
    Source: process.env.AWS_VERIFIED_EMAIL_ADDRESS,
  });
};

@Injectable()
export class EmailService {
<<<<<<< HEAD
  constructor(private prisma: PrismaService, private readonly logger: Logger) {}
=======
  constructor(private prisma: PrismaService, private readonly logger: Logger) { }
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3

  async run(toAddress: string, Subject: string, Body: string) {
    const sendEmailCommand = createSendEmailCommand(toAddress, Subject, Body);

    try {
      const awsConfigService = new AwsConfigService(new ConfigService());
      const sesService = awsConfigService.getSesInstance();

      return await sesService.send(sendEmailCommand);
    } catch (caught) {
<<<<<<< HEAD
      if (caught instanceof Error && caught.name === "MessageRejected") {
=======
      if (caught instanceof Error && caught.name === 'MessageRejected') {
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
        /** @type { import('@aws-sdk/client-ses').MessageRejected} */
        const messageRejectedError = caught;
        return messageRejectedError;
      }
      throw caught;
    }
  }

  async checking() {
<<<<<<< HEAD
    return "This is just a check!";
=======
    return 'This is just a check!';
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
  }
}
