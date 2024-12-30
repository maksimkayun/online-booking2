import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { Hotel, Room } from '@prisma/client';

export function useSocketHotel(hotelId: string | undefined) {
    const [hotel, setHotel] = useState<Hotel & { rooms: Room[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { socket } = useSocket();

    const fetchHotel = useCallback(async () => {
        if (!hotelId) return;

        try {
            const response = await fetch(`/api/hotels/${hotelId}`);
            if (!response.ok) throw new Error('Failed to fetch hotel');
            const data = await response.json();
            setHotel(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchHotel();

        if (!socket || !hotelId) return;

        socket.on('hotel:updated', (updatedHotel) => {
            if (updatedHotel.id === hotelId) {
                setHotel(current => ({
                    ...current!,
                    ...updatedHotel,
                }));
            }
        });

        return () => {
            socket.off('hotel:updated');
        };
    }, [socket, hotelId, fetchHotel]);

    return { hotel, isLoading, error, refetch: fetchHotel };
}