'use server'

import { redirect } from 'next/navigation';
import { auth } from "@clerk/nextjs/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL must be set in environment variables');
}

export async function createBooking(
    roomId: string,
    hotelId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number
) {
    try {
        const { getToken } = await auth();
        // Получаем токен для авторизации
        const token = await getToken();

        if (!token) {
            throw new Error('Unauthorized: No token available');
        }

        const url = new URL('/api/bookings', APP_URL);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                roomId,
                hotelId,
                startDate,
                endDate,
                totalPrice,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Booking error response:', errorData);
            throw new Error(`Failed to book room: ${errorData}`);
        }

        const data = await response.json();
        console.log('Booking success:', data);

        redirect('/my-bookings');
    } catch (error) {
        console.error('Booking error:', error);
        throw error;
    }
}