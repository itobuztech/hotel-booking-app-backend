import { InputType, Field, ID } from "@nestjs/graphql";

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: false })
  username: string;

  @Field({ nullable: false })
  name: string;

  @Field({ nullable: false })
  contactNumber: string;

  @Field(() => ID, { nullable: false })
  image: string;
}
