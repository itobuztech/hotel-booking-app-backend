import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class updateSucess {
  @Field(() => String)
  message: "Updated Successfully!";
}
