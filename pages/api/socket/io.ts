import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

        // Socket.IO event handlers
        io.on('connection', (socket) => {
            console.log('Client connected');

            socket.on('join-hotel', (hotelId: string) => {
                socket.join(`hotel:${hotelId}`);
            });

            socket.on('leave-hotel', (hotelId: string) => {
                socket.leave(`hotel:${hotelId}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;