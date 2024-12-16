import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}
