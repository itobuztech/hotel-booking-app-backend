import { Field, ObjectType, registerEnumType, Int } from "@nestjs/graphql";
import { User as UserDB, UserRole } from "@prisma/client";
import { Exclude } from "class-transformer";
import { File } from "../../upload/entities/files.entity";

registerEnumType(UserRole, {
  name: "UserRole",
  description: "The roles available for users",
});

@ObjectType()
class Role {
  @Field(() => UserRole)
  userType: UserRole;

  @Field(() => [Int])
  privileges: number[];
}

@ObjectType()
export class User {
  @Field(() => String)
  id: UserDB["id"];

  @Field(() => String)
  username: UserDB["username"];

  @Field(() => String)
  email: UserDB["email"];

  @Field(() => String, { nullable: true })
  contactNumber?: UserDB["contactNumber"];

  @Field(() => File, { nullable: true })
  image?: File;

  @Exclude()
  password: UserDB["password"];

  @Field(() => Date)
  createdAt: UserDB["createdAt"];

  @Field(() => Date, { nullable: true })
  updatedAt: UserDB["updatedAt"] | null;
}

@ObjectType()
export class Account extends User {
  @Field(() => Role)
  role: Role;
}
