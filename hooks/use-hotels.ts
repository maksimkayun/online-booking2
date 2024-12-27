import useSWR from 'swr';
import { Hotel } from '@prisma/client';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch hotels');
    return res.json();
};

export function useHotels() {
    const { data, error, isLoading, mutate } = useSWR<Hotel[]>(
        '/api/hotels',
        fetcher,
        {
            refreshInterval: 0, // Убираем автообновление
            revalidateOnFocus: false, // Отключаем ревалидацию при фокусе
            revalidateIfStale: false
        }
    );

    return {
        hotels: data || [],
        isLoading,
        isError: error,
        mutate
    };
}