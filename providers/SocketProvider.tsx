import { PropsWithChildren, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '@/lib/socket';
import { useSession } from 'next-auth/react';
import { BookingWithDetails, HotelWithRooms, UserUpdateData, RoomBooking } from "@/types/socket";
import {User} from "@prisma/client";

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
export type ClientToServerEvents = {
    'join:user': (userId: string) => void;
    'leave:user': (userId: string) => void;
    'join:room': (roomId: string) => void;
    'leave:room': (roomId: string) => void;
    'join:admin': () => void;
    'leave:admin': () => void;
};

export function SocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { data: session, status, update } = useSession();

    // Обработчик обновления данных пользователя
    const handleUserUpdate = useCallback(async (data: UserUpdateData) => {
        if (session?.user?.email === data.email) {
            await update({
                ...session,
                user: {
                    // ...session?.user,
                    ...data
                }
            });
        }
    }, [session, update]);

    useEffect(() => {
        let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

        const initSocket = async () => {
            if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_APP_URL || status !== 'authenticated') {
                return;
            }

            try {
                const io = (await import('socket.io-client')).io;

                socketInstance = io(process.env.NEXT_PUBLIC_APP_URL, {
                    path: '/api/socket/io',
                    addTrailingSlash: false,
                    transports: ['polling'],
                    reconnection: true,
                    reconnectionAttempts: 3,
                    reconnectionDelay: 1000,
                }) as Socket<ServerToClientEvents, ClientToServerEvents>;

                socketInstance.on('connect', () => {
                    console.log('Socket connected');
                    setIsConnected(true);

                    // Подписываемся на обновления пользователя при подключении
                    if (session?.user?.email) {
                        socketInstance?.emit('join:user', session.user.email);

                        // Подписываемся на обновление данных пользователя
                        socketInstance?.on('user:updated', handleUserUpdate);
                    }

                    // Для админов подписываемся на специальные события
                    if (session?.user?.role === 'ADMIN') {
                        socketInstance?.emit('join:admin');
                    }

                });

                // Добавляем обработчик обновления пользователя
                socketInstance.on('user:updated', async (userData) => {
                    if (session?.user?.email === userData.email) {
                        try {
                            await update({
                                ...session,
                                user: {
                                    ...session.user,
                                    ...userData
                                }
                            });
                        } catch (error) {
                            console.error('Error updating session:', error);
                        }
                    }
                });

                socketInstance.on('disconnect', () => {
                    console.log('Socket disconnected');
                    setIsConnected(false);
                });

                socketInstance.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setIsConnected(false);
                });

                setSocket(socketInstance);
            } catch (error) {
                console.error('Socket initialization error:', error);
                setSocket(null);
                setIsConnected(false);
            }
        };

        if (status === 'authenticated') {
            initSocket();
        } else {
            setSocket(null);
            setIsConnected(false);
        }

        return () => {
            if (socketInstance) {
                if (session?.user?.email) {
                    socketInstance.emit('leave:user', session.user.email);
                }
                if (session?.user?.role === 'ADMIN') {
                    socketInstance.emit('leave:admin');
                }
                socketInstance.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [status, session?.user, handleUserUpdate]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}