import { Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { Booking, Hotel, Room, User } from "@prisma/client";

export interface UserUpdateData {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
}

export interface BookingWithDetails extends Booking {
    Hotel: Hotel;
    Room: Room;
}

export interface HotelWithRooms extends Hotel {
    rooms: Room[];
}

export interface RoomBooking {
    startDate: string;
    endDate: string;
    roomId: string;
}

export interface ServerToClientEvents {
    'booking:created': (data: BookingWithDetails) => void;
    'booking:cancelled': (data: BookingWithDetails) => void;
    'hotel:created': (data: HotelWithRooms) => void;
    'hotel:updated': (data: HotelWithRooms) => void;
    'hotel:deleted': (data: string) => void;
    'user:updated': (data: UserUpdateData) => void;
    'room:bookings:updated': (data: RoomBooking) => void;
    'permissions:updated': (data: User[]) => void;
}

export interface ClientToServerEvents {
    'join:user': (userId: string) => void;
    'leave:user': (userId: string) => void;
    'join:room': (roomId: string) => void;
    'leave:room': (roomId: string) => void;
    'join:admin': () => void;
    'leave:admin': () => void;
}

export interface SocketServer {
    io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
    emitUserUpdate: (userEmail: string, userData: UserUpdateData) => void;
    emitBookingCreated: (booking: BookingWithDetails) => void;
    emitBookingCancelled: (booking: BookingWithDetails) => void;
    emitHotelCreated: (hotel: HotelWithRooms) => void;
    emitHotelUpdated: (hotel: HotelWithRooms) => void;
    emitHotelDeleted: (hotelId: string) => void;
    emitPermissionsUpdated: (permissions: User[]) => void;
}

export type NextApiResponseSocket = NextApiResponse & {
    socket: Socket & {
        server: Server<typeof IncomingMessage, typeof ServerResponse> & {
            io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
            socketServer: SocketServer;
        };
    };
}