import { PropsWithChildren, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { SocketContext } from '@/lib/socket';
import { useSession } from 'next-auth/react';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export function SocketProvider({ children }: PropsWithChildren) {
    const [socket, setSocket] = useState<SocketType | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        let socketInstance: SocketType | null = null;

        const initSocket = async () => {
            // Создаем сокет только если пользователь аутентифицирован
            if (status !== 'authenticated' || !process.env.NEXT_PUBLIC_APP_URL) {
                return null;
            }

            try {
                // Динамический импорт socket.io-client
                const { io } = await import('socket.io-client');

                const newSocket = io(process.env.NEXT_PUBLIC_APP_URL, {
                    path: '/api/socket/io',
                    addTrailingSlash: false,
                }) as SocketType;

                // Базовые обработчики событий сокета
                newSocket.on('connect', () => {
                    console.log('Socket connected');

                    // Подключаемся к комнате пользователя
                    if (session?.user?.email) {
                        newSocket.emit('join:user', session.user.email);
                    }

                    // Админ подключается к админской комнате
                    if (session?.user?.role === 'ADMIN') {
                        newSocket.emit('join:admin');
                    }
                });

                return newSocket;
            } catch (error) {
                console.error('Socket initialization error:', error);
                return null;
            }
        };

        initSocket().then(instance => {
            socketInstance = instance;
            setSocket(instance);
        });

        // Очистка при размонтировании
        return () => {
            if (socketInstance?.connected) {
                if (session?.user?.email) {
                    socketInstance.emit('leave:user', session.user.email);
                }
                if (session?.user?.role === 'ADMIN') {
                    socketInstance.emit('leave:admin');
                }
                socketInstance.disconnect();
            }
        };
    }, [session?.user?.email, session?.user?.role, status]);

    return (
        <SocketContext.Provider value={{ socket, isConnected: Boolean(socket?.connected) }}>
            {children}
        </SocketContext.Provider>
    );
}