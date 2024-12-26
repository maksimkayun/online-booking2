import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const body = await req.json();

        const { roomId, hotelId, startDate, endDate, totalPrice } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!roomId || !hotelId || !startDate || !endDate || !totalPrice) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        // Проверяем валидность дат
        if (newStartDate >= newEndDate) {
            return new NextResponse("Invalid date range", { status: 400 });
        }

        if (newStartDate < new Date()) {
            return new NextResponse("Cannot book dates in the past", { status: 400 });
        }

        // Проверяем, не забронирован ли номер на эти даты
        // Используем более точную проверку пересечений
        const existingBooking = await prismadb.booking.findFirst({
            where: {
                roomId,
                AND: [
                    {
                        OR: [
                            // Новая бронь начинается во время существующей
                            {
                                AND: [
                                    { startDate: { lte: newStartDate } },
                                    { endDate: { gte: newStartDate } }
                                ]
                            },
                            // Новая бронь заканчивается во время существующей
                            {
                                AND: [
                                    { startDate: { lte: newEndDate } },
                                    { endDate: { gte: newEndDate } }
                                ]
                            },
                            // Новая бронь полностью содержит существующую
                            {
                                AND: [
                                    { startDate: { gte: newStartDate } },
                                    { endDate: { lte: newEndDate } }
                                ]
                            }
                        ]
                    }
                ]
            }
        });

        if (existingBooking) {
            return new NextResponse(
                "Room is already booked for these dates",
                { status: 409 }
            );
        }

        const booking = await prismadb.booking.create({
            data: {
                userId,
                roomId,
                hotelId,
                startDate: newStartDate,
                endDate: newEndDate,
                totalPrice
            }
        });

        return NextResponse.json(booking);
    } catch (error) {
        console.log('[BOOKINGS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}