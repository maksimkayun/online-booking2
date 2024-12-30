import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { User } from '@prisma/client';

export function useSocketPermissions() {
    const [permissions, setPermissions] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { socket } = useSocket();

    const fetchPermissions = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/permissions');
            if (!response.ok) throw new Error('Failed to fetch permissions');
            const data = await response.json();
            setPermissions(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();

        if (!socket) return;

        socket.on('permissions:updated', fetchPermissions);

        return () => {
            socket.off('permissions:updated');
        };
    }, [socket, fetchPermissions]);

    return { permissions, isLoading, error, refetch: fetchPermissions };
}