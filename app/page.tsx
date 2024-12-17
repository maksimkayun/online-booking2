import HotelList from "@/components/hotel/HotelList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getHotels } from "@/app/getHotels";

export default async function Home() {
    const { userId } = await auth();
    const hotels = await getHotels();

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Отели</h1>
            </div>
            {hotels.length === 0 ? (
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