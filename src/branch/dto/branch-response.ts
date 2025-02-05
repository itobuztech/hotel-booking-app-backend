import { ObjectType, Field, ID } from "@nestjs/graphql";
import { PaginationResponse } from "src/types/response-types/pagination-response";
import { File } from "../../upload/entities/files.entity";
import { Aminity } from "../../item/entities/items.entity";

@ObjectType()
export class BranchAmenitiesUsed extends Aminity {
  @Field(() => Boolean)
  selected: boolean;
}

@ObjectType()
export class BranchCreationMessage {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class AvailabilityStatus {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  totalRooms: number;

  @Field(() => Number)
  availabeRooms: number;
}

@ObjectType()
export class GeoLocationRes {
  @Field(() => Number)
  lat: number;

  @Field(() => Number)
  long: number;
}

@ObjectType()
export class BranchResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  contactNumber: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  areaPincode: string;

  @Field(() => String)
  location: string;

  @Field(() => String)
  description?: string;

  @Field(() => [File])
  image: File[];

  @Field(() => [BranchAmenitiesUsed], { nullable: true })
  amenities: BranchAmenitiesUsed[];

  @Field(() => Number)
  startingPrice: number;

  @Field(() => GeoLocationRes)
  geoLocation: GeoLocationRes;

  @Field(() => [AvailabilityStatus], { nullable: true })
  status?: AvailabilityStatus[];
}

@ObjectType()
export class BranchListResponse {
  @Field(() => [BranchResponse])
  branches?: BranchResponse[];

  @Field(() => PaginationResponse)
  pagination?: PaginationResponse;
}
