import { ObjectType, Field, ID, createUnionType, Int } from "@nestjs/graphql";
import {
  BranchRoomTypeRelation as BranchRoomTypeRelationDB,
  Room as RoomDB,
  Branch as BranchDB,
  RoomType as RoomTypeDB,
  Amenities as AmenitiesDB,
} from "@prisma/client";
import { File } from "../../upload/entities/files.entity";

@ObjectType()
export class BranchRoomTypeAmenitiesUsed {
  @Field(() => ID)
  id: AmenitiesDB["id"];

  @Field(() => String)
  name: AmenitiesDB["name"];
}

@ObjectType()
export class BranchRoomType {
  @Field(() => ID)
  roomTypeId: BranchRoomTypeRelationDB["roomTypeId"];

  @Field(() => ID)
  branchId: BranchRoomTypeRelationDB["branchId"];

  @Field(() => String)
  branchName: BranchDB["name"];

  @Field(() => String)
  roomTypeName: RoomTypeDB["name"];

  @Field(() => String)
  roomTypeInitial: RoomTypeDB["roomInitial"];

  @Field(() => Int)
  setPriceEditable: number;

  @Field(() => Int)
  offerPriceEditable: number;

  @Field(() => String, { nullable: true })
  description?: BranchRoomTypeRelationDB["description"];

  @Field(() => Int)
  totalRooms: number;

  @Field(() => [File])
  image: File[];

  @Field(() => [BranchRoomTypeAmenitiesUsed])
  amenities: BranchRoomTypeAmenitiesUsed[];
}

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

  @Field(() => Int)
  offerPriceShown: number;
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
  roomInitial: string;

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
