// components/hotel/AddHotelForm.tsx
'use client';

import { Hotel } from "@prisma/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AddHotelFormProps {
    hotel?: Hotel | null;
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
});

const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: hotel?.title || "",
            description: hotel?.description || "",
            image: hotel?.image || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);
            if (hotel) {
                await fetch(`/api/hotels/${hotel.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(values)
                });
                toast({
                    title: "Успешно!",
                    description: "Отель успешно обновлен",
                });
            } else {
                await fetch('/api/hotels', {
                    method: 'POST',
                    body: JSON.stringify(values)
                });
                toast({
                    title: "Успешно!",
                    description: "Отель успешно создан",
                });
            }
            router.refresh();
            router.push('/');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
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
        <div className="max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {hotel ? 'Редактировать отель' : 'Добавить новый отель'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Заполните информацию об отеле
                            </p>
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название отеля</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Grand Hotel" {...field} />
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
                                            placeholder="Опишите ваш отель..."
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
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Изображение отеля</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value}
                                            onChange={(value) => field.onChange(value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button disabled={isLoading} type="submit" className="w-full">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {hotel ? "Обновляем..." : "Создаем..."}
                            </>
                        ) : (
                            <>
                                <Pencil className="mr-2 h-4 w-4" />
                                {hotel ? "Обновить отель" : "Создать отель"}
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddHotelForm;