import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ForgotPasswordInput {
    @Field()
    email: string;
}

@InputType()
export class ForgotPasswordConfirmationInput {
    @Field()
    confirmationToken: string;

    @Field()
    newPassword: string;
}