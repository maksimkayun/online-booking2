import Container from '@/components/Container'
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { withClientAuthHOC } from "@/lib/withClientAuth";

function NewHotelPage() {
    return (
        <Container>
            <AddHotelForm />
        </Container>
    )
};

export default withClientAuthHOC(NewHotelPage, ['ADMIN', 'MANAGER']);