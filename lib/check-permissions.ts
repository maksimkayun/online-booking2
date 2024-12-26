import { prismadb } from "./prismadb";
import { UserRole } from "@prisma/client";

export async function canManageHotels(userId: string): Promise<boolean> {
    try {
        const userPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        return userPermission?.role === 'ADMIN' || userPermission?.role === 'MANAGER';
    } catch {
        return false;
    }
}

export async function isAdmin(userId: string): Promise<boolean> {
    try {
        const userPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        return userPermission?.role === 'ADMIN';
    } catch {
        return false;
    }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
    try {
        const userPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        return userPermission?.role || null;
    } catch {
        return null;
    }
}