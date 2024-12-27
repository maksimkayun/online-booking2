import { prismadb } from "@/lib/prismadb";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, password } = body;

        if (!email || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const exist = await prismadb.user.findUnique({
            where: {
                email
            }
        });

        if (exist) {
            return new NextResponse("Email already exists", { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        const user = await prismadb.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log("[REGISTER_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}