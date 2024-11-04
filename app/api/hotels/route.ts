// app/api/hotels/route.ts
import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import {auth} from "@clerk/nextjs/server";

export async function POST(req: Request) {
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

        const hotel = await prismadb.hotel.create({
            data: {
                title,
                description,
                image,
                userId
            }
        });

        return NextResponse.json(hotel);
    } catch (error) {
        console.log('[HOTELS_POST]', error);
        return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
    }
}