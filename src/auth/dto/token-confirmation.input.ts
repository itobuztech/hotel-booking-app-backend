import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class TokenConfirmationInput {
  @Field()
  token: string;
}
