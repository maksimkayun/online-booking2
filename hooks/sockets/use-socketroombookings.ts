import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';

export function useSocketRoomBookings(hotelId?: string, roomId?: string) {
    const [bookings, setBookings] = useState<Array<{ startDate: string; endDate: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { socket } = useSocket();

    const fetchRoomBookings = useCallback(async () => {
        if (!hotelId || !roomId) return;

        try {
            const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}/bookings`);
            if (!response.ok) throw new Error('Failed to fetch room bookings');
            const data = await response.json();
            setBookings(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [hotelId, roomId]);

    useEffect(() => {
        fetchRoomBookings();

        if (!socket || !roomId) return;

        // Подписываемся на обновления комнаты
        socket.emit('join:room', roomId);

        socket.on('room:bookings:updated', (data) => {
            if (data.roomId === roomId) {
                fetchRoomBookings();
            }
        });

        return () => {
            socket.emit('leave:room', roomId);
            socket.off('room:bookings:updated');
        };
    }, [socket, roomId, fetchRoomBookings]);

    return { bookings, isLoading, error, refetch: fetchRoomBookings };
}