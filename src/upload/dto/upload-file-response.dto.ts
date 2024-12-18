import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UploadFileResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  fileUrl: String;
}
