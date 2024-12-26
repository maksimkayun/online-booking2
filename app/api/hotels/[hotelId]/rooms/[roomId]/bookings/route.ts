import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { hotelId: string; roomId: string } }
) {
    try {
        const bookings = await prismadb.booking.findMany({
            where: {
                roomId: params.roomId,
                hotelId: params.hotelId,
                // Получаем только будущие и текущие бронирования
                endDate: {
                    gte: new Date()
                }
            },
            select: {
                startDate: true,
                endDate: true
            }
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.log('[ROOM_BOOKINGS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}