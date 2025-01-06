'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/hooks/use-bookings";
import { useSocket } from "@/lib/socket";
import BookingsList from "@/components/bookings/BookingsList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {BookingWithDetails} from "@/types/socket";

export default function MyBookingsPage() {
    const { bookings, isLoading, mutate } = useBookings();
    const router = useRouter();
    const { socket } = useSocket();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Получаем ID пользователя при первой загрузке
        const fetchUserId = async () => {
            try {
                const response = await fetch('/api/user/profile');
                if (!response.ok) throw new Error('Failed to fetch user profile');
                const data = await response.json();
                setUserId(data.id);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        if (!socket || !userId) return;

        // Подписываемся на обновления бронирований
        socket.emit('join-user-bookings', userId);

        // Обработка события отмены бронирования
        const handleBookingCancelled = (data: BookingWithDetails) => {
            if (data.userId === userId) {
                mutate(); // Обновляем список бронирований
            }
        };

        // Обработка события создания бронирования
        const handleBookingCreated = (data: { userId: string }) => {
            if (data.userId === userId) {
                mutate();
            }
        };

        socket.on('booking:cancelled', handleBookingCancelled);
        socket.on('booking:created', handleBookingCreated);

        return () => {
            socket.off('booking:cancelled', handleBookingCancelled);
            socket.off('booking:created', handleBookingCreated);
            socket.emit('leave-user-bookings', userId);
        };
    }, [socket, userId, mutate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Мои бронирования</h1>
                    <p className="text-muted-foreground mt-2">
                        Управляйте своими бронированиями
                    </p>
                </div>
                <Button onClick={() => router.push('/')}>
                    Забронировать номер
                </Button>
            </div>

            <BookingsList bookings={bookings} onCancelSuccess={() => mutate()} />
        </div>
    );
}