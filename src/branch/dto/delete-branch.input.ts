import { InputType, Field } from "@nestjs/graphql";
import { IsUUID } from 'class-validator';

@InputType()
export class DeleteBranchInput {
    @IsUUID('4', { message: 'The ID must be a valid UUID' })
    @Field(() => String, { nullable: false, description: "Branch ID" })
    id: string;
}