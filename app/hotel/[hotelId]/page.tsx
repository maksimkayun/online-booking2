// app/hotel/[hotelId]/page.tsx
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { getHotelById } from "@/actions/getHotelById";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface HotelPageProps {
    params: {
        hotelId: string;
    }
}

const HotelPage = async ({ params }: HotelPageProps) => {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const hotel = await getHotelById(params.hotelId);

    if (!hotel) {
        redirect('/');
    }

    if (hotel.userId !== userId) {
        redirect('/');
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Редактирование отеля</h1>
                <p className="text-muted-foreground">
                    Измените информацию о вашем отеле
                </p>
            </div>
            <AddHotelForm hotel={hotel} />
        </div>
    );
}

export default HotelPage;