<<<<<<< HEAD
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SES } from "@aws-sdk/client-ses"; // Import SES client from AWS SDK
=======
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SES } from '@aws-sdk/client-ses'; // Import SES client from AWS SDK
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3

@Injectable()
export class AwsConfigService {
  private sesClient: SES; // SES client instance

  constructor(private configService: ConfigService) {
    // Initialize SES client with region from environment variable
    this.sesClient = new SES({
<<<<<<< HEAD
      region: this.configService.get<string>("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get<string>(
          "AWS_SECRET_ACCESS_KEY"
=======
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
        ),
      },
    });
  }

  // Method to get SES client instance
  getSesInstance(): SES {
    return this.sesClient;
  }
}
