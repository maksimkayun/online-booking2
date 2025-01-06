'use client';

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/providers/SocketProvider";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { NotFoundProvider, useNotFound } from '@/contexts/NotFoundContext';

function Layout({ children }: { children: React.ReactNode }) {
    const { isNotFound } = useNotFound();

    if (isNotFound) {
        return (
            <SessionProvider>
                <div className="min-h-screen flex flex-col bg-background">
                    <div className="sticky top-0 border border-b-primary/10 bg-secondary z-50">
                        <Container>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <div className="font-bold text-xl">Online booking</div>
                                </div>
                            </div>
                        </Container>
                    </div>
                    <main className="flex-grow relative">
                        <Container>
                            <div className="main-content">
                                {children}
                            </div>
                        </Container>
                    </main>
                    <Footer />
                </div>
            </SessionProvider>
        );
    }

    return (
        <SessionProvider>
            <SocketProvider>
                <div className="min-h-screen flex flex-col bg-background">
                    <NavBar />
                    <main className="flex-grow relative">
                        <Container>
                            <div className="main-content">
                                {children}
                            </div>
                        </Container>
                    </main>
                    <Footer />
                </div>
            </SocketProvider>
        </SessionProvider>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <NotFoundProvider>
            <Layout>{children}</Layout>
        </NotFoundProvider>
    );
}