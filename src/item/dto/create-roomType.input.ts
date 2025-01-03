import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { EntityEnum } from "../../types/enums/entity.enum";

@InputType()
export class CreateRoomTypeInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  status: boolean;

  @Field()
  roomInitial: string;
}
