'use client';

import {useEffect, useMemo, useState} from "react";
import { Room } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isSameDay, isWithinInterval } from "date-fns";
import { ru } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/createBooking";
import { useSession } from "next-auth/react";
import {useRoomBookings} from "@/hooks/use-room-bookings";

interface BookingFormProps {
    room: Room;
    hotelId: string;
}

export function BookingForm({ room, hotelId }: BookingFormProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { data: session } = useSession();
    const {  existingBookings, mutate } = useRoomBookings(hotelId, room.id);
    const [shouldUpdate, setShouldUpdate] = useState(true);

    const totalNights = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return 0;
        // Получаем разницу в днях, вычитаем 1 чтобы получить количество ночей
        const days = Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(days, 1); // Минимум 1 ночь
    }, [dateRange]);

    useEffect(() => {
        if (shouldUpdate) {
            mutate();
            setShouldUpdate(false);
        }
    }, [mutate, shouldUpdate]);

    const totalPrice = useMemo(() => {
        return room.roomPrice * totalNights;
    }, [room.roomPrice, totalNights]);

    // Преобразуем даты бронирований из строк в объекты Date
    const bookings = useMemo(() => {
        return existingBookings.map(booking => ({
            startDate: new Date(booking.startDate),
            endDate: new Date(booking.endDate)
        }));
    }, [existingBookings]);

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

            const result = await createBooking({
                roomId: room.id,
                hotelId,
                startDate: dateRange.from,
                endDate: dateRange.to,
                totalPrice
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast({
                title: "Успешно!",
                description: "Бронирование создано",
            });

            setShouldUpdate(true); // Устанавливаем флаг для обновления данных
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

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Проверяем прошедшие даты
        if (date < today) {
            return true;
        }

        // Проверяем пересечения с существующими бронированиями
        return bookings.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return isWithinInterval(date, { start: bookingStart, end: bookingEnd });
        });
    };

    const handleSelect = (range: DateRange | undefined) => {
        if (!range) {
            setDateRange(undefined);
            return;
        }

        // Если выбрана только начальная дата
        if (range.from && !range.to) {
            setDateRange(range);
            return;
        }

        // Если выбраны обе даты и они одинаковые, игнорируем выбор
        if (range.from && range.to && isSameDay(range.from, range.to)) {
            return;
        }

        setDateRange(range);
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
                            <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground">
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'dd MMM yyyy', {locale: ru})} -{' '}
                                            {format(dateRange.to, 'dd MMM yyyy', {locale: ru})}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'dd MMM yyyy', {locale: ru})
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
                                onSelect={handleSelect}
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
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