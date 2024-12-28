'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

export function withClientAuthHOC<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles: UserRole[]
) {
    return function WithClientAuthHOC(props: P) {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            // Если аутентификация завершена и пользователь не авторизован
            if (status === 'unauthenticated') {
                router.push('/auth/signin');
                return;
            }

            // Если аутентификация завершена и у пользователя нет необходимой роли
            if (status === 'authenticated' &&
                session?.user?.role &&
                !allowedRoles.includes(session.user.role)) {
                router.push('/');
            }
        }, [status, session, router]);

        // Показываем загрузку пока проверяем сессию
        if (status === 'loading') {
            return <div>Loading...</div>;
        }

        // Если у пользователя есть необходимая роль, рендерим компонент
        if (status === 'authenticated' &&
            session?.user?.role &&
            allowedRoles.includes(session.user.role)) {
            return <WrappedComponent {...props} />;
        }

        // В остальных случаях ничего не рендерим
        return null;
    };
}