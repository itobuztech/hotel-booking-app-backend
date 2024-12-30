import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { EntityEnum } from "../../types/enums/entity.enum";

@InputType()
export class FilterItemInput {
  @Field(() => EntityEnum)
  entity: EntityEnum;

  @Field(() => ID, { nullable: true })
  parentRoom?: string;
}
