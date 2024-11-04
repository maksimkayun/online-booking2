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

        return hotel;
    } catch (error) {
        console.error('[GET_HOTEL]', error);
        throw new Error("Ошибка при получении отеля");
    }
};