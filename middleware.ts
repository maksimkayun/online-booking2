import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
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

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
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