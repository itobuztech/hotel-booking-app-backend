import { InputType, Int, Field, ID } from "@nestjs/graphql";

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

  @Field(() => [String], { nullable: true })
  amenityIds: string[];

  @Field(() => [ID], { nullable: true })
  uploadFileIds: string[];
}
