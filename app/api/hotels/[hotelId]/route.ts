// app/api/hotels/[hotelId]/route.ts
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import {auth} from "@clerk/nextjs/server";

export async function PATCH(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { title, description, image } = body;

        if (!userId) {
            return new NextResponse("Не авторизован", { status: 401 });
        }

        if (!title) {
            return new NextResponse("Название обязательно", { status: 400 });
        }

        if (!description) {
            return new NextResponse("Описание обязательно", { status: 400 });
        }

        if (!image) {
            return new NextResponse("Изображение обязательно", { status: 400 });
        }

        const hotel = await prismadb.hotel.update({
            where: {
                id: params.hotelId,
                userId,
            },
            data: {
                title,
                description,
                image,
            },
        });

        return NextResponse.json(hotel);
    } catch (error) {
        console.log('[HOTEL_PATCH]', error);
        return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        const hotel = await prismadb.hotel.findUnique({
            where: {
                id: params.hotelId,
            },
            include: {
                rooms: true
            }
        });

        if (!hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        return NextResponse.json(hotel);
    } catch (error) {
        console.log('[HOTEL_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}