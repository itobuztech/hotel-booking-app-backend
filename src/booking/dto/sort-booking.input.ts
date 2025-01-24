import { Field, InputType } from "@nestjs/graphql";
import SortOrder from "../../enums/SortOrder.enum";

@InputType()
export class SortBookingInputs {
  @Field(() => SortOrder, { nullable: true })
  createdAt?: SortOrder;
}
