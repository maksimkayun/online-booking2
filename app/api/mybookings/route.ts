import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const bookings = await prismadb.booking.findMany({
            where: {
                userId: userId,
            },
            include: {
                Hotel: true,
                Room: true,
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.log('[BOOKINGS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}