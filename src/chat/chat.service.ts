import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  authorId: number;
  authorEmail: string;
  timestamp: Date;
  reactions: Record<string, number[]>;
}

@Injectable()
export class ChatService {
  private readonly messages = new Map<string, Message>();

  addMessage(authorId: number, authorEmail: string, content: string): Message {
    const message: Message = {
      id: uuidv4(),
      content,
      authorId,
      authorEmail,
      timestamp: new Date(),
      reactions: {},
    };
    this.messages.set(message.id, message);
    return message;
  }

  toggleReaction(
    messageId: string,
    emoji: string,
    userId: number,
  ): Message | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = [];
    }

    const reactors = message.reactions[emoji];
    const index = reactors.indexOf(userId);

    if (index === -1) {
      reactors.push(userId);
    } else {
      reactors.splice(index, 1);
    }

    if (reactors.length === 0) {
      delete message.reactions[emoji];
    }

    return message;
  }

  getAllMessages(): Message[] {
    return Array.from(this.messages.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }
}
