import { Field, ObjectType } from "@nestjs/graphql";
import { Item as ItemDB } from "@prisma/client";
import { TotalCount } from "src/types/inputtypes/toalCount.entity";
import { Entity } from "./entity.entity";
import { File } from "src/upload/entities/files.entity";

@ObjectType()
export class Item {
  @Field(() => String)
  id: ItemDB["id"];

  @Field(() => String)
  name: ItemDB["name"];

  @Field(() => String)
  description: ItemDB["description"];

  @Field(() => Boolean)
  status: ItemDB["status"];

  @Field(() => Entity)
  entity: Entity;

  @Field(() => File)
  image: File;

  @Field(() => String, { nullable: true })
  roomInitial?: ItemDB["roomInitial"];
}

@ObjectType()
export class PaginatedItem extends TotalCount {
  @Field(() => [Item])
  items: Item[];
}
