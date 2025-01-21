import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { Booking as BookingDB } from "@prisma/client";
import { File } from "../../upload/entities/files.entity";

@ObjectType()
export class Booking {
  @Field(() => ID)
  id: BookingDB["id"];

  @Field(() => [File])
  image: File[];
}
