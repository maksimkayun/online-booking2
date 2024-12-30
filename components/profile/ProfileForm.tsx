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
import { useSocket } from "@/lib/socket";
import {UserUpdateData} from "@/types/socket";

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
    const { socket } = useSocket();

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

    // Обработчик обновления данных пользователя через сокет
    useEffect(() => {
        if (!socket || !session?.user?.email) return;

        const handleUserUpdate = async (userData: UserUpdateData) => {
            if (userData.email === session.user?.email) {
                // Обновляем сессию с новыми данными
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        email: userData.email,
                        name: userData.name
                    }
                });

                // Обновляем форму с новыми данными
                const nameParts = (userData.name || "").split(" ");
                const [lastName = "", firstName = "", ...middleNameParts] = nameParts;
                const middleName = middleNameParts.join(" ");

                form.reset({
                    firstName,
                    lastName,
                    middleName,
                    newEmail: userData.email || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        };

        // Подписываемся на обновления пользователя
        socket.on('user:updated', handleUserUpdate);

        // Присоединяемся к комнате пользователя
        socket.emit('join:user', session.user.email);

        return () => {
            socket.off('user:updated', handleUserUpdate);
            socket.emit('leave:user', session.user.email);
        };
    }, [socket, session, update, form]);

    // Инициализация формы при загрузке
    useEffect(() => {
        if (session?.user) {
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

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        try {
            setIsLoading(true);

            const fullName = [values.lastName, values.firstName, values.middleName]
                .filter(Boolean)
                .join(" ");

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fullName,
                    newEmail: values.newEmail,
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            // Обновляем сессию с новыми данными пользователя
            if(session){
                if (data.user) {
                    await update({
                        ...session,
                        user: {
                            ...session.user,
                            ...data.user
                        }
                    });
                }
            }

            // Обновление произойдет автоматически через сокет
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ... Rest of the form JSX remains the same ... */}
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