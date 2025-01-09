import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchInput {
  @Field(() => String, { nullable: true })
  search?: string;
}
