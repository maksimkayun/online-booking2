'use client';

import { Hotel, Room } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import HotelRating from "@/components/ui/HotelRating";

interface HotelInfoProps {
    hotel: Hotel & { rooms: Room[] };
    isOwner: boolean;
}

export function HotelInfo({ hotel, isOwner }: HotelInfoProps) {
    const router = useRouter();

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
                        <HotelRating rating={hotel.rating} className="mt-1" />
                        {!isOwner && (
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
                </div>
            </div>
        </div>
    );
}