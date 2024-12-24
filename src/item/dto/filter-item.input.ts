import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";

@InputType()
export class FilterItemInput {
  @Field(() => ID)
  entity: string;

  @Field(() => ID, { nullable: true })
  parentRoom?: string;
}
