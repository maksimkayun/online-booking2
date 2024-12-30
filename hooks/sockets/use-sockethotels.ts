import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { Hotel } from '@prisma/client';

// Хук для работы с отелями
export function useSocketHotels() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { socket } = useSocket();

    const fetchHotels = useCallback(async () => {
        try {
            const response = await fetch('/api/hotels');
            if (!response.ok) throw new Error('Failed to fetch hotels');
            const data = await response.json();
            setHotels(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHotels();

        if (!socket) return;

        socket.on('hotel:created', (newHotel) => {
            setHotels(prev => [...prev, newHotel]);
        });

        socket.on('hotel:updated', (updatedHotel) => {
            setHotels(prev =>
                prev.map(hotel => hotel.id === updatedHotel.id ? updatedHotel : hotel)
            );
        });

        socket.on('hotel:deleted', (hotelId) => {
            setHotels(prev => prev.filter(hotel => hotel.id !== hotelId));
        });

        return () => {
            socket.off('hotel:created');
            socket.off('hotel:updated');
            socket.off('hotel:deleted');
        };
    }, [socket, fetchHotels]);

    return { hotels, isLoading, error, refetch: fetchHotels };
}