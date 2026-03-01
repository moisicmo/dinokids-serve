import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CorrespondenceService } from './correspondence.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'documents' })
export class DocumentGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly correspondenceService: CorrespondenceService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string;
    if (!token) { client.disconnect(); return; }
    try {
      const payload = this.jwtService.verify(token);
      (client as any).user = payload;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('doc:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { studentId: string },
  ) {
    const room = `doc:${data.studentId}`;
    await client.join(room);
    const draft = await this.correspondenceService.getDraft(data.studentId);
    const content = draft ? (draft.data as any[])[0]?.content ?? null : null;
    client.emit('doc:loaded', { content });
  }

  @SubscribeMessage('doc:update')
  async handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { studentId: string; content: string },
  ) {
    const user = (client as any).user;
    await this.correspondenceService.saveDraft(data.studentId, data.content, user?.email ?? 'system');
    // Sync to other tabs/devices in the same room (excluding sender)
    client.to(`doc:${data.studentId}`).emit('doc:synced', { content: data.content });
    client.emit('doc:saved');
  }

  @SubscribeMessage('doc:clear')
  async handleClear(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { studentId: string },
  ) {
    await this.correspondenceService.clearDraft(data.studentId);
    this.server.to(`doc:${data.studentId}`).emit('doc:cleared');
  }
}
