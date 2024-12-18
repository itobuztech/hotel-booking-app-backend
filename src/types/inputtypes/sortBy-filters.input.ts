import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import SortOrder from 'src/enums/SortOrder.enum';

@InputType()
export class SortByFilters {
  @Field(() => SortOrder, { nullable: true })
  name: SortOrder;

  @Field(() => SortOrder, { nullable: true })
  createdAt: SortOrder;
}
