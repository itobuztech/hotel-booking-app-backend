import { ObjectType, Field } from "@nestjs/graphql";
import { PaginationResponse } from "src/types/response-types/pagination-response";
import { BranchAmenitiesRelationResponse } from "./branchAmenitiesRelation-response";
import { BranchUploadFilesRelationResponse } from "./branchUploadFilesRelation-response";

@ObjectType()
export class BranchResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  contactNumber: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  areaPincode: string;

  @Field(() => String)
  location: string;

  @Field(() => String)
  description?: string;

  @Field(() => [BranchAmenitiesRelationResponse], { nullable: true })
  BranchAmenitiesRelation?: BranchAmenitiesRelationResponse[];

  @Field(() => [BranchUploadFilesRelationResponse], { nullable: true })
  UploadRelation?: BranchUploadFilesRelationResponse[];
}

@ObjectType()
export class BranchListResponse {
  @Field(() => [BranchResponse])
  branches?: BranchResponse[];

  @Field(() => PaginationResponse)
  pagination?: PaginationResponse;
}
