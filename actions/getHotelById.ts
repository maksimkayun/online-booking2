// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prismadb from "@/lib/prismadb";

export const getHotelById = async (hotelId: string) => {
    try {

        const response = await prismadb.hotel.findUnique({
            where: { id: hotelId },
            include: {
                rooms: true,
            },
        });
        if(!response) return null;
        return await response;

    } catch (error) {
        console.error(error);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        throw new Error(error);
    }
};