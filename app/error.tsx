'use client';

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 bg-background text-foreground">
            <h2 className="text-xl font-semibold">Что-то пошло не так</h2>
            <p className="text-muted-foreground">Мы уже работаем над исправлением</p>
            <Button onClick={reset}>Попробовать снова</Button>
        </div>
    );
}