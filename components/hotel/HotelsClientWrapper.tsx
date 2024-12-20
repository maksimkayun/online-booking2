'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import HotelList from "./HotelList";
import { useHotels } from "@/hooks/use-hotels";

interface HotelsClientWrapperProps {
    userId: string | null;
}

export default function HotelsClientWrapper({ userId }: HotelsClientWrapperProps) {
    const { hotels, isLoading } = useHotels();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Отели</h1>
            </div>
            {!hotels || hotels.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <h2 className="text-2xl font-semibold text-center">Пока нет отелей</h2>
                    {userId ? (
                        <>
                            <Link href="/hotel/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить отель
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-center">
                            Войдите, чтобы добавить отель
                        </p>
                    )}
                </div>
            ) : (
                <HotelList hotels={hotels} />
            )}
        </div>
    );
}