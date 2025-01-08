'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Booking, Room, User } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { X, Loader2, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import useSWR from 'swr';

interface BookingWithDetails extends Booking {
    user: Pick<User, 'id' | 'name' | 'email'>;
    Room: Room;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
};

export default function HotelBookingsPage() {
    const params = useParams();
    const hotelId = params?.hotelId as string;
    const { toast } = useToast();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    // Получаем информацию об отеле для проверки владельца
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: hotel, error: hotelError } = useSWR(
        `/api/hotels/${hotelId}`,
        fetcher
    );

    const isOwner = hotel?.userEmail === session?.user?.email;
    const canManageBookings = isAdmin || isOwner;

    // Загружаем бронирования только если пользователь имеет права
    const { data: bookings, error, isLoading, mutate } = useSWR<BookingWithDetails[]>(
        canManageBookings ? `/api/hotels/${hotelId}/bookings` : null,
        fetcher,
        {
            refreshInterval: canManageBookings ? 5000 : 0,
            revalidateOnFocus: canManageBookings,
        }
    );

    const handleCancelBooking = async (bookingId: string) => {
        if (!canManageBookings) return;

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            toast({
                title: "Успешно!",
                description: "Бронирование отменено"
            });

            mutate();
        } catch (error) {
            console.error('Error canceling booking:', error);
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось отменить бронирование"
            });
        }
    };

    // Если нет прав доступа, показываем сообщение
    if (!isAdmin && !isOwner) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Доступ запрещен
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Вы не можете управлять бронями чужого отеля</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-destructive">Произошла ошибка при загрузке бронирований</p>
            </div>
        );
    }

    // Остальной код остается без изменений...
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

    const groupedBookings = (bookings || []).reduce((acc, booking) => {
        const status = getBookingStatus(booking).label;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(booking);
        return acc;
    }, {} as Record<string, BookingWithDetails[]>);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Управление бронированиями</h1>
                    <p className="text-muted-foreground">
                        Просмотр и управление бронированиями отеля
                    </p>
                </div>
            </div>

            {Object.entries(groupedBookings).map(([status, statusBookings]) => (
                <div key={status} className="space-y-4">
                    <h2 className="text-2xl font-bold">{status}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statusBookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="line-clamp-1">
                                            {booking.user.name || booking.user.email}
                                        </CardTitle>
                                        <Badge variant={getBookingStatus(booking).variant}>
                                            {getBookingStatus(booking).label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {format(new Date(booking.startDate), 'dd MMM yyyy', { locale: ru })} -{' '}
                                                {format(new Date(booking.endDate), 'dd MMM yyyy', { locale: ru })}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Номер: {booking.Room.title}</p>
                                            <p className="text-sm text-muted-foreground">Стоимость: {booking.totalPrice}₽</p>
                                        </div>
                                    </div>

                                    {isBookingUpcoming(booking) && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    className="w-full"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Отменить бронирование
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
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
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Отменить бронирование
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {!bookings?.length && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <h2 className="text-2xl font-semibold">Нет бронирований</h2>
                    <p className="text-muted-foreground">
                        В данный момент нет активных бронирований
                    </p>
                </div>
            )}
        </div>
    );
}