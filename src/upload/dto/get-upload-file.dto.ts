import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetUploadedFile {
  @Field(() => String)
  id: string;
}
