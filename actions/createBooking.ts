// actions/createBooking.ts
'use server'

import { redirect } from 'next/navigation';

export async function createBooking(
    roomId: string,
    hotelId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number
) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            throw new Error('Failed to book room');
        }

        redirect('/my-bookings');
    } catch (error) {
        console.error('Booking error:', error);
        throw error;
    }
}