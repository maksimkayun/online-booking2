import { PropsWithChildren, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '@/lib/socket';
import { mutate } from "swr";
import { useSession } from 'next-auth/react';

export function SocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { status } = useSession();

    useEffect(() => {
        let socketInstance: Socket | null = null;

        const initSocket = async () => {
            if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_APP_URL || status !== 'authenticated') {
                return;
            }

            try {
                // Динамический импорт socket.io-client только на клиенте
                const io = (await import('socket.io-client')).io;

                socketInstance = io(process.env.NEXT_PUBLIC_APP_URL, {
                    path: '/api/socket/io',
                    addTrailingSlash: false,
                    transports: ['polling'],
                    reconnection: true,
                    reconnectionAttempts: 3,
                    reconnectionDelay: 1000,
                });

                socketInstance.on('connect', () => {
                    console.log('Socket connected');
                    setIsConnected(true);
                });

                socketInstance.on('disconnect', () => {
                    console.log('Socket disconnected');
                    setIsConnected(false);
                });

                socketInstance.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setIsConnected(false);
                });

                // Обработчики событий
                const events = {
                    'booking:created': () => mutate('/api/mybookings'),
                    'booking:cancelled': () => mutate('/api/mybookings'),
                    'hotel:created': () => mutate('/api/hotels'),
                    'hotel:updated': () => mutate('/api/hotels'),
                    'hotel:deleted': () => mutate('/api/hotels'),
                };

                Object.entries(events).forEach(([event, handler]) => {
                    socketInstance?.on(event, handler);
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
                socketInstance.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [status]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}