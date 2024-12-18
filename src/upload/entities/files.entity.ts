import { Field, ObjectType } from "@nestjs/graphql";
import { Upload as FileDb } from "@prisma/client";
import { TotalCount } from "../../types/inputtypes/toalCount.entity";

@ObjectType()
export class File {
  @Field(() => String, { nullable: true })
  id?: FileDb["id"];

  @Field(() => String, { nullable: true })
  file?: FileDb["file"];

  @Field(() => String, { nullable: true })
  createdAt?: FileDb["createdAt"];

  @Field(() => String, { nullable: true })
  updatedAt?: FileDb["updatedAt"];

  @Field(() => String, { nullable: true })
  fileUrl?: String;
}

@ObjectType()
export class PaginatedFile extends TotalCount {
  @Field(() => [File])
  files: File[];
}
