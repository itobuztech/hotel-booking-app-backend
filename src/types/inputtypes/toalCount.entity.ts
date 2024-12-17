import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TotalCount {
  @Field(() => Int)
  total: Number;
}
