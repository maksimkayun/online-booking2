'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Room, Hotel } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBooking } from '@/actions/createBooking';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { useRoomBookings } from '@/hooks/use-room-bookings';

type HotelWithRooms = Hotel & {
    rooms: Room[];
};

interface HotelDetailsProps {
    hotel: HotelWithRooms;
    isOwner: boolean;
    isBookingPage?: boolean;
}

export default function HotelDetails({ hotel, isOwner, isBookingPage = false }: HotelDetailsProps) {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const bookingRef = useRef<HTMLDivElement>(null);

    // Получаем существующие бронирования для выбранного номера
    const { bookings } = useRoomBookings(hotel.id, selectedRoom ?? undefined);

    // Проверяем, есть ли пересечения с существующими бронями
    const hasOverlap = (start: Date, end: Date) => {
        return bookings.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);

            // Проверяем все возможные случаи пересечения периодов
            return (
                (start <= bookingEnd && end >= bookingStart) || // Общий случай пересечения
                (start >= bookingStart && start <= bookingEnd) || // Начало внутри существующей брони
                (end >= bookingStart && end <= bookingEnd) || // Конец внутри существующей брони
                (start <= bookingStart && end >= bookingEnd) // Новая бронь полностью включает существующую
            );
        });
    };

    // Функция для проверки, доступна ли дата для бронирования
    const isDateDisabled = (date: Date) => {
        // Нельзя выбрать прошедшие даты
        if (isBefore(date, new Date())) {
            return true;
        }

        // Если уже выбрана начальная дата, проверяем пересечения
        if (dateRange?.from && !dateRange.to) {
            // Если текущая дата раньше выбранной начальной, проверяем период
            if (date < dateRange.from) {
                return hasOverlap(date, dateRange.from);
            }
            // Если текущая дата позже выбранной начальной, проверяем период
            return hasOverlap(dateRange.from, date);
        }

        // Проверяем, не попадает ли дата в период существующих броней
        return bookings.some(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            return isWithinInterval(date, { start: startDate, end: endDate });
        });
    };

    // Сбрасываем выбранные даты при смене номера
    useEffect(() => {
        setDateRange(undefined);
    }, [selectedRoom]);

    useEffect(() => {
        if (window.location.hash === '#booking' && bookingRef.current) {
            bookingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleRoomSelect = (roomId: string) => {
        setSelectedRoom(selectedRoom === roomId ? null : roomId);
    };

    const handleResetDates = () => {
        setDateRange(undefined);
    };

    const handleBooking = async () => {
        if (!selectedRoom || !dateRange?.from || !dateRange?.to) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Выберите номер и даты бронирования",
            });
            return;
        }

        try {
            setIsLoading(true);
            const totalNights = Math.ceil(
                (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
            );
            const room = hotel.rooms.find(r => r.id === selectedRoom);
            if (!room) return;

            const totalPrice = totalNights * room.roomPrice;

            await createBooking(
                selectedRoom,
                hotel.id,
                dateRange.from,
                dateRange.to,
                totalPrice
            );

            toast({
                title: "Успешно!",
                description: "Бронирование создано",
            });

            router.refresh();
            router.push('/my-bookings');
        } catch (error) {
            let errorMessage = "Не удалось создать бронирование";

            if (error instanceof Response && error.status === 409) {
                errorMessage = "Выбранные даты уже забронированы другим пользователем";
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

    if (isOwner) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Управление отелем</h1>
                    <p className="text-muted-foreground mt-2">
                        Вы не можете забронировать номер в собственном отеле
                    </p>
                </div>
                <Button
                    onClick={() => router.push(`/hotel/${hotel.id}`)}
                    className="w-full md:w-auto"
                >
                    Редактировать отель
                </Button>
            </div>
        );
    }

    const selectedRoomData = selectedRoom ? hotel.rooms.find(r => r.id === selectedRoom) : null;
    const totalNights = dateRange?.from && dateRange?.to ?
        Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const totalPrice = selectedRoomData ? totalNights * selectedRoomData.roomPrice : 0;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-[400px]">
                    <Image
                        src={hotel.image}
                        alt={hotel.title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">{hotel.title}</h1>
                        {!isOwner && !isBookingPage && (
                            <Button
                                onClick={() => router.push(`/hotel/${hotel.id}/book`)}
                                className="ml-4"
                                size="lg"
                            >
                                Забронировать
                            </Button>
                        )}
                    </div>
                    <p className="text-muted-foreground">{hotel.description}</p>

                    {isBookingPage && selectedRoom && (
                        <div ref={bookingRef}>
                            <h2 className="text-xl font-semibold mb-4">Выберите даты</h2>
                            <div className="flex gap-2">
                                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateRange && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, 'dd.MM.yy')} -{' '}
                                                        {format(dateRange.to, 'dd.MM.yy')}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, 'dd.MM.yy')
                                                )
                                            ) : (
                                                <span>Выберите даты бронирования</span>
                                            )}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="p-0">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={(range) => {
                                                if (range?.from && range?.to && hasOverlap(range.from, range.to)) {
                                                    toast({
                                                        variant: "destructive",
                                                        title: "Ошибка",
                                                        description: "Выбранный период пересекается с существующими бронированиями"
                                                    });
                                                    return;
                                                }
                                                setDateRange(range);
                                            }}
                                            locale={ru}
                                            disabled={isDateDisabled}
                                            numberOfMonths={2}
                                        />
                                    </DialogContent>
                                </Dialog>
                                {dateRange && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleResetDates}
                                        className="shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator className="my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotel.rooms.map((room) => (
                    <Card
                        key={room.id}
                        className={cn(
                            "transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-primary/50",
                            selectedRoom === room.id ? 'ring-2 ring-primary' : ''
                        )}
                        onClick={() => handleRoomSelect(room.id)}
                    >
                        <div className="relative h-48">
                            <Image
                                src={room.image}
                                alt={room.title}
                                fill
                                className="object-cover rounded-t-lg"
                            />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{room.title}</span>
                                <Badge variant="secondary">{room.roomPrice}₽/ночь</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{room.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isBookingPage && selectedRoom && (
                <>
                    <Separator className="my-8" />

                    <div className="max-w-md mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Детали бронирования</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedRoomData && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-muted-foreground">Номер:</div>
                                        <div className="font-medium">{selectedRoomData.title}</div>

                                        <div className="text-muted-foreground">Даты:</div>
                                        <div className="font-medium">
                                            {dateRange?.from && dateRange?.to ? (
                                                <>
                                                    {format(dateRange.from, 'dd MMM', { locale: ru })} -{' '}
                                                    {format(dateRange.to, 'dd MMM yyyy', { locale: ru })}
                                                </>
                                            ) : (
                                                'Не выбраны'
                                            )}
                                        </div>

                                        <div className="text-muted-foreground">Количество ночей:</div>
                                        <div className="font-medium">{totalNights}</div>

                                        <div className="text-muted-foreground">Стоимость за ночь:</div>
                                        <div className="font-medium">{selectedRoomData.roomPrice}₽</div>

                                        <div className="text-muted-foreground">Итого:</div>
                                        <div className="font-medium text-lg">{totalPrice}₽</div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={handleBooking}
                                    disabled={!selectedRoom || !dateRange?.from || !dateRange?.to || isLoading}
                                >
                                    {isLoading ? 'Оформление...' : 'Оформить бронирование'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}