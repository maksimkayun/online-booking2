import { prismadb } from "@/lib/prismadb";

export const getHotels = async () => {
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
};