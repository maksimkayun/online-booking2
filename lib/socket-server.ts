import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'net';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    SocketServer,
    UserUpdateData,
    BookingWithDetails,
    HotelWithRooms,
    RoomBooking
} from '@/types/socket';
import { User } from '@prisma/client';

type NextApiResponseSocket = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
            socketServer: SocketServer;
        };
    };
};

export const initSocketServer = (res: NextApiResponseSocket): void => {
    if (res.socket.server.io) {
        console.log('Socket server already running');
        return;
    }

    console.log('Initializing socket server...');

    const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(res.socket.server, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            allowedHeaders: ["content-type"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('join:user', (userId: string) => {
            console.log('User joined own room:', userId);
            socket.join(`user:${userId}`);
        });

        socket.on('leave:user', (userId: string) => {
            console.log('User left own room:', userId);
            socket.leave(`user:${userId}`);
        });

        socket.on('join:room', (roomId: string) => {
            console.log('User joined room:', roomId);
            socket.join(`room:${roomId}`);
        });

        socket.on('leave:room', (roomId: string) => {
            console.log('User left room:', roomId);
            socket.leave(`room:${roomId}`);
        });

        socket.on('join:admin', () => {
            console.log('Admin joined admin room');
            socket.join('admin');
        });

        socket.on('leave:admin', () => {
            console.log('Admin left admin room');
            socket.leave('admin');
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    const socketServer: SocketServer = {
        io,
        emitUserUpdate: (userId: string, userData: UserUpdateData) => {
            io.to(`user:${userId}`).emit('user:updated', userData);
        },
        emitBookingCreated: (booking: BookingWithDetails) => {
            io.to(`user:${booking.userId}`).emit('booking:created', booking);
            io.to(`room:${booking.roomId}`).emit('room:bookings:updated', {
                roomId: booking.roomId,
                startDate: booking.startDate.toISOString(),
                endDate: booking.endDate.toISOString()
            });
        },
        emitBookingCancelled: (booking: BookingWithDetails) => {
            io.to(`user:${booking.userId}`).emit('booking:cancelled', booking);
            io.to(`room:${booking.roomId}`).emit('room:bookings:updated', {
                roomId: booking.roomId,
                startDate: booking.startDate.toISOString(),
                endDate: booking.endDate.toISOString()
            });
        },
        emitHotelCreated: (hotel: HotelWithRooms) => {
            io.emit('hotel:created', hotel);
        },
        emitHotelUpdated: (hotel: HotelWithRooms) => {
            io.emit('hotel:updated', hotel);
        },
        emitHotelDeleted: (hotelId: string) => {
            io.emit('hotel:deleted', hotelId);
        },
        emitPermissionsUpdated: (permissions: User[]) => {
            io.to('admin').emit('permissions:updated', permissions);
        }
    };

    res.socket.server.io = io;
    res.socket.server.socketServer = socketServer;
};

export const getSocketServer = (res: NextApiResponseSocket): SocketServer => {
    if (!res.socket.server.socketServer) {
        throw new Error('Socket server not initialized');
    }
    return res.socket.server.socketServer;
};