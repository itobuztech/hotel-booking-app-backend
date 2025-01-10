import { Exclude } from "class-transformer";
import { CreateBranchInput } from "./create-branch.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
@InputType()
export class UpdateBranchInput extends PartialType(CreateBranchInput) {
  @Exclude()
  id: string;
}
