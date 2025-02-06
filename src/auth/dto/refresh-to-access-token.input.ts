import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RefreshToAccessTokenInput {
  @Field()
  refreshToken: string;
}
