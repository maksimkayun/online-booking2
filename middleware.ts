import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { prismadb } from "@/lib/prismadb";
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/',
    '/hotel/:id',
    '/hotel/:id/book',
    '/my-bookings',
    '/api/bookings(.*)',
    '/api/hotels(.*)',
    '/api/mybookings(.*)',
    "/api/auth/uploadthing"
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    // Если пользователь авторизован
    if (auth.userId) {
        try {
            // Проверяем, существует ли уже запись о правах пользователя
            const existingPermission = await prismadb.userPermission.findUnique({
                where: {
                    userId: auth.userId
                }
            });

            // Если записи нет, создаем новую с ролью USER
            if (!existingPermission) {
                await prismadb.userPermission.create({
                    data: {
                        userId: auth.userId,
                        role: 'USER'
                    }
                });
                console.log(`Created USER role for ${auth.userId}`);
            }
        } catch (error) {
            console.error('Error handling user permissions:', error);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
        '/api/:path*'
    ],
}