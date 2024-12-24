import { SendEmailCommand } from '@aws-sdk/client-ses';
import { AwsConfigService } from '../config/aws.config';
import { ConfigService } from '@nestjs/config';

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
          Charset: 'UTF-8',
          Data: Body,
        },
        Text: {
          Charset: 'UTF-8',
          Data: Body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: Subject,
      },
    },
    Source: process.env.AWS_VERIFIED_EMAIL_ADDRESS,
  });
};

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService, private readonly logger: Logger) { }

  async run(toAddress: string, Subject: string, Body: string) {
    const sendEmailCommand = createSendEmailCommand(toAddress, Subject, Body);

    try {
      const awsConfigService = new AwsConfigService(new ConfigService());
      const sesService = awsConfigService.getSesInstance();

      return await sesService.send(sendEmailCommand);
    } catch (caught) {
      if (caught instanceof Error && caught.name === 'MessageRejected') {
        /** @type { import('@aws-sdk/client-ses').MessageRejected} */
        const messageRejectedError = caught;
        return messageRejectedError;
      }
      throw caught;
    }
  }

  async checking() {
    return 'This is just a check!';
  }
}
