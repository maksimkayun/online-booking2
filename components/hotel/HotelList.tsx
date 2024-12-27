'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Hotel } from "@prisma/client";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useUserRole } from "@/hooks/use-permissions";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface HotelListProps {
    hotels: Hotel[];
}

const HotelList = ({ hotels }: HotelListProps) => {
    const router = useRouter();
    const { userId } = useAuth();
    const { role } = useUserRole(userId);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { toast } = useToast();

    const isAdmin = role === 'ADMIN';
    const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

    const handleNavigate = (path: string) => {
        // Используем setTimeout чтобы дать время на закрытие диалога/дропдауна
        setTimeout(() => {
            router.push(path);
        }, 0);
    };

    const handleDelete = async (hotelId: string) => {
        try {
            setDeletingId(hotelId);
            const response = await fetch(`/api/hotels/${hotelId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete hotel');
            }

            toast({
                title: "Успешно!",
                description: "Отель удален",
            });

            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка!",
                description: "Не удалось удалить отель",
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (!hotels?.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-semibold">Отелей пока нет</h2>
                <p className="text-muted-foreground">Станьте первым, кто добавит отель!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
                const isOwner = hotel.userId === userId;

                return (
                    <Card key={hotel.id} className="overflow-hidden">
                        <div className="relative w-full h-[200px]">
                            <Image
                                src={hotel.image}
                                alt={hotel.title}
                                className="object-cover"
                                fill
                            />
                        </div>
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{hotel.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {hotel.description}
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            {(isOwner && isAdminOrManager) ? (
                                <Button
                                    onClick={() => handleNavigate(`/hotel/${hotel.id}`)}
                                    className="w-full"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Редактировать
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => handleNavigate(`/hotel/${hotel.id}`)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Подробнее
                                    </Button>
                                    <Button
                                        onClick={() => handleNavigate(`/hotel/${hotel.id}/book`)}
                                        className="flex-1"
                                    >
                                        Забронировать
                                    </Button>
                                </>
                            )}
                            {isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            {deletingId === hotel.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
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
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(hotel.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Удалить
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
};

export default HotelList;