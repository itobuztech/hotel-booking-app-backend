import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateItemInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Boolean, { defaultValue: true })
  status: boolean;

  @Field(() => ID)
  entity: string;

  @Field({ nullable: true })
  roomInitial?: string;

  @Field(() => ID, { nullable: true })
  image?: string;
}
