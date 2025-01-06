import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import {authOptions} from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { title, description, image, rating } = body;

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const hotel = await prismadb.hotel.create({
            data: {
                title,
                description,
                image,
                rating: parseFloat(rating),
                userEmail: session.user.email
            }
        });

        // Отправляем событие через веб-сокет
        const res = req as any;
        if (res.socket && res.socket.server && res.socket.server.io) {
            res.socket.server.io.emit('hotel:created', hotel);
        }

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
                rating: 'desc'
            },
        });

        // Преобразуем Decimal в число перед отправкой клиенту
        const safeHotels = hotels.map(hotel => ({
            ...hotel,
            rating: hotel.rating.toNumber()
        }));

        return NextResponse.json(safeHotels);
    } catch (error) {
        console.log('[HOTELS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}