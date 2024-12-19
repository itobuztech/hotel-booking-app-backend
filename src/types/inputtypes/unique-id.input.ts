import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UniqueIdentifierInput {
  @Field(() => ID)
  id: string;
}
