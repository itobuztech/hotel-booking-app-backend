import { Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { User as UserDB, UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

registerEnumType(UserRole, {
    name: 'UserRole',
    description: 'The roles available for users',
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
    id: UserDB['id'];

    @Field(() => String)
    username: UserDB['username'];

    @Field(() => String)
    email: UserDB['email'];

    @Exclude()
    password: UserDB['password'];

    @Field(() => Date)
    createdAt: UserDB['createdAt'];

    @Field(() => Date, { nullable: true })
    updatedAt: UserDB['updatedAt'] | null;
}

@ObjectType()
export class Account extends User {

    @Field(() => Role)
    role: Role;
}
