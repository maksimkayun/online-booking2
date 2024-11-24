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

        // Проверяем, не забронирован ли номер на эти даты
        const existingBooking = await prismadb.booking.findFirst({
            where: {
                roomId,
                OR: [
                    {
                        AND: [
                            { startDate: { lte: new Date(startDate) } },
                            { endDate: { gte: new Date(startDate) } }
                        ]
                    },
                    {
                        AND: [
                            { startDate: { lte: new Date(endDate) } },
                            { endDate: { gte: new Date(endDate) } }
                        ]
                    }
                ]
            }
        });

        if (existingBooking) {
            return new NextResponse("Room is already booked for these dates", { status: 400 });
        }

        const booking = await prismadb.booking.create({
            data: {
                userId,
                roomId,
                hotelId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                totalPrice
            }
        });

        return NextResponse.json(booking);
    } catch (error) {
        console.log('[BOOKINGS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}