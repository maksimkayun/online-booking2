'use client';

import { useSession } from "next-auth/react";
import { useHotels } from "@/hooks/use-hotels";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import HotelList from "./HotelList";
import { useEffect, useState } from "react";
import { useSocket } from "@/lib/socket";
import { Hotel } from "@prisma/client";
import HotelsFilter from "@/components/ui/HotelsFilter";

const ITEMS_PER_PAGE = 6;

export default function HotelsClientWrapper() {
    const { data: session } = useSession();
    const { hotels, isLoading, isError, mutate } = useHotels();
    const router = useRouter();
    const { socket } = useSocket();
    const isAdminOrManager = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER';

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState("all");
    const [showBestFirst, setShowBestFirst] = useState(true);

    useEffect(() => {
        if (!socket) return;

        socket.on('hotel:created', (newHotel: Hotel) => {
            mutate([...(hotels || []), newHotel]);
        });

        socket.on('hotel:updated', (updatedHotel: Hotel) => {
            mutate(
                hotels?.map((hotel) =>
                    hotel.id === updatedHotel.id ? updatedHotel : hotel
                )
            );
        });

        socket.on('hotel:deleted', (hotelId: string) => {
            mutate(hotels?.filter((hotel) => hotel.id !== hotelId));
        });

        return () => {
            socket.off('hotel:created');
            socket.off('hotel:updated');
            socket.off('hotel:deleted');
        };
    }, [socket, hotels, mutate]);

    // Преобразуем hotel.rating в число для безопасного сравнения
    const getRatingValue = (hotel: Hotel) => {
        return typeof hotel.rating === 'number'
            ? hotel.rating
            : parseFloat(hotel.rating.toString());
    };

    // Фильтрация и сортировка отелей
    const processedHotels = hotels.reduce((acc, hotel) => {
        // Фильтрация по рейтингу
        if (selectedRating !== "all") {
            const ratingValue = parseFloat(selectedRating);
            const hotelRating = getRatingValue(hotel);

            if (Math.abs(hotelRating - ratingValue) > 0.01) {
                return acc;
            }
        }

        acc.push(hotel);
        return acc;
    }, [] as Hotel[]);

    // Сортировка
    const sortedHotels = [...processedHotels].sort((a, b) => {
        if (showBestFirst) {
            // Сортировка по рейтингу (лучшие первыми)
            return getRatingValue(b) - getRatingValue(a);
        } else {
            // Сортировка по дате добавления (новые первыми)
            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        }
    });

    // Пагинация
    const totalPages = Math.ceil(sortedHotels.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedHotels = sortedHotels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Сброс текущей страницы при изменении фильтров
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedRating, showBestFirst]);

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

            <HotelsFilter
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
                showBestFirst={showBestFirst}
                onSortToggle={() => setShowBestFirst(!showBestFirst)}
                onReset={() => setSelectedRating("all")}
            />

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
                <>
                    {processedHotels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                            <h2 className="text-2xl font-semibold">Нет отелей с выбранным рейтингом</h2>
                            <p className="text-muted-foreground text-center">
                                Попробуйте изменить фильтр
                            </p>
                        </div>
                    ) : (
                        <>
                            <HotelList hotels={paginatedHotels} />

                            {/* Пагинация */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Назад
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                onClick={() => setCurrentPage(page)}
                                                className="w-10"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}