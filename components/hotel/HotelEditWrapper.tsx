'use client';

import { useHotel } from "@/hooks/use-hotel";
import AddHotelForm from "./AddHotelForm";
import HotelRoomsManager from "./HotelRoomsManager";
import { Separator } from "@/components/ui/separator";

interface HotelEditWrapperProps {
    hotelId: string;
}

export default function HotelEditWrapper({ hotelId }: HotelEditWrapperProps) {
    const { hotel, isLoading, isError } = useHotel(hotelId);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (isError || !hotel) {
        return <div>Произошла ошибка при загрузке данных отеля</div>;
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Управление отелем</h1>
                <p className="text-muted-foreground">
                    Управляйте информацией об отеле и номерах
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Основная информация</h2>
                    <p className="text-muted-foreground">
                        Измените основную информацию о вашем отеле
                    </p>
                </div>
                <AddHotelForm hotel={hotel} />
            </div>

            <Separator />

            <HotelRoomsManager hotelId={hotel.id} rooms={hotel.rooms} />
        </div>
    );
}