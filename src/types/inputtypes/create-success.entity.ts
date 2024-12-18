import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class createSucess {
  @Field(() => String)
  message: String;
}
