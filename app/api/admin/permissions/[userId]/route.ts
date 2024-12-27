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

export async function POST(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const body = await req.json();
        const { userName } = body;

        const userPermission = await prismadb.userPermission.upsert({
            where: {
                userId: params.userId
            },
            update: {
                userName
            },
            create: {
                userId: params.userId,
                userName,
                role: 'USER'
            }
        });

        return NextResponse.json(userPermission);
    } catch (error) {
        console.error('[USER_PERMISSION_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}