"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { BookOpenCheck, ChevronsUpDown, Hotel, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserRole } from "@/hooks/use-permissions"

export function NavMenu() {
    const router = useRouter()
    const { userId, actor } = useAuth()

    // Формируем имя пользователя из actor если он доступен
    const userName = actor ? `${actor.firstName || ''} ${actor.lastName || ''}`.trim() : null

    const { role } = useUserRole(userId, userName)

    const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER'
    const isAdmin = role === 'ADMIN'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <ChevronsUpDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {isAdmin && (
                    <DropdownMenuItem
                        className="cursor-pointer flex gap-2 items-center"
                        onClick={() => router.push('/admin/permissions')}
                    >
                        <Settings size={15} />
                        <span>Админ-панель</span>
                    </DropdownMenuItem>
                )}

                {isAdminOrManager && (
                    <DropdownMenuItem
                        className="cursor-pointer flex gap-2 items-center"
                        onClick={() => router.push('/hotel/new')}
                    >
                        <Plus size={15} />
                        <span>Добавить отель</span>
                    </DropdownMenuItem>
                )}

                {isAdminOrManager && (
                    <DropdownMenuItem
                        className="cursor-pointer flex gap-2 items-center"
                        onClick={() => router.push('/my-hotels')}
                    >
                        <Hotel size={15} />
                        <span>Мои отели</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem
                    className="cursor-pointer flex gap-2 items-center"
                    onClick={() => router.push('/my-bookings')}
                >
                    <BookOpenCheck size={15} />
                    <span>Мои брони</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}