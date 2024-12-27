import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function POST(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        // const { userId } = await auth();
        const body = await req.json();

        const { title, description, image, roomPrice } = body;

        // if (!userId) {
        //     return new NextResponse("Unauthorized", { status: 401 });
        // }

        // Проверяем, является ли пользователь владельцем отеля
        const hotel = await prismadb.hotel.findUnique({
            where: {
                id: params.hotelId,
                // userId,
            },
        });

        if (!hotel) {
            return new NextResponse("Not found", { status: 404 });
        }

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        if (!description) {
            return new NextResponse("Description is required", { status: 400 });
        }

        if (!image) {
            return new NextResponse("Image is required", { status: 400 });
        }

        if (!roomPrice) {
            return new NextResponse("Price is required", { status: 400 });
        }

        const room = await prismadb.room.create({
            data: {
                title,
                description,
                image,
                roomPrice,
                hotelId: params.hotelId,
            },
        });

        return NextResponse.json(room);
    } catch (error) {
        console.log('[ROOM_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}