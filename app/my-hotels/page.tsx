'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Hotel } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { withClientAuthHOC } from "@/lib/withClientAuth";
import HotelRating from "@/components/ui/HotelRating";

function MyHotelsPage() {
    const { data: session } = useSession();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const isAdmin = session?.user?.role === 'ADMIN';

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('/api/hotels');
                if (!response.ok) throw new Error('Failed to fetch hotels');
                const allHotels = await response.json();

                // Фильтруем отели только для текущего пользователя
                const userHotels = allHotels.filter((hotel: Hotel) =>
                    hotel.userEmail === session?.user?.email || isAdmin
                );
                setHotels(userHotels);
            } catch (error) {
                console.error('Error fetching hotels:', error);
                toast({
                    variant: "destructive",
                    title: "Ошибка",
                    description: "Не удалось загрузить отели",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotels();
    }, [session?.user?.email, isAdmin, toast]);

    const checkHotelBookings = async (hotelId: string) => {
        try {
            const response = await fetch(`/api/hotels/${hotelId}/check-bookings`);
            if (!response.ok) {
                throw new Error('Failed to check bookings');
            }
            const data = await response.json();
            return data.hasBookings;
        } catch (error) {
            console.error('Error checking bookings:', error);
            // В случае ошибки возвращаем true, чтобы предотвратить удаление
            return true;
        }
    };

    const handleDelete = async (hotelId: string) => {
        try {
            setDeletingId(hotelId);

            if (!isAdmin) {
                // Для менеджера проверяем наличие броней
                const hasBookings: boolean = await checkHotelBookings(hotelId);

                if (hasBookings) {
                    toast({
                        variant: "destructive",
                        title: "Ошибка",
                        description: "Нельзя удалить отель с активными бронированиями",
                    });
                    return;
                }
            }

            const deleteResponse = await fetch(`/api/hotels/${hotelId}`, {
                method: 'DELETE',
            });

            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                throw new Error(errorText || 'Failed to delete hotel');
            }

            // Обновляем состояние только после успешного удаления
            setHotels(prevHotels => prevHotels.filter(hotel => hotel.id !== hotelId));

            toast({
                title: "Успешно!",
                description: "Отель удален",
            });

            // Принудительно обновляем страницу после успешного удаления
            router.refresh();
        } catch (error) {
            console.error('Error deleting hotel:', error);
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Не удалось удалить отель",
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Мои отели</h1>
                    <p className="text-muted-foreground">
                        Управляйте своими отелями
                    </p>
                </div>
                <Button onClick={() => router.push('/hotel/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить отель
                </Button>
            </div>

            {hotels.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <h2 className="text-2xl font-semibold">У вас пока нет отелей</h2>
                    <p className="text-muted-foreground text-center">
                        Нажмите «Добавить отель», чтобы создать свой первый отель
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <Card key={hotel.id} className="flex flex-col">
                            <div className="relative aspect-video">
                                <Image
                                    src={hotel.image}
                                    alt={hotel.title}
                                    fill
                                    className="object-cover rounded-t-lg"
                                />
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="line-clamp-1">
                                        {hotel.title}
                                    </CardTitle>
                                    <HotelRating rating={hotel.rating} />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground line-clamp-2">
                                    {hotel.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button
                                    onClick={() => router.push(`/hotel/${hotel.id}`)}
                                    className="flex-1"
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Редактировать
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {deletingId === hotel.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Удалить отель?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Это действие нельзя отменить. Отель будет удален,
                                                а все связанные с ним бронирования будут отменены.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                                Отмена
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(hotel.id);
                                                }}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default withClientAuthHOC(MyHotelsPage, ['ADMIN', 'MANAGER']);