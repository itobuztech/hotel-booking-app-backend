import { Field, ObjectType, ID } from "@nestjs/graphql";
import { Upload as FileDb } from "@prisma/client";
import { TotalCount } from "../../types/inputtypes/toalCount.entity";

@ObjectType()
export class File {
  @Field(() => ID, { nullable: false })
  id: FileDb["id"];

  @Field(() => String, { nullable: false })
  file: FileDb["file"];

  @Field(() => String, { nullable: false })
  fileUrl: string;
}

@ObjectType()
export class PaginatedFile extends TotalCount {
  @Field(() => [File])
  files: File[];
}
