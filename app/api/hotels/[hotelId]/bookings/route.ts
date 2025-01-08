import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем права доступа
        const hotel = await prismadb.hotel.findUnique({
            where: { id: params.hotelId }
        });

        if (!hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        const isOwner = hotel.userEmail === session.user.email;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const bookings = await prismadb.booking.findMany({
            where: {
                hotelId: params.hotelId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                Room: true
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('[HOTEL_BOOKINGS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}