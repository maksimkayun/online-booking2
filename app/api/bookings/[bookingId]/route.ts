import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
    req: Request,
    { params }: { params: { bookingId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Получаем пользователя по email
        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
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

        if (booking.userId !== user.id) {
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
        const deletedBooking = await prismadb.booking.delete({
            where: {
                id: params.bookingId,
            },
        });

        // Отправляем событие через веб-сокет
        const res = req as any;
        if (res.socket?.server?.io) {
            // Оповещаем пользователя об отмене его бронирования
            res.socket.server.io.to(`user:${user.id}:bookings`).emit('booking:cancelled', {
                bookingId: params.bookingId,
                userId: user.id
            });
        }

        return NextResponse.json(deletedBooking);
    } catch (error) {
        console.error('[BOOKING_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}