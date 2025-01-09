import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class Branch {
  @Field(() => String)
  id: string;

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
}
