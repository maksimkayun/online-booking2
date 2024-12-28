import { useEffect, useMemo, useState } from "react";
import { Room } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";
import { ru } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/createBooking";
import { useSession } from "next-auth/react";
import {mutate} from "swr";

interface BookingFormProps {
    room: Room;
    hotelId: string;
    existingBookings: Array<{ startDate: string; endDate: string; }>;
}

export function BookingForm({ room, hotelId, existingBookings }: BookingFormProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { data: session } = useSession();

    const totalNights = dateRange?.from && dateRange?.to
        ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const totalPrice = room.roomPrice * totalNights;

    // Преобразуем даты бронирований из строк в объекты Date
    const bookings = useMemo(() => {
        return existingBookings.map(booking => ({
            startDate: new Date(booking.startDate),
            endDate: new Date(booking.endDate)
        }));
    }, [existingBookings]);

    // Функция для проверки, доступна ли дата для бронирования
    const isDateDisabled = (date: Date) => {
        // Проверяем прошедшие даты
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isBefore(date, today)) {
            return true;
        }

        // Проверяем пересечения с существующими бронированиями
        return bookings.some(booking =>
            isWithinInterval(date, {
                start: booking.startDate,
                end: booking.endDate
            })
        );
    };

    // Проверяем выбранный диапазон на пересечения с существующими бронированиями
    const isRangeValid = (start: Date, end: Date) => {
        if (!start || !end) return false;

        // Проверяем каждый день в диапазоне
        const current = new Date(start);
        while (current <= end) {
            if (isDateDisabled(current)) {
                return false;
            }
            current.setDate(current.getDate() + 1);
        }
        return true;
    };

    const handleBooking = async () => {
        if (!session) {
            toast({
                title: "Требуется авторизация",
                description: "Войдите в систему для бронирования",
                variant: "destructive"
            });
            router.push('/auth/signin');
            return;
        }

        if (!dateRange?.from || !dateRange?.to) {
            toast({
                variant: "destructive",
                title: "Выберите даты",
                description: "Необходимо выбрать даты бронирования",
            });
            return;
        }

        try {
            setIsLoading(true);

            // Создаем бронирование
            await createBooking(
                room.id,
                hotelId,
                dateRange.from,
                dateRange.to,
                totalPrice
            );

            // Принудительно обновляем данные
            await mutate('/api/mybookings');

            toast({
                title: "Успешно!",
                description: "Бронирование создано",
            });

            router.push('/my-bookings');
        } catch (error) {
            console.error('Booking error:', error);
            let errorMessage = "Не удалось создать бронирование";

            if (error instanceof Error) {
                if (error.message === "Room is already booked for these dates") {
                    errorMessage = "Номер уже забронирован на выбранные даты";
                }
            }

            toast({
                variant: "destructive",
                title: "Ошибка",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Бронирование номера</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'dd MMM yyyy', { locale: ru })} -{' '}
                                            {format(dateRange.to, 'dd MMM yyyy', { locale: ru })}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'dd MMM yyyy', { locale: ru })
                                    )
                                ) : (
                                    'Выберите даты проживания'
                                )}
                            </span>
                        </div>

                        <div className="overflow-auto p-4 rounded-md border max-h-[500px]">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                disabled={isDateDisabled}
                                locale={ru}
                                className="mx-auto"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Стоимость за ночь</span>
                                <span className="font-medium">{room.roomPrice}₽</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Количество ночей</span>
                                <span className="font-medium">{totalNights}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                                <span>Итого</span>
                                <span>{totalPrice}₽</span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleBooking}
                            disabled={!dateRange?.from || !dateRange?.to || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Оформление...
                                </>
                            ) : (
                                'Забронировать'
                            )}
                        </Button>

                        {!session && (
                            <p className="text-sm text-muted-foreground text-center">
                                Необходимо войти в систему для бронирования
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}