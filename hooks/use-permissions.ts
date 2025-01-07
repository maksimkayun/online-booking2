import useSWR from "swr";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
};

export function usePermissions() {
    const { data: session } = useSession();

    const { data, error, isLoading, mutate } = useSWR(
        session?.user ? '/api/admin/permissions' : null,
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
        userName: session?.user?.name || null
    };
}

export function useUserRole() {
    const { data: session } = useSession();
    return {
        role: session?.user?.role as UserRole || 'USER',
        isAdmin: session?.user?.role === 'ADMIN',
        isManager: session?.user?.role === 'MANAGER',
        isAdminOrManager: ['ADMIN', 'MANAGER'].includes(session?.user?.role || ''),
        email: session?.user?.email
    };
}