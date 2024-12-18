import { Field, InputType } from "@nestjs/graphql";
import { GraphQLUpload } from "graphql-upload-ts";
import { FileUpload } from "../../types/inputtypes/fileUpload";

@InputType()
export class UploadFileInput {
  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;
}
