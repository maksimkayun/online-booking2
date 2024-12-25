'use client';

import { useBookings } from "@/hooks/use-bookings";
import BookingsList from "@/components/bookings/BookingsList";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MyBookingsPage() {
    const { bookings, isLoading } = useBookings();
    const router = useRouter();

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

            <BookingsList bookings={bookings} />
        </div>
    );
}