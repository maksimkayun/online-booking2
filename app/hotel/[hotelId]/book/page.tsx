import { getHotelById } from "@/actions/getHotelById";
import HotelDetails from "@/components/hotel/HotelDetails";
import { redirect } from "next/navigation";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

interface BookingPageProps {
    params: {
        hotelId: string;
    }
}

export default async function BookingPage({ params }: BookingPageProps) {

    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/sign-in');
    }

    const hotel = await getHotelById(params.hotelId);

    if (!hotel) {
        redirect('/');
    }

    const isOwner = hotel.userEmail === session?.user?.email;

    // Владелец не может бронировать свой собственный отель
    if (isOwner) {
        redirect('/');
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Бронирование</h1>
                <p className="text-muted-foreground mt-2">
                    Выберите даты и номер для бронирования
                </p>
            </div>

            <HotelDetails
                hotel={hotel}
                isOwner={isOwner}
                isBookingPage={true}
            />
        </div>
    );
}