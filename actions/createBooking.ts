'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createBooking(
    roomId: string,
    hotelId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            redirect('/auth/signin');
        }

        // Получаем пользователя по email
        const user = await prismadb.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Проверяем, не забронирован ли номер на эти даты
        const existingBooking = await prismadb.booking.findFirst({
            where: {
                roomId,
                AND: [
                    {
                        OR: [
                            {
                                AND: [
                                    { startDate: { lte: startDate } },
                                    { endDate: { gte: startDate } }
                                ]
                            },
                            {
                                AND: [
                                    { startDate: { lte: endDate } },
                                    { endDate: { gte: endDate } }
                                ]
                            },
                            {
                                AND: [
                                    { startDate: { gte: startDate } },
                                    { endDate: { lte: endDate } }
                                ]
                            }
                        ]
                    }
                ]
            }
        });

        if (existingBooking) {
            throw new Error("Room is already booked for these dates");
        }

        // Создаем бронирование
        const booking = await prismadb.booking.create({
            data: {
                userId: user.id,
                roomId,
                hotelId,
                startDate,
                endDate,
                totalPrice
            }
        });

        revalidatePath('/my-bookings');
        revalidatePath(`/hotel/${hotelId}`);

        redirect('/my-bookings');
    } catch (error) {
        console.error('Booking error:', error);
        throw error;
    }
}