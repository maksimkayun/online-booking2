"use client";

import { Hotel, Room } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { HotelInfo } from "./details/HotelInfo";
import { RoomsList } from "./rooms/RoomsList";
import { BookingForm } from "./booking/BookingForm";
import { useRoomBookings } from "@/hooks/use-room-bookings";
import { Loader2 } from "lucide-react";

interface HotelDetailsProps {
    hotel: Hotel & { rooms: Room[] };
    isOwner: boolean;
    isBookingPage?: boolean;
}

export default function HotelDetails({ hotel, isOwner, isBookingPage = false }: HotelDetailsProps) {
    const [selectedRoom, setSelectedRoom] = useState<string | undefined>(undefined);

    // Получаем существующие бронирования для выбранной комнаты
    const { bookings, isLoading } = useRoomBookings(hotel.id, selectedRoom);

    if (isOwner) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Управление отелем</h1>
                    <p className="text-muted-foreground mt-2">
                        Вы не можете забронировать номер в собственном отеле
                    </p>
                </div>
            </div>
        );
    }

    // Находим выбранную комнату
    const selectedRoomDetails = selectedRoom ? hotel.rooms.find(r => r.id === selectedRoom) : null;

    return (
        <div className="space-y-6">
            <HotelInfo hotel={hotel} isOwner={isOwner} />

            <Separator />

            <div className="max-w-7xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6">Доступные номера</h2>
                <RoomsList
                    rooms={hotel.rooms}
                    selectedRoom={selectedRoom}
                    onRoomSelect={setSelectedRoom}
                />

                {selectedRoom && selectedRoomDetails && (
                    <>
                        <Separator className="my-8" />
                        <div className="max-w-3xl mx-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <BookingForm
                                    room={selectedRoomDetails}
                                    hotelId={hotel.id}
                                    existingBookings={bookings}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}