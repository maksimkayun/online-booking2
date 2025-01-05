import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        const bookingsCount = await prismadb.booking.count({
            where: {
                hotelId: params.hotelId,
                endDate: {
                    gte: new Date()
                }
            }
        });

        return NextResponse.json({ hasBookings: bookingsCount > 0 });
    } catch (error) {
        console.error('[CHECK_BOOKINGS]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}