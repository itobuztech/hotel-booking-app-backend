import { registerEnumType } from "@nestjs/graphql";

export enum EntityEnum {
  AMENITY = "AMENITY",
  ROOMTYPE = "ROOMTYPE",
}

registerEnumType(EntityEnum, {
  name: "EntityEnum", // This name will be used in the GraphQL schema
});
