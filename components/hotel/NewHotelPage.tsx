'use client';

import Container from '@/components/Container';
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { withClientAuthHOC } from "@/lib/withClientAuth";

function NewHotelPageClient() {
    return (
        <Container>
            <AddHotelForm />
        </Container>
    );
}

export default withClientAuthHOC(NewHotelPageClient, ['ADMIN', 'MANAGER']);