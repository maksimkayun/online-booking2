import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем, является ли текущий пользователь админом
        const currentUserPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        if (currentUserPermission?.role !== 'ADMIN') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const permissions = await prismadb.userPermission.findMany();
        return NextResponse.json(permissions);
    } catch (error) {
        console.error('[PERMISSIONS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { targetUserId, role, userName } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем, является ли текущий пользователь админом
        const currentUserPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        if (currentUserPermission?.role !== 'ADMIN') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedPermission = await prismadb.userPermission.upsert({
            where: { userId: targetUserId },
            update: {
                role,
                userName: userName || null
            },
            create: {
                userId: targetUserId,
                role,
                userName: userName || null
            }
        });

        return NextResponse.json(updatedPermission);
    } catch (error) {
        console.error('[PERMISSIONS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}