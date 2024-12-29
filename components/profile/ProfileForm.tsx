'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { mutate } from "swr";

const profileSchema = z.object({
    firstName: z.string().min(2, "Минимум 2 символа"),
    lastName: z.string().min(2, "Минимум 2 символа"),
    middleName: z.string().optional(),
    newEmail: z.string().email("Некорректный email"),
    currentPassword: z.string().min(6).optional().or(z.literal("")),
    newPassword: z.string().min(6).optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal(""))
}).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Необходимо ввести текущий пароль",
    path: ["currentPassword"],
}).refine((data) => {
    if (data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

export default function ProfileForm() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            middleName: "",
            newEmail: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        try {
            setIsLoading(true);

            // Собираем полное имя
            const fullName = [values.lastName, values.firstName, values.middleName]
                .filter(Boolean)
                .join(" ");

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    name: fullName, // Отправляем полное имя одной строкой
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const updatedUser = await response.json();

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: updatedUser.name,
                    email: updatedUser.email,
                }
            });

            await Promise.all([
                mutate('/api/user/profile'),
                mutate('/api/mybookings'),
                mutate('/api/hotels'),
                mutate((key) => typeof key === 'string' && key.startsWith('/api/'), undefined, { revalidate: true })
            ]);

            toast({
                title: "Успешно!",
                description: "Профиль обновлен",
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось обновить профиль",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (session?.user) {
            // Разбиваем полное имя на части
            const nameParts = (session.user.name || "").split(" ");
            const [lastName = "", firstName = "", ...middleNameParts] = nameParts;
            const middleName = middleNameParts.join(" ");

            form.reset({
                firstName,
                lastName,
                middleName,
                newEmail: session.user.email || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [form, session]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Фамилия</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Имя</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="middleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Отчество</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="newEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Текущий пароль</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Новый пароль</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Подтверждение пароля</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить изменения
                </Button>
            </form>
        </Form>
    );
}