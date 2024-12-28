import {PropsWithChildren, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import { SocketContext } from '@/lib/socket';
import {mutate} from "swr";

export function SocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL!, {
            path: '/api/socket/io',
            addTrailingSlash: false,
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        // Глобальные обработчики событий
        socketInstance.on('booking:created', () => {
            mutate('/api/mybookings');  // Обновляем список бронирований
        });

        socketInstance.on('booking:cancelled', () => {
            mutate('/api/mybookings');  // Обновляем список бронирований
        });

        socketInstance.on('hotel:created', () => {
            mutate('/api/hotels');  // Обновляем список отелей
        });

        socketInstance.on('hotel:updated', () => {
            mutate('/api/hotels');  // Обновляем список отелей
        });

        socketInstance.on('hotel:deleted', () => {
            mutate('/api/hotels');  // Обновляем список отелей
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}