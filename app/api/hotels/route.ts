import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { title, description, image } = body;

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const hotel = await prismadb.hotel.create({
            data: {
                title,
                description,
                image,
                userEmail: session.user.email
            }
        });

        return NextResponse.json(hotel);
    } catch (error) {
        console.error('[HOTELS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET() {
    try {
        const hotels = await prismadb.hotel.findMany({
            orderBy: {
                addedAt: 'desc'
            },
        });

        return NextResponse.json(hotels);
    } catch (error) {
        console.log('[HOTELS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}