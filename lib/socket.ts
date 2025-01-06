import { Socket } from 'socket.io-client';
import { createContext, useContext } from 'react';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

type SocketContextType = {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};