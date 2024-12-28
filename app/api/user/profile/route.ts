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

        const updates: any = {};

        if (name) {
            updates.name = name;
        }

        if (newEmail && newEmail !== user.email) {
            const existingUser = await prismadb.user.findUnique({
                where: { email: newEmail }
            });

            if (existingUser) {
                return new NextResponse("Email already in use", { status: 400 });
            }

            updates.email = newEmail;
        }

        // Если пользователь хочет изменить пароль
        if (currentPassword && newPassword) {
            if (!user.password) {
                return new NextResponse("Current password is required", { status: 400 });
            }

            const isCorrectPassword = await compare(currentPassword, user.password);
            if (!isCorrectPassword) {
                return new NextResponse("Invalid current password", { status: 400 });
            }

            updates.password = await hash(newPassword, 12);
        }

        // Обновляем пользователя
        const updatedUser = await prismadb.user.update({
            where: { email: session.user.email },
            data: updates,
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('[PROFILE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('[PROFILE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}