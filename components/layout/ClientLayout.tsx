'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { SocketProvider } from "@/providers/SocketProvider";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/Container";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Компонент для отслеживания изменений сессии
function SessionManager() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            // Регулярно проверяем актуальность данных пользователя
            const checkUserData = async () => {
                try {
                    const response = await fetch('/api/user/profile');
                    if (response.ok) {
                        const userData = await response.json();
                        // Если данные в сессии отличаются от актуальных
                        if (userData.email !== session?.user?.email ||
                            userData.name !== session?.user?.name) {
                            // Обновляем страницу для получения свежих данных
                            router.refresh();
                        }
                    }
                } catch (error) {
                    console.error('Error checking user data:', error);
                }
            };

            // Проверяем данные каждые 5 секунд
            const interval = setInterval(checkUserData, 5000);
            return () => clearInterval(interval);
        }
    }, [session, status, router]);

    return null;
}

export default function ClientLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider refetchInterval={5} refetchOnWindowFocus={true}>
            <SocketProvider>
                <div className="min-h-screen flex flex-col bg-secondary">
                    <NavBar />
                    <main className="flex-grow relative">
                        <Container>
                            <div className="main-content">
                                {children}
                            </div>
                        </Container>
                    </main>
                </div>
                <SessionManager />
            </SocketProvider>
        </SessionProvider>
    );
}