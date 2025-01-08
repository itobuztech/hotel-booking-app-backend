import { InputType, Int, Field } from "@nestjs/graphql";
import { IsPhoneNumber, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CreateBranchInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field()
  contactNumber: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  areaPincode: string;

  @Field(() => String)
  location: string;

  @Field(() => String)
  description?: string;

  @Field(() => Boolean)
  status: boolean;
}
