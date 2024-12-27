'use client';

import { useSession } from "next-auth/react";
import { useHotels } from "@/hooks/use-hotels";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import HotelList from "./HotelList";
import { Suspense } from "react";

export default function HotelsClientWrapper() {
    const { data: session } = useSession();
    const { hotels, isLoading, isError } = useHotels();
    const router = useRouter();
    const isAdminOrManager = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER';

    if (isError) {
        return (
            <div className="text-center py-10">
                <p>Произошла ошибка при загрузке отелей</p>
                <Button onClick={() => router.refresh()} className="mt-4">
                    Попробовать снова
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Отели</h1>
                {isAdminOrManager && (
                    <Button onClick={() => router.push('/hotel/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить отель
                    </Button>
                )}
            </div>

            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
                {!hotels || hotels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <h2 className="text-2xl font-semibold">Пока нет отелей</h2>
                        {!session ? (
                            <p className="text-muted-foreground text-center">
                                Войдите, чтобы просматривать отели
                            </p>
                        ) : (
                            <p className="text-muted-foreground text-center">
                                {isAdminOrManager
                                    ? "Нажмите «Добавить отель», чтобы создать первый отель"
                                    : "Скоро здесь появятся отели"}
                            </p>
                        )}
                    </div>
                ) : (
                    <HotelList hotels={hotels} />
                )}
            </Suspense>
        </div>
    );
}