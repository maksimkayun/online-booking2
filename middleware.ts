import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/api/auth/(.*)',
    '/api/register',
    '/api/hotels',
    '/api/socket/(.*)',
    '/_not-found'
];

const managerRoutes = [
    '/hotel/new',
    '/hotel/(.*)/(edit|rooms)',
    '/my-hotels'
];

const adminRoutes = [
    '/admin/(.*)',
];

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;


        // Обработка публичных маршрутов
        if (publicRoutes.some(route => pathname.match(new RegExp(`^${route.replace(/\*/g, '.*')}$`)))) {
            return NextResponse.next();
        }

        // Проверка сессии и прав для остальных маршрутов
        if (!token) {
            const signInUrl = new URL('/auth/signin', req.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }

        // Правила для менеджера и администратора
        if (managerRoutes.some(route => pathname.match(new RegExp(`^${route.replace(/\*/g, '.*')}$`)))) {
            if (!token.role || (token.role !== 'ADMIN' && token.role !== 'MANAGER')) {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        if (adminRoutes.some(route => pathname.match(new RegExp(`^${route.replace(/\*/g, '.*')}$`)))) {
            if (!token.role || token.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true
        },
    }
);

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
