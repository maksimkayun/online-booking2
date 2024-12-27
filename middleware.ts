import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/check-permissions';
import { NextRequest } from 'next/server';

const publicRoutes = [
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/',
    '/hotel/:path*/book',    // Изменено для поддержки динамических путей
    '/my-bookings',
    '/api/bookings(.*)',
    '/api/hotels(.*)',
    '/api/mybookings(.*)',
    '/api/auth/uploadthing'
];

// Маршруты только для админов и менеджеров
const managerRoutes = [
    '/hotel/new',           // Создание нового отеля
    '/hotel/:path*'         // Изменено для поддержки динамических путей
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const isPublicRoute = createRouteMatcher(publicRoutes);
    const isManagerRoute = createRouteMatcher(managerRoutes);

    if (isManagerRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const role = await getUserRole(userId);
        if (role !== 'ADMIN' && role !== 'MANAGER') {
            return Response.redirect(new URL('/', req.url));
        }
    }

    if (!isPublicRoute(req) && !isManagerRoute(req)) {
        await auth.protect();
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
        '/api/:path*'
    ],
};