import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/api/auth/(.*)',
    '/api/register',
    '/api/hotels',
    '/api/socket/(.*)', // Добавляем этот маршрут
];

const managerRoutes = [
    '/hotel/new',
    '/hotel/(.*)/(edit|rooms)',
];

const adminRoutes = [
    '/admin/(.*)',
];

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        // Публичные маршруты доступны всем
        if (publicRoutes.some(route =>
            pathname.match(new RegExp(`^${route.replace(/\*/g, '.*')}$`))
        )) {
            return NextResponse.next();
        }

        // Для остальных маршрутов требуется авторизация
        if (!token) {
            const signInUrl = new URL('/auth/signin', req.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }

        // Проверка прав для маршрутов менеджера
        if (managerRoutes.some(route =>
            pathname.match(new RegExp(`^${route.replace(/\*/g, '.*')}$`))
        )) {
            if (!token.role || (token.role !== 'ADMIN' && token.role !== 'MANAGER')) {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        // Проверка прав для маршрутов администратора
        if (adminRoutes.some(route =>
            pathname.match(new RegExp(`^${route.replace(/\*/g, '.*')}$`))
        )) {
            if (!token.role || token.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true // Отключаем стандартную проверку авторизации
        },
    }
);

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};