import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class SearchPaginationArgs {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => Int)
  skip: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}
