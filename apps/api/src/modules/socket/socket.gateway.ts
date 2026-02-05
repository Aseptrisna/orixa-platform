import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from '@orixa/shared';

@WebSocketGateway({
  cors: {
    origin: ['https://orixa.sta.my.id/', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SocketEvent.JOIN_STAFF_ROOM)
  handleJoinStaffRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string; outletId: string },
  ) {
    const room = `staff:${data.companyId}:${data.outletId}`;
    client.join(room);
    console.log(`Client ${client.id} joined staff room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage(SocketEvent.JOIN_CUSTOMER_ROOM)
  handleJoinCustomerRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const room = `customer:${data.orderId}`;
    client.join(room);
    console.log(`Client ${client.id} joined customer room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage(SocketEvent.LEAVE_ROOM)
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    console.log(`Client ${client.id} left room: ${data.room}`);
    return { success: true };
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
