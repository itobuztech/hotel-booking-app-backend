import { createUnionType, Field, ObjectType } from "@nestjs/graphql";
import {
  Amenities as AmenitiesDb,
  RoomType as RoomTypeDb,
} from "@prisma/client";
import { TotalCount } from "../../types/inputtypes/toalCount.entity";
import { File } from "../../upload/entities/files.entity";

@ObjectType()
export class Aminity {
  @Field(() => String, { nullable: true })
  id?: AmenitiesDb["id"];

  @Field(() => String)
  name: AmenitiesDb["name"];

  @Field(() => String, { nullable: true })
  description?: AmenitiesDb["description"];

  @Field(() => String, { nullable: true })
  createdAt?: AmenitiesDb["createdAt"];

  @Field(() => String, { nullable: true })
  updatedAt?: AmenitiesDb["updatedAt"];

  @Field(() => String, { nullable: true })
  deletedAt?: AmenitiesDb["deletedAt"];

  @Field(() => File)
  image: File;
}

@ObjectType()
export class PaginatedAminity extends TotalCount {
  @Field(() => [Aminity])
  aminities: Aminity[];
}

@ObjectType()
export class RoomType {
  @Field(() => String, { nullable: true })
  id?: RoomTypeDb["id"];

  @Field(() => String)
  name: RoomTypeDb["name"];

  @Field(() => String, { nullable: true })
  description?: RoomTypeDb["description"];

  @Field(() => String)
  roomInitial: RoomTypeDb["roomInitial"];

  @Field(() => String, { nullable: true })
  createdAt?: RoomTypeDb["createdAt"];

  @Field(() => String, { nullable: true })
  updatedAt?: RoomTypeDb["updatedAt"];

  @Field(() => String, { nullable: true })
  deletedAt?: RoomTypeDb["deletedAt"];
}

@ObjectType()
export class PaginatedRoomType extends TotalCount {
  @Field(() => [RoomType])
  roomTypes: RoomType[];
}

export const PaginatedAminityOrRoomType = createUnionType({
  name: "PaginatedAminityOrRoomType", // GraphQL type name
  types: () => [PaginatedAminity, PaginatedRoomType] as const,
  resolveType: (value) => {
    if ("aminities" in value) {
      return PaginatedAminity; // Resolves to PaginatedAminity
    }
    if ("roomTypes" in value) {
      return PaginatedRoomType; // Resolves to PaginatedRoomType
    }
    return null; // Fallback (shouldn't happen if logic is correct)
  },
});
