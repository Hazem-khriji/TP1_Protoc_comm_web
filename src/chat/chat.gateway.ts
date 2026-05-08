import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ReactToMessageDto } from './dto/react-to-message.dto';

type JwtPayload = {
  sub: number;
  email: string;
};

type ConnectedUser = {
  userId: number;
  email: string;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly connectedUsers = new Map<string, ConnectedUser>();

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      client.emit('error', 'Missing token');
      client.disconnect();
      return;
    }

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') ?? 'dev-secret';
      const payload = verify(token, secret) as unknown as JwtPayload;

      const user: ConnectedUser = { userId: payload.sub, email: payload.email };
      this.connectedUsers.set(client.id, user);

      client.emit('history', this.chatService.getAllMessages());

      this.server.emit('userJoined', {
        email: user.email,
        onlineCount: this.connectedUsers.size,
      });
    } catch {
      client.emit('error', 'Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);

    if (user) {
      this.server.emit('userLeft', {
        email: user.email,
        onlineCount: this.connectedUsers.size,
      });
    }
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user || !dto?.content?.trim()) return;

    const message = this.chatService.addMessage(
      user.userId,
      user.email,
      dto.content.trim(),
    );

    this.server.emit('newMessage', message);
  }

  @SubscribeMessage('reactToMessage')
  handleReactToMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ReactToMessageDto,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user || !dto?.messageId || !dto?.emoji) return;

    const updated = this.chatService.toggleReaction(
      dto.messageId,
      dto.emoji,
      user.userId,
    );

    if (updated) {
      this.server.emit('messageReaction', updated);
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers() {
    return {
      users: Array.from(this.connectedUsers.values()).map((u) => u.email),
      count: this.connectedUsers.size,
    };
  }
}
