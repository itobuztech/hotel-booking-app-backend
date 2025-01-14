import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchInput {
  @Field(() => String)
  search?: string;
}
