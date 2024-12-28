import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path,
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['polling', 'websocket'],
            allowEIO3: true,
            perMessageDeflate: false,
        });

        io.on('connection', (socket) => {
            console.log('Client connected');

            socket.on('join-hotel', (hotelId: string) => {
                socket.join(`hotel:${hotelId}`);
            });

            socket.on('leave-hotel', (hotelId: string) => {
                socket.leave(`hotel:${hotelId}`);
            });

            socket.on('join-user-bookings', (userId: string) => {
                socket.join(`user:${userId}:bookings`);
            });

            socket.on('leave-user-bookings', (userId: string) => {
                socket.leave(`user:${userId}:bookings`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        // Устанавливаем IO на res.socket.server
        Object.defineProperty(res.socket.server, 'io', {
            configurable: true,
            writable: true,
            value: io
        });
    }

    res.end();
};

export default ioHandler;