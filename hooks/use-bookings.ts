import useSWR from 'swr';
import { Booking, Hotel, Room } from '@prisma/client';
import { useEffect } from 'react';
import { useSocket } from '@/lib/socket';

interface BookingWithDetails extends Booking {
    Hotel: Hotel;
    Room: Room;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.message = await res.text();
        throw error;
    }
    return res.json();
};

export function useBookings() {
    const { data, error, isLoading, mutate } = useSWR<BookingWithDetails[]>(
        '/api/mybookings',
        fetcher,
        {
            dedupingInterval: 5000,
            revalidateOnFocus: true,
            revalidateIfStale: true,
            revalidateOnReconnect: true,
            shouldRetryOnError: true,
            errorRetryCount: 3
        }
    );

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleBookingChange = () => {
            mutate();
        };

        socket.on('booking:created', handleBookingChange);
        socket.on('booking:cancelled', handleBookingChange);
        socket.on('booking:updated', handleBookingChange);

        return () => {
            socket.off('booking:created', handleBookingChange);
            socket.off('booking:cancelled', handleBookingChange);
            socket.off('booking:updated', handleBookingChange);
        };
    }, [socket, mutate]);

    return {
        bookings: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}