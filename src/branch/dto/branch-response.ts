import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class BranchResponse {
  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
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
