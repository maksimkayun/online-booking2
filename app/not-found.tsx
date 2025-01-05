'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from 'react';
import { useNotFound } from '@/contexts/NotFoundContext';

export default function NotFound() {
    const { setIsNotFound } = useNotFound();

    useEffect(() => {
        setIsNotFound(true);
        return () => setIsNotFound(false);
    }, [setIsNotFound]);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 bg-background text-foreground">
            <h2 className="text-xl font-semibold">Страница не найдена</h2>
            <p className="text-muted-foreground">Запрашиваемая страница не существует</p>
            <Button asChild>
                <Link href="/">На главную</Link>
            </Button>
        </div>
    );
}