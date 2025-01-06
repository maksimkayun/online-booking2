'use client';

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/providers/SocketProvider";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";

// Простой лейаут без лишних оберток
export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SocketProvider>
                <div className="min-h-screen flex flex-col bg-background">
                    <NavBar />
                    <main className="flex-grow relative">
                        <Container>
                            {children}
                        </Container>
                    </main>
                    <Footer />
                </div>
            </SocketProvider>
        </SessionProvider>
    );
}