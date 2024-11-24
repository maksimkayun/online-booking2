// components/hotel/HotelList.tsx
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Hotel } from "@prisma/client";
import { useAuth } from "@clerk/nextjs";
import { Pencil } from "lucide-react";

interface HotelListProps {
    hotels: Hotel[];
}

const HotelList = ({ hotels }: HotelListProps) => {
    const router = useRouter();
    const { userId } = useAuth();

    if (!hotels?.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-semibold">Отелей пока нет</h2>
                <p className="text-muted-foreground">Станьте первым, кто добавит отель!</p>
            </div>
        );
    }

    const handleBooking = (hotelId: string) => {
        if (!userId) {
            router.push('/sign-in');
            return;
        }
        router.push(`/hotel/${hotelId}/book`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
                const isOwner = hotel.userId === userId;

                return (
                    <Card key={hotel.id} className="overflow-hidden">
                        <div className="relative w-full h-[200px]">
                            <Image
                                src={hotel.image}
                                alt={hotel.title}
                                className="object-cover"
                                fill
                            />
                        </div>
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{hotel.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {hotel.description}
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            {isOwner ? (
                                // Владельцу показываем кнопку редактирования
                                <Button
                                    onClick={() => router.push(`/hotel/${hotel.id}`)}
                                    className="w-full"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Редактировать
                                </Button>
                            ) : (
                                // Остальным пользователям показываем кнопки подробнее и забронировать
                                <>
                                    <Button
                                        onClick={() => router.push(`/hotel/${hotel.id}`)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Подробнее
                                    </Button>
                                    <Button
                                        onClick={() => handleBooking(hotel.id)}
                                        className="flex-1"
                                    >
                                        Забронировать
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
};

export default HotelList;