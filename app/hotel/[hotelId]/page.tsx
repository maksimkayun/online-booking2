import AddHotelForm from "@/components/hotel/AddHotelForm";
import HotelDetails from "@/components/hotel/HotelDetails";
import HotelRoomsManager from "@/components/hotel/HotelRoomsManager";
import { getHotelById } from "@/actions/getHotelById";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface HotelPageProps {
    params: {
        hotelId: string;
    }
}

const HotelPage = async ({ params }: HotelPageProps) => {
    const { userId } = await auth();
    const hotel = await getHotelById(params.hotelId);

    if (!hotel) {
        redirect('/');
    }

    const isOwner = hotel.userId === userId;

    // Для владельца отеля показываем форму редактирования и управление номерами
    if (isOwner) {
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

    // Для остальных пользователей показываем детали отеля
    return <HotelDetails hotel={hotel} isOwner={isOwner} />;
}

export default HotelPage;