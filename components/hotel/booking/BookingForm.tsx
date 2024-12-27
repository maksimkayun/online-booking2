import { useEffect, useRef, useState } from "react";
import { Room } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/createBooking";

interface BookingFormProps {
    room: Room;
    hotelId: string;
    existingBookings: Array<{ startDate: Date; endDate: Date; }>;
}

export function BookingForm({ room, hotelId, existingBookings }: BookingFormProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const totalNights = dateRange?.from && dateRange?.to
        ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const totalPrice = room.roomPrice * totalNights;

    const handleBooking = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Выберите даты бронирования",
            });
            return;
        }

        try {
            setIsLoading(true);
            await createBooking(
                room.id,
                hotelId,
                dateRange.from,
                dateRange.to,
                totalPrice
            );

            toast({
                title: "Успешно!",
                description: "Бронирование создано",
            });

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

    // Similar date handling logic as before...

    return (
        <Card>
            <CardHeader>
                <CardTitle>Детали бронирования</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-muted-foreground">Номер:</div>
                    <div className="font-medium">{room.title}</div>

                    <div className="text-muted-foreground">Даты:</div>
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
                                    onSelect={setDateRange}
                                    locale={ru}
                                    numberOfMonths={2}
                                />
                            </DialogContent>
                        </Dialog>
                        {dateRange && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDateRange(undefined)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="text-muted-foreground">Количество ночей:</div>
                    <div className="font-medium">{totalNights}</div>

                    <div className="text-muted-foreground">Стоимость за ночь:</div>
                    <div className="font-medium">{room.roomPrice}₽</div>

                    <div className="text-muted-foreground">Итого:</div>
                    <div className="font-medium text-lg">{totalPrice}₽</div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={!dateRange?.from || !dateRange?.to || isLoading}
                >
                    {isLoading ? 'Оформление...' : 'Оформить бронирование'}
                </Button>
            </CardFooter>
        </Card>
    );
}
