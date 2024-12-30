'use client';

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/providers/SocketProvider";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/Container";

export default function ClientLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider
            // Включаем автоматическое обновление сессии
            refetchInterval={0}
            refetchOnWindowFocus={true}
            refetchWhenOffline={false}
        >
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
            </SocketProvider>
        </SessionProvider>
    );
}