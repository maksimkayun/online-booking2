'use client';

import { Hotel, Room, Booking } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, Building2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface BookingWithDetails extends Booking {
    Hotel: Hotel;
    Room: Room;
}

interface BookingsListProps {
    bookings: BookingWithDetails[];
    onCancelSuccess?: () => void;
}

export default function BookingsList({ bookings, onCancelSuccess }: BookingsListProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();

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

    const handleCancelBooking = async (e: React.MouseEvent, bookingId: string) => {
        e.stopPropagation(); // Предотвращаем всплытие события клика
        try {
            setIsLoading(bookingId);
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            toast({
                title: "Успешно!",
                description: "Бронирование отменено",
            });

            // Вызываем колбэк успешной отмены
            onCancelSuccess?.();
        } catch (error) {
            console.error('Error canceling booking:', error);
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось отменить бронирование"
            });
        } finally {
            setIsLoading(null);
        }
    };

    const handleNavigate = (path: string) => {
        router.push(path);
    };

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
                                onClick={() => handleNavigate(`/hotel/${booking.hotelId}`)}
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
                                        {isBookingUpcoming(booking) && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        className="w-full mt-2"
                                                        disabled={isLoading === booking.id}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        {isLoading === booking.id ? 'Отмена...' : 'Отменить бронирование'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Предотвращаем всплытие клика в модальном окне */}
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Отменить бронирование?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Это действие нельзя отменить. Бронирование будет удалено.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={(e) => handleCancelBooking(e, booking.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Отменить бронирование
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
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