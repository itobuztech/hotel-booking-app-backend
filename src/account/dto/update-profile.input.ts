import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateProfileInput {
    @Field({ nullable: false })
    username: string;

    @Field({ nullable: false })
    name: string;
}
