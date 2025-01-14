import { ObjectType, Field, ID, createUnionType, Int } from "@nestjs/graphql";
import {
  BranchRoomTypeRelation as BranchRoomTypeRelationDB,
  Room as RoomDB,
} from "@prisma/client";

@ObjectType()
export class RoomsOverAll {
  @Field(() => ID)
  id: BranchRoomTypeRelationDB["id"];

  @Field(() => String)
  type: String;

  @Field(() => [String])
  rooms: [String];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class RoomsOverAllArr {
  @Field(() => [RoomsOverAll])
  roomsOverAlls: RoomsOverAll[];
}

@ObjectType()
export class RoomsWithInitial {
  @Field(() => ID)
  id: RoomDB["id"];

  @Field(() => String)
  roomInitial: String;

  @Field(() => Int)
  roomNumber: number;
}

@ObjectType()
export class RoomsWithInitialArr {
  @Field(() => [RoomsWithInitial])
  roomsWithInitials: RoomsWithInitial[];
}

export const RoomsOverAllOrRoomsWithInitial = createUnionType({
  name: "RoomsOverAllOrRoomsWithInitial", // GraphQL type name
  types: () => [RoomsOverAllArr, RoomsWithInitialArr] as const,
  resolveType: (value) => {
    if ("roomsOverAlls" in value) {
      return RoomsOverAllArr; // Resolves to RoomsOverAll
    }
    if ("roomsWithInitials" in value) {
      return RoomsWithInitialArr; // Resolves to RoomsWithInitial
    }
    return null; // Fallback (shouldn't happen if logic is correct)
  },
});
