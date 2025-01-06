'use client';

import { Room } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import AddRoomForm from "./AddRoomForm";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";

interface HotelRoomsManagerProps {
    hotelId: string;
    rooms: Room[];
}

export default function HotelRoomsManager({ hotelId, rooms }: HotelRoomsManagerProps) {
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (roomId: string) => {
        try {
            const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete room');
            }

            toast({
                title: "Успешно!",
                description: "Номер успешно удален",
            });

            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка!",
                description: "Не удалось удалить номер",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Номера</h2>
                    <p className="text-muted-foreground">
                        Управляйте номерами вашего отеля
                    </p>
                </div>
                <AddRoomForm hotelId={hotelId} />
            </div>

            <Separator />

            {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-secondary/50 rounded-lg">
                    <p className="text-xl font-semibold">У этого отеля пока нет номеров</p>
                    <p className="text-muted-foreground text-center max-w-[500px]">
                        Добавьте номера, чтобы гости могли их бронировать. Для каждого номера вы можете указать название,
                        описание, фотографии и цену.
                    </p>
                    <AddRoomForm hotelId={hotelId} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <Card key={room.id} className="group">
                            <div className="relative h-48">
                                <Image
                                    src={room.image}
                                    alt={room.title}
                                    fill
                                    className="object-cover rounded-t-lg transition-transform group-hover:scale-105"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{room.title}</span>
                                    <Badge variant="secondary">{room.roomPrice}₽/ночь</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-2">
                                    {room.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <AddRoomForm hotelId={hotelId} room={room} />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Удалить номер?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Это действие нельзя отменить. Номер будет удален, а все связанные с ним
                                                бронирования будут отменены.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(room.id)}
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