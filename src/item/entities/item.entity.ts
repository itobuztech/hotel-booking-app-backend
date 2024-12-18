import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Item as ItemDB } from "@prisma/client";
import { File } from "../../upload/entities/files.entity";
import { TotalCount } from "src/types/inputtypes/toalCount.entity";

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

  @Field(() => String)
  entity: ItemDB["entityId"];

  @Field(() => String, { name: "roomInitial", nullable: true })
  room_initial?: ItemDB["roomInitial"];
}

@ObjectType()
export class PaginatedItem extends TotalCount {
  @Field(() => [Item])
  items: Item[];
}
