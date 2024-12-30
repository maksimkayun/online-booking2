import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { Hotel, Room, Booking } from '@prisma/client';

export function useSocketBookings() {
    const [bookings, setBookings] = useState<Array<Booking & { Hotel: Hotel; Room: Room }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { socket } = useSocket();

    const fetchBookings = useCallback(async () => {
        try {
            const response = await fetch('/api/mybookings');
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            setBookings(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();

        if (!socket) return;

        socket.on('booking:created', fetchBookings);
        socket.on('booking:cancelled', fetchBookings);

        return () => {
            socket.off('booking:created');
            socket.off('booking:cancelled');
        };
    }, [socket, fetchBookings]);

    return { bookings, isLoading, error, refetch: fetchBookings };
}