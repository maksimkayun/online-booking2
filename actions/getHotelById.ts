// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { prismadb } from "@/lib/prismadb";
import { Hotel, Room } from "@prisma/client";

interface HotelWithRooms extends Omit<Hotel, 'rating'> {
    rating: number;
    rooms: Room[];
}

export const getHotelById = async (hotelId: string): Promise<HotelWithRooms | null> => {
    try {
        const hotel = await prismadb.hotel.findUnique({
            where: {
                id: hotelId
            },
            include: {
                rooms: true
            }
        });

        if (!hotel) return null;

        // Convert Decimal to number for the rating
        return {
            ...hotel,
            rating: hotel.rating.toNumber(),
            rooms: hotel.rooms
        };
    } catch (error) {
        console.error('[GET_HOTEL]', error);
        throw new Error("Ошибка при получении отеля");
    }
};