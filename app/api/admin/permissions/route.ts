import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import {authOptions} from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const permissions = await prismadb.user.findMany();
        return NextResponse.json(permissions);
    } catch (error) {
        console.error('[PERMISSIONS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { targetUserId, role } = body;

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Проверяем, является ли текущий пользователь админом
        const currentUserPermission = await prismadb.user.findUnique({
            where: { email: session.user.email ?? "" }
        });

        if (currentUserPermission?.role !== 'ADMIN') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedPermission = await prismadb.user.update({ // Меняем upsert на update
            where: {
                email: targetUserId
            },
            data: {
                role,
            }
        });

        return NextResponse.json(updatedPermission);
    } catch (error) {
        console.error('[PERMISSIONS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}