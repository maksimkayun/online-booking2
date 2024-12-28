import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ClientLayout from "@/components/layout/ClientLayout";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={GeistSans.className}>
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
        </body>
        </html>
    );
}