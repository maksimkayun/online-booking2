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
    const {userId} = auth()
    return (
        <>
        <div>
            <AddHotelForm />
        </div>
        </>
    );
}

export default Hotel;