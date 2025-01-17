import { ObjectType, Field } from "@nestjs/graphql";
@ObjectType()
export class BranchUploadFilesRelationResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  uploadId: string;

  @Field(() => String)
  branchId: string;
}
