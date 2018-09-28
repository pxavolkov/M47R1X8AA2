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
import { Role } from '../user/roles';
import { HackService } from '../hack/hack.service';
import { HackType, EventType } from '@shared/enums';
import { EventService } from 'event/event.service';

@WebSocketGateway()
export class MessageGateway implements OnGatewayInit {
  constructor(
    private readonly socketAuthMiddleware: SocketAuthMiddleware,
    private readonly messageService: MessageService,
    private readonly profileService: ProfileService,
    private readonly hackService: HackService,
    private readonly eventService: EventService,
  ) {}
  @WebSocketServer() server;

  afterInit(server: Server) {
    server.use(this.socketAuthMiddleware.resolve());
  }

  @SubscribeMessage('message')
  async onMessage(client, [data, cb]): Promise<void> {
    let mainUserId, isMaster, isHacker, isMasterOrHacker = false;
    if (data.asUserId) {
      isMaster = client.user.roles.has(Role.Master);
      isHacker = (
        client.user.roles.has(Role.Hacker) &&
        await this.hackService.findActiveToken(client.user.id, HackType.MESSAGES_EDIT, data.asUserId)
      );
      isMasterOrHacker = isMaster || isHacker;
      if (!isMasterOrHacker) {
        cb(false);
        return;
      } else {
        mainUserId = data.asUserId;
      }
    } else {
      mainUserId = client.user.id;
    }
    const message = new Message();
    message.fromUserId = mainUserId;
    message.toUserId = parseInt(data.userId, 10);
    message.text = data.text;
    let sent = false;
    let messageId;
    try {
      messageId = (await this.messageService.add(message)).id;
      cb(message); // Message sent
      sent = true;
    } catch (err) {
      cb(false); // Error sending message
    }

    if (sent) {
      if (isMasterOrHacker) {
        this.eventService.add(client.user.id, EventType.MESSAGE_SEND, {id: messageId, isMaster, isHacker});
      }
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
  async loadDialog({user}: {user: User}, [{userId, asUserId}, cb]): Promise<void> {
    let mainUser, isMaster, isHacker, isMasterOrHacker = false;
    if (asUserId) {
      isMaster = user.roles.has(Role.Master);
      isHacker = (
        user.roles.has(Role.Hacker) &&
        await this.hackService.findActiveToken(user.id, HackType.MESSAGES_VIEW, asUserId)
      );
      isMasterOrHacker = isMaster || isHacker;
      if (!isMasterOrHacker) {
        cb({messages: [], users: []});
        return;
      } else {
        mainUser = await this.profileService.getPublicProfile(asUserId);
      }
    } else {
      mainUser = {
        id: user.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        photoUploaded: user.profile.photoUploaded
      };
    }
    const messages = await this.messageService.getDialog(mainUser.id, userId);
    await this.messageService.markDialogAsRead(userId, mainUser.id);
    const {userId: user2Id, firstName, lastName, photoUploaded} = await this.profileService.getPublicProfile(userId);
    const user2 = {id: user2Id, firstName, lastName, photoUploaded};
    if (isMasterOrHacker) {
      this.eventService.add(user.id, EventType.MESSAGE_VIEW, {user1: mainUser, user2: userId, isMaster, isHacker});
    }
    cb({messages, users: [mainUser, user2]});
  }
}