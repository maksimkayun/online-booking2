import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
};

export function usePermissions() {
    const { userId } = useAuth();

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
        mutate
    };
}

export function useUserRole(userId?: string | null) {
    const { data, error, isLoading } = useSWR(
        userId ? `/api/admin/permissions/${userId}` : null,
        fetcher,
        {
            fallbackData: { role: 'USER' }, // Значение по умолчанию
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        role: data?.role || 'USER',
        isLoading,
        isError: error
    };
}