import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function DELETE(
    req: Request,
    { params }: { params: { bookingId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем существование брони и принадлежность текущему пользователю
        const booking = await prismadb.booking.findUnique({
            where: {
                id: params.bookingId,
            },
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        if (booking.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Проверяем, не началось ли уже проживание
        if (new Date(booking.startDate) <= new Date()) {
            return new NextResponse(
                "Cannot cancel booking that has already started",
                { status: 400 }
            );
        }

        // Удаляем бронирование
        await prismadb.booking.delete({
            where: {
                id: params.bookingId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.log('[BOOKING_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}