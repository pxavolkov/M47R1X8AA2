import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  WebSocketServer,
  WsException,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { SocketAuthMiddleware } from '../auth/socket-auth.middleware';
import { SendMessage } from '@shared/requests';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { ProfileService } from '../profile/profile.service';
import { User } from '../user/user.entity';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class MessageGateway implements OnGatewayInit {
  constructor(
    private readonly socketAuthMiddleware: SocketAuthMiddleware,
    private readonly messageService: MessageService,
    private readonly profileService: ProfileService,
  ) {}
  @WebSocketServer() server;

  afterInit(server: Server) {
    server.use(this.socketAuthMiddleware.resolve());
  }

  @SubscribeMessage('message')
  async onMessage(client, [data, cb]): Promise<void> {
    const message = new Message();
    message.fromUserId = client.user.id;
    message.toUserId = parseInt(data.userId, 10);
    message.text = data.text;
    let sent = false;
    try {
      await this.messageService.add(message);
      cb(message); // Message sent
      sent = true;
    } catch (err) {
      cb(false); // Error sending message
    }

    if (sent) {
      // Find all users with target user id
      const keys = Object.entries(this.server.sockets.sockets)
        .reduce((acc, [k, v]: [string, Socket & {user: User | undefined}]) => {
          if (v.user && v.user.id === message.toUserId && v.id !== client.id) acc.push(k);
          return acc;
        }, []);

      // Send messages to all
      for (const key of keys) this.server.sockets.sockets[key].emit('message', message);
    }
  }

  @SubscribeMessage('loadDialog')
  async loadDialog({user}, [{userId}, cb]): Promise<void> {
    const messages = await this.messageService.getDialog(user.id, userId);
    const user2 = await this.profileService.getPublicProfile(userId);
    const users = [{
      id: user.id,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      photoUploaded: user.profile.photoUploaded
    }, {
      id: user2.userId,
      firstName: user2.firstName,
      lastName: user2.lastName,
      photoUploaded: user2.photoUploaded
    }];
    cb({messages, users});
  }
}