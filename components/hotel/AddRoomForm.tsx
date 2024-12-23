'use client';

import { Room } from "@prisma/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RoomImageUpload from "@/components/ui/RoomImageUpload";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AddRoomFormProps {
    hotelId: string;
    room?: Room;
}

const formSchema = z.object({
    title: z.string().min(3, {
        message: "Название должно содержать минимум 3 символа",
    }),
    description: z.string().min(10, {
        message: "Описание должно содержать минимум 10 символов",
    }),
    image: z.string().min(1, {
        message: "Изображение обязательно",
    }),
    roomPrice: z.coerce.number().min(1, {
        message: "Цена должна быть больше 0",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddRoomForm({ hotelId, room }: AddRoomFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: room?.title || "",
            description: room?.description || "",
            image: room?.image || "",
            roomPrice: room?.roomPrice || 0,
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            setIsLoading(true);

            const url = room
                ? `/api/hotels/${hotelId}/rooms/${room.id}`
                : `/api/hotels/${hotelId}/rooms`;

            const method = room ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    roomPrice: Number(values.roomPrice)
                })
            });

            if (!response.ok) {
                throw new Error(room ? 'Failed to update room' : 'Failed to create room');
            }

            toast({
                title: "Успешно!",
                description: room ? "Номер успешно обновлен" : "Номер успешно добавлен",
            });

            router.refresh();
            setIsOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({
                variant: "destructive",
                title: "Ошибка!",
                description: "Что-то пошло не так",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={room ? "outline" : "default"}>
                    <Plus className="mr-2 h-4 w-4" />
                    {room ? "Редактировать номер" : "Добавить номер"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {room ? "Редактировать номер" : "Добавить номер"}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Название номера</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Люкс" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Описание</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Опишите номер..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="roomPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Цена за ночь (₽)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="5000"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Изображение номера</FormLabel>
                                        <FormControl>
                                            <RoomImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button disabled={isLoading} type="submit" className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {room ? "Обновляем..." : "Добавляем..."}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {room ? "Обновить номер" : "Добавить номер"}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}