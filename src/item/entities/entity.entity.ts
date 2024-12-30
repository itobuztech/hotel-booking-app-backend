import { Field, ObjectType } from "@nestjs/graphql";
import { EntityEnum } from "../../types/enums/entity.enum";

@ObjectType()
export class Entity {
  @Field(() => EntityEnum, { nullable: true })
  name?: EntityEnum;
}
