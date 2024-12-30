import { registerEnumType } from "@nestjs/graphql";

export enum EntityEnum {
  AMENITIES = "AMENITIES",
  ROOMTYPE = "ROOMTYPE",
}

registerEnumType(EntityEnum, {
  name: "EntityEnum", // This name will be used in the GraphQL schema
});
