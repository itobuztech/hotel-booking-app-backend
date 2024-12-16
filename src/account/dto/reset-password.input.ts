import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
    @Field({ nullable: false })
    oldPassword: string;

    @Field({ nullable: false })
    newPassword: string;
}
