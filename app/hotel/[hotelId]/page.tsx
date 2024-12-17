import HotelDetails from "@/components/hotel/HotelDetails";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getHotelById } from "@/actions/getHotelById";
import HotelEditWrapper from "@/components/hotel/HotelEditWrapper";

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

    // Для владельца отеля показываем форму редактирования через клиентскую обертку
    if (isOwner) {
        return <HotelEditWrapper hotelId={params.hotelId} />;
    }

    // Для остальных пользователей показываем детали отеля
    return <HotelDetails hotel={hotel} isOwner={isOwner} />;
};

export default HotelPage;