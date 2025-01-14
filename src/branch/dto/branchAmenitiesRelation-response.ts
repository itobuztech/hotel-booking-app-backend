import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class BranchAmenitiesRelationResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  amenitiesId: string;

  @Field(() => String)
  branchId: string;
}
