import AddHotelForm from "@/components/hotel/AddHotelForm";
import {getHotelById} from "@/actions/getHotelById";
import {auth} from "@clerk/nextjs/server";

interface HotelPageProps {
    params: {
        hotelId: string;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Hotel = async ({params}: HotelPageProps) => {
    const hotel = await getHotelById(params.hotelId);
    const {userId} = await auth();

    if(!userId) return <div>Not authenticated...</div>

    if(hotel && hotel.userId !== userId) return <div>Access denied...</div>

    return (
        <div>
            <AddHotelForm hotel={hotel}/>
        </div>
    );
}

export default Hotel;