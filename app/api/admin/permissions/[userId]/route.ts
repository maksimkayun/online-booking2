import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        // Проверяем существование пользователя
        const userPermission = await prismadb.userPermission.findUnique({
            where: {
                userId: params.userId
            }
        });

        if (!userPermission) {
            // Если пользователя нет, создаем с ролью USER
            const newUserPermission = await prismadb.userPermission.create({
                data: {
                    userId: params.userId,
                    role: 'USER'
                }
            });
            return NextResponse.json(newUserPermission);
        }

        return NextResponse.json(userPermission);
    } catch (error) {
        console.error('[USER_PERMISSION_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}