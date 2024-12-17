import useSWR from 'swr';
import { Hotel, Room } from '@prisma/client';

interface HotelWithRooms extends Hotel {
    rooms: Room[];
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch hotel data');
    return res.json();
};

export function useHotel(hotelId?: string) {
    const { data, error, isLoading, mutate } = useSWR<HotelWithRooms>(
        hotelId ? `/api/hotels/${hotelId}` : null,
        fetcher,
        {
            refreshInterval: 3000,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        hotel: data,
        isLoading,
        isError: error,
        mutate,
    };
}