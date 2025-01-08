"use client";

import * as React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, ChevronsUpDown, Hotel, Plus, Settings, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/use-permissions";

export function NavMenu() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const { role } = useUserRole();

    const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';
    const isAdmin = role === 'ADMIN';

    const handleNavigate = (path: string) => {
        // Используем setTimeout чтобы дать время на закрытие диалога/дропдауна
        setTimeout(() => {
            router.push(path);
        }, 0);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <ChevronsUpDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                {isAdminOrManager && (
                    <>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleNavigate('/hotel/new')}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить отель
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleNavigate('/my-hotels')}
                        >
                            <Hotel className="mr-2 h-4 w-4" />
                            Мои отели
                        </DropdownMenuItem>
                        {pathname?.includes('/hotel/') && params?.hotelId && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleNavigate(`/hotel/${params.hotelId}/bookings`)}
                            >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Управление бронями
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                    </>
                )}

                {isAdmin && (
                    <>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleNavigate('/admin/permissions')}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Админ-панель
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleNavigate('/my-bookings')}
                >
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Мои брони
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}