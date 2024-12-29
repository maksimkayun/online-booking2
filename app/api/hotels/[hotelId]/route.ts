import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { title, description, image, rating } = body;

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем, является ли пользователь владельцем отеля или администратором
        const hotel = await prismadb.hotel.findUnique({
            where: {
                id: params.hotelId,
            }
        });

        if (!hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        // Проверяем права на редактирование
        const isOwner = hotel.userEmail === session.user.email;
        const isAdminOrManager = session.user.role === 'ADMIN' || session.user.role === 'MANAGER';

        if (!isOwner && !isAdminOrManager) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedHotel = await prismadb.hotel.update({
            where: {
                id: params.hotelId,
            },
            data: {
                title,
                description,
                image,
                rating: parseFloat(rating),
            },
        });

        // Отправляем событие через веб-сокет
        const res = req as any;
        if (res.socket?.server?.io) {
            res.socket.server.io.emit('hotel:updated', updatedHotel);
        }

        return NextResponse.json(updatedHotel);
    } catch (error) {
        console.log('[HOTEL_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
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

export async function DELETE(
    req: Request,
    { params }: { params: { hotelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем права на удаление
        const hotel = await prismadb.hotel.findUnique({
            where: {
                id: params.hotelId,
            }
        });

        if (!hotel) {
            return new NextResponse("Hotel not found", { status: 404 });
        }

        const isOwner = hotel.userEmail === session.user.email;
        const isAdmin = session.user.role === 'ADMIN';

        // Только владелец и администратор могут удалять отели
        if (!isOwner && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const deletedHotel = await prismadb.hotel.delete({
            where: {
                id: params.hotelId,
            },
        });

        // Отправляем событие через веб-сокет
        const res = req as any;
        if (res.socket?.server?.io) {
            res.socket.server.io.emit('hotel:deleted', params.hotelId);
        }

        return NextResponse.json(deletedHotel);
    } catch (error) {
        console.log('[HOTEL_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}