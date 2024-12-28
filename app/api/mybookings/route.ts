import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prismadb.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        const bookings = await prismadb.booking.findMany({
            where: {
                userId: user?.id
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