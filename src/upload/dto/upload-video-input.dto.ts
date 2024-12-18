import { IsString } from 'class-validator';
export class UploadVideoInput {
	@IsString()
	name: string;

	@IsString()
	description: string
}