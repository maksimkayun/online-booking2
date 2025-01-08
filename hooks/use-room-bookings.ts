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
    const { data, error, isLoading, mutate } = useSWR<Booking[]>(
        hotelId && roomId ? `/api/hotels/${hotelId}/rooms/${roomId}/bookings` : null,
        fetcher,
        {
            dedupingInterval: 2000, // Добавляем интервал дедупликации
            revalidateOnFocus: false, // Отключаем ревалидацию при фокусе
            revalidateOnMount: true,
            revalidateIfStale: false
        }
    );

    return {
        existingBookings: data || [],
        isLoading,
        isError: error,
        mutate
    };
}