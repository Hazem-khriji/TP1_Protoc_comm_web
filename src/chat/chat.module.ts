import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [ConfigModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
