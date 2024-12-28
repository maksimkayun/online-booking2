"use client";

import {GeistSans} from "geist/font/sans";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import Container from "@/components/Container";
import {Toaster} from "@/components/ui/toaster";
import {SessionProvider} from "next-auth/react";
import {SocketProvider} from "@/providers/SocketProvider";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <SocketProvider>
                <html lang="en" suppressHydrationWarning>
                <body className={GeistSans.className}>
                <div className="min-h-screen flex flex-col bg-secondary">
                    <NavBar/>
                    <main className="flex-grow relative">
                        <Container>
                            <div className="main-content">
                                {children}
                            </div>
                        </Container>
                    </main>
                </div>
                <Toaster/>
                </body>
                </html>
            </SocketProvider>
        </SessionProvider>
    );
}