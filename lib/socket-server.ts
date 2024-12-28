import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'net';

export const initSocketServer = (res: NextApiResponse & { socket: Socket & { server: any } }) => {
    if ((res.socket.server as any).io) {
        console.log('Socket server already running');
        return;
    }

    console.log('Initializing socket server...');

    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        transports: ['polling'],
        cors: {
            origin: '*',
        },
    });

    (res.socket.server as any).io = io;

    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('join-user-bookings', (userId: string) => {
            console.log('User joined bookings room:', userId);
            socket.join(`user:${userId}:bookings`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}