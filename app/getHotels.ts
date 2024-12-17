import { prismadb } from "@/lib/prismadb";
import { cache } from 'react';

// Кешируем функцию для избежания повторных запросов к БД
export const getHotels = cache(async () => {
    try {
        const hotels = await prismadb.hotel.findMany({
            orderBy: {
                addedAt: 'desc'
            },
        });

        return hotels;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        throw new Error('Failed to fetch hotels');
    }
});