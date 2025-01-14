import { registerEnumType } from "@nestjs/graphql";

export enum ActionEnum {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

registerEnumType(ActionEnum, {
  name: "ActionEnum", // This name will be used in the GraphQL schema
});
