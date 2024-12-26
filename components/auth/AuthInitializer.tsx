'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function AuthInitializer() {
    const { userId, isLoaded } = useAuth();

    useEffect(() => {
        const initUser = async () => {
            if (!userId) return;

            try {
                await fetch('/api/auth/init', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Failed to initialize user:', error);
            }
        };

        if (isLoaded && userId) {
            initUser();
        }
    }, [userId, isLoaded]);

    // Возвращаем null, так как этот компонент не рендерит UI
    return null;
}

// Экспортируем компонент по умолчанию для работы с dynamic import
export default AuthInitializer;