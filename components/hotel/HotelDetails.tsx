'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Room, Hotel } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBooking } from '@/actions/createBooking';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type HotelWithRooms = Hotel & {
    rooms: Room[];
};

interface HotelDetailsProps {
    hotel: HotelWithRooms;
    isOwner: boolean;
    isBookingPage?: boolean;
}

export default function HotelDetails({ hotel, isOwner, isBookingPage }: HotelDetailsProps) {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const bookingRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (window.location.hash === '#booking' && bookingRef.current) {
            bookingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleBooking = async () => {
        if (!selectedRoom || !startDate || !endDate) {
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
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const room = hotel.rooms.find(r => r.id === selectedRoom);
            if (!room) return;

            const totalPrice = totalNights * room.roomPrice;

            await createBooking(
                selectedRoom,
                hotel.id,
                startDate,
                endDate,
                totalPrice
            );

            toast({
                title: "Успешно!",
                description: "Бронирование создано",
            });

            router.refresh();
            router.push('/my-bookings');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось создать бронирование",
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
    const totalNights = startDate && endDate ?
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
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
                    <h1 className="text-3xl font-bold">{hotel.title}</h1>
                    <p className="text-muted-foreground">{hotel.description}</p>

                    <div ref={bookingRef}>
                        <h2 className="text-xl font-semibold mb-4">Выберите даты</h2>
                        <div className="flex gap-4 flex-wrap">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                className="rounded-md border"
                                disabled={(date) => date < new Date()}
                            />
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                className="rounded-md border"
                                disabled={(date) => date < (startDate || new Date())}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotel.rooms.map((room) => (
                    <Card
                        key={room.id}
                        className={`transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-primary/50 ${
                            selectedRoom === room.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
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

            {isBookingPage && (
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
                                            {startDate && endDate ? (
                                                <>
                                                    {format(startDate, 'dd MMM', { locale: ru })} -{' '}
                                                    {format(endDate, 'dd MMM yyyy', { locale: ru })}
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
                                    disabled={!selectedRoom || !startDate || !endDate || isLoading}
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