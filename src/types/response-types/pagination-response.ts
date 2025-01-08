import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class PaginationResponse {
  @Field(() => Int)
  totalRecords?: Number;

  @Field(() => Int)
  totalPages?: Number;

  @Field(() => Int)
  currentPage?: Number;
}
