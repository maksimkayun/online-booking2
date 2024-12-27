'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import HotelList from "./HotelList";
import { useHotels } from "@/hooks/use-hotels";
import { useUserRole } from "@/hooks/use-permissions";

interface HotelsClientWrapperProps {
    userId: string | null;
}

export default function HotelsClientWrapper({ userId }: HotelsClientWrapperProps) {
    const { hotels, isLoading } = useHotels();
    const { /*role,*/ isLoading: isRoleLoading } = useUserRole(userId);
    // const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

    if (isLoading || isRoleLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Отели</h1>
            </div>

            {!hotels || hotels.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <h2 className="text-2xl font-semibold text-center">Пока нет отелей</h2>
                    {!userId ? (
                        <p className="text-muted-foreground text-center">
                            Войдите, чтобы просматривать отели
                        </p>
                    ) : null}
                </div>
            ) : (
                <HotelList hotels={hotels} />
            )}
        </div>
    );
}