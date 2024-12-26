import useSWR from 'swr';

interface Booking {
    startDate: string;
    endDate: string;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
};

export function useRoomBookings(hotelId?: string, roomId?: string) {
    const { data, error, isLoading } = useSWR<Booking[]>(
        hotelId && roomId ? `/api/hotels/${hotelId}/rooms/${roomId}/bookings` : null,
        fetcher,
        {
            refreshInterval: 1000, // Обновляем каждую секунду
            revalidateOnFocus: true
        }
    );

    return {
        bookings: data || [],
        isLoading,
        isError: error
    };
}