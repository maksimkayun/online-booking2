import { prismadb } from "./prismadb";
import { UserRole } from "@prisma/client";

export async function canManageHotels(userId: string): Promise<boolean> {
    try {
        const userPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        return userPermission?.role === 'ADMIN' || userPermission?.role === 'MANAGER';
    } catch (error) {
        console.error('Error in canManageHotels:', error);
        return false;
    }
}

export async function isAdmin(userId: string): Promise<boolean> {
    try {
        const userPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        return userPermission?.role === 'ADMIN';
    } catch (error) {
        console.error('Error in isAdmin:', error);
        return false;
    }
}

export async function getUserRole(userId: string): Promise<UserRole> {
    try {
        console.log('Getting role for userId:', userId);

        const userPermission = await prismadb.userPermission.findUnique({
            where: { userId }
        });

        console.log('Found userPermission:', userPermission);

        // Если записи нет, создаем новую с ролью USER
        if (!userPermission) {
            console.log('Creating new user permission with USER role');
            const newUserPermission = await prismadb.userPermission.create({
                data: {
                    userId,
                    role: 'USER'
                }
            });
            return newUserPermission.role;
        }

        return userPermission.role;
    } catch (error) {
        console.error('Error in getUserRole:', error);
        // Возвращаем USER вместо null при ошибке
        return 'USER';
    }
}