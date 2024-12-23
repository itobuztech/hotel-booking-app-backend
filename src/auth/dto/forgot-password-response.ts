import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ForgotPasswordResponse {
    @Field(() => String)
    token: string;
}

@ObjectType()
export class ValidateForgotPasswordResponse {
    @Field(() => String)
    message: string;
}