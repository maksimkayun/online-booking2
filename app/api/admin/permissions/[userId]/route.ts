import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const userPermission = await prismadb.userPermission.findUnique({
            where: {
                userId: params.userId
            }
        });

        if (!userPermission) {
            // Если запись не найдена, возвращаем роль по умолчанию
            return NextResponse.json({ role: 'USER' });
        }

        return NextResponse.json(userPermission);
    } catch (error) {
        console.error('[USER_PERMISSION_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}