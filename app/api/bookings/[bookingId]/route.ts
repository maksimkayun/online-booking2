import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

        // Получаем бронирование и связанный с ним отель
        const booking = await prismadb.booking.findUnique({
            where: {
                id: params.bookingId,
            },
            include: {
                Hotel: true
            }
        });

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        // Проверяем права на отмену брони:
        // 1. Пользователь может отменить свою бронь
        // 2. Администратор может отменить любую бронь
        // 3. Менеджер может отменить бронь в своем отеле
        const isAdmin = user.role === 'ADMIN';
        const isManager = user.role === 'MANAGER';
        const isOwner = booking.userId === user.id;
        const isHotelManager = isManager && booking.Hotel.userEmail === session.user.email;

        if (!isAdmin && !isOwner && !isHotelManager) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Проверяем, не началось ли уже проживание
        // Пропускаем эту проверку для админов
        if (!isAdmin && new Date(booking.startDate) <= new Date()) {
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

        return NextResponse.json(deletedBooking);
    } catch (error) {
        console.error('[BOOKING_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}