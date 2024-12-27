import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import React from "react";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
};

export function usePermissions() {
    const { userId, actor } = useAuth();
    const userName = actor?.sub || null;

    const { data, error, isLoading, mutate } = useSWR(
        userId ? '/api/admin/permissions' : null,
        fetcher,
        {
            refreshInterval: 5000,
            revalidateOnFocus: true
        }
    );

    return {
        permissions: data,
        isLoading,
        isError: error,
        mutate,
        userName
    };
}

export function useUserRole(userId?: string | null, userName?: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        userId ? `/api/admin/permissions/${userId}` : null,
        fetcher,
        {
            fallbackData: { role: 'USER', userName: userName || null },
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    // При изменении userName обновляем данные в БД
    React.useEffect(() => {
        if (userId && userName && data?.userName !== userName) {
            fetch(`/api/admin/permissions/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName }),
            }).then(() => mutate());
        }
    }, [userId, userName, data?.userName, mutate]);

    return {
        role: data?.role || 'USER',
        isLoading,
        isError: error
    };
}