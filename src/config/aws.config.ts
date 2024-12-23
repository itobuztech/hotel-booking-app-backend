import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SES } from '@aws-sdk/client-ses'; // Import SES client from AWS SDK

@Injectable()
export class AwsConfigService {
  private sesClient: SES; // SES client instance

  constructor(private configService: ConfigService) {
    // Initialize SES client with region from environment variable
    this.sesClient = new SES({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  // Method to get SES client instance
  getSesInstance(): SES {
    return this.sesClient;
  }
}
