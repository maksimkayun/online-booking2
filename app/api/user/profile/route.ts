import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { hash, compare } from "bcryptjs";
import {authOptions} from "@/lib/auth";

interface UpdateData {
    name?: string;
    email?: string;
    password?: string;
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { name, newEmail, currentPassword, newPassword } = body;

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const updates: UpdateData = {};

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

        // Создаем объект ответа с обновленными данными и метаданными
        const responseData = {
            user: updatedUser,
            event: {
                type: 'user:updated',
                timestamp: new Date().toISOString()
            }
        };

        return NextResponse.json(responseData);

    } catch (error) {
        if (error instanceof Error) {
            console.error('[PROFILE_PATCH]', error.message);
            return new NextResponse(error.message, { status: 500 });
        }
        return new NextResponse("Internal error", { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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