'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from '@/lib/socket';
import { mutate } from "swr";

export function SocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.error('NEXT_PUBLIC_APP_URL is not defined');
            return;
        }

        const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            transports: ['polling', 'websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        // Глобальные обработчики событий
        socketInstance.on('booking:created', () => {
            mutate('/api/mybookings');
        });

        socketInstance.on('booking:cancelled', () => {
            mutate('/api/mybookings');
        });

        socketInstance.on('hotel:created', () => {
            mutate('/api/hotels');
        });

        socketInstance.on('hotel:updated', () => {
            mutate('/api/hotels');
        });

        socketInstance.on('hotel:deleted', () => {
            mutate('/api/hotels');
        });

        setSocket(socketInstance);

        return () => {
            if (socketInstance.connected) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}