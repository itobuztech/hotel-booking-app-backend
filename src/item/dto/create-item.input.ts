import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { EntityEnum } from "../../types/enums/entity.enum";

@InputType()
export class CreateItemInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => Boolean, { defaultValue: true })
  status: boolean;

  @Field(() => EntityEnum)
  entity: EntityEnum;

  @Field({ nullable: true })
  roomInitial?: string;

  @Field(() => ID, { nullable: true })
  image?: string;

  @Field(() => ID, { nullable: true })
  parentRoomId?: string;
}
