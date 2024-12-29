// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { prismadb } from "@/lib/prismadb";

export const getHotelById = async (hotelId: string) => {
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

        // Преобразуем Decimal в число
        return {
            ...hotel,
            rating: hotel.rating.toNumber(),
            rooms: hotel.rooms // rooms не содержат Decimal, поэтому их оставляем как есть
        };
    } catch (error) {
        console.error('[GET_HOTEL]', error);
        throw new Error("Ошибка при получении отеля");
    }
};