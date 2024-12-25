'use client';

import { Hotel, Room, Booking } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CalendarDays, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingWithDetails extends Booking {
    Hotel: Hotel;
    Room: Room;
}

interface BookingsListProps {
    bookings: BookingWithDetails[];
}

export default function BookingsList({ bookings }: BookingsListProps) {
    const router = useRouter();

    if (!bookings?.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-2xl font-semibold">У вас пока нет бронирований</h2>
                <p className="text-muted-foreground text-center">
                    Забронируйте номер в одном из наших отелей
                </p>
            </div>
        );
    }

    const isBookingActive = (booking: BookingWithDetails) => {
        const now = new Date();
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        return now >= startDate && now <= endDate;
    };

    const isBookingUpcoming = (booking: BookingWithDetails) => {
        const now = new Date();
        const startDate = new Date(booking.startDate);
        return now < startDate;
    };

    const getBookingStatus = (booking: BookingWithDetails) => {
        if (isBookingActive(booking)) {
            return { label: "Активно", variant: "default" as const };
        }
        if (isBookingUpcoming(booking)) {
            return { label: "Предстоит", variant: "secondary" as const };
        }
        return { label: "Завершено", variant: "outline" as const };
    };

    const groupedBookings = bookings.reduce((acc, booking) => {
        const status = getBookingStatus(booking).label;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(booking);
        return acc;
    }, {} as Record<string, BookingWithDetails[]>);

    return (
        <div className="space-y-8">
            {Object.entries(groupedBookings).map(([status, statusBookings]) => (
                <div key={status} className="space-y-4">
                    <h2 className="text-2xl font-bold">{status}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statusBookings.map((booking) => (
                            <Card
                                key={booking.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => router.push(`/hotel/${booking.hotelId}`)}
                            >
                                <CardHeader className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="line-clamp-1">
                                            {booking.Hotel.title}
                                        </CardTitle>
                                        <Badge variant={getBookingStatus(booking).variant}>
                                            {getBookingStatus(booking).label}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {booking.Room.title}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image
                                            src={booking.Room.image}
                                            alt={booking.Room.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {format(new Date(booking.startDate), 'dd MMM yyyy', { locale: ru })} -{' '}
                                                {format(new Date(booking.endDate), 'dd MMM yyyy', { locale: ru })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {booking.Room.roomPrice}₽ за ночь
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Итого:</span>
                                                <span className="font-semibold">
                                                    {booking.totalPrice}₽
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}