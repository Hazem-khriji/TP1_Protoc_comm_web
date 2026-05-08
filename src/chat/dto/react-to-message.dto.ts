import { IsString } from 'class-validator';

export class ReactToMessageDto {
  @IsString()
  messageId: string;

  @IsString()
  emoji: string;
}
