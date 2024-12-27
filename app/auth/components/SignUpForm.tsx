'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {signIn} from "next-auth/react";

const formSchema = z.object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Некорректный email"),
    password: z.string().min(6, "Минимум 6 символов"),
});

export function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);

            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                throw new Error("Registration failed");
            }

            // После успешной регистрации выполняем вход
            const signInResult = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (signInResult?.error) {
                toast({
                    variant: "destructive",
                    title: "Ошибка",
                    description: "Не удалось войти после регистрации",
                });
                return;
            }

            router.push("/");
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось создать аккаунт",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-[350px] space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Создать аккаунт</h1>
                <p className="text-muted-foreground">
                    Введите данные для регистрации
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
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
                        name="email"
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Пароль</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Загрузка..." : "Зарегистрироваться"}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm">
                Уже есть аккаунт?{" "}
                <Link href="/auth/signin" className="underline">
                    Войти
                </Link>
            </div>
        </div>
    );
}