import { Field, ObjectType } from "@nestjs/graphql";
import { Entity as EntityDB } from "@prisma/client";
import { TotalCount } from "src/types/inputtypes/toalCount.entity";

@ObjectType()
export class Entity {
  @Field(() => String)
  id: EntityDB["id"];

  @Field(() => String)
  name: EntityDB["name"];
}

@ObjectType()
export class PaginatedEntity extends TotalCount {
  @Field(() => [Entity])
  entities: Entity[];
}
