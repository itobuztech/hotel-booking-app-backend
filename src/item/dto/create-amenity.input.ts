import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class CreateAmenityInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  status: boolean;

  @Field(() => ID, { nullable: true })
  image?: string;

  @Field(() => ID, { nullable: true })
  roomTypeId?: string;
}
