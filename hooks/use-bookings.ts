import useSWR from 'swr';
import { Booking, Hotel, Room } from '@prisma/client';

interface BookingWithDetails extends Booking {
    Hotel: Hotel;
    Room: Room;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
};

export function useBookings() {
    const { data, error, isLoading, mutate } = useSWR<BookingWithDetails[]>(
        '/api/mybookings',
        fetcher,
        {
            refreshInterval: 5000,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    return {
        bookings: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}