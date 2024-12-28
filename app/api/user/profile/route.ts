import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hash, compare } from "bcryptjs";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, newEmail, currentPassword, newPassword } = body;

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Если пользователь хочет изменить пароль
        if (currentPassword && newPassword) {
            const isCorrectPassword = await compare(currentPassword, user.password || '');
            if (!isCorrectPassword) {
                return new NextResponse("Invalid current password", { status: 400 });
            }
            const hashedPassword = await hash(newPassword, 12);
            await prismadb.user.update({
                where: { email: session.user.email },
                data: { password: hashedPassword }
            });
        }

        // Обновляем основные данные
        const updatedUser = await prismadb.user.update({
            where: { email: session.user.email },
            data: {
                name: name || user.name,
                email: newEmail || user.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('[PROFILE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}