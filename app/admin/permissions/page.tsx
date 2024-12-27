'use client';

import { useState } from 'react';
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@prisma/client";
import { Loader2 } from "lucide-react";

export default function AdminPermissionsPage() {
    const { permissions, isLoading, mutate, userName } = usePermissions();
    const [newUserId, setNewUserId] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('USER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/permissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUserId: newUserId,
                    role: newRole,
                    userName: userName
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update permissions');
            }

            toast({
                title: "Успешно!",
                description: "Права пользователя обновлены",
            });

            setNewUserId('');
            mutate();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось обновить права пользователя",
            });
        } finally {
            setIsSubmitting(false);
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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Управление правами пользователей</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                placeholder="ID пользователя"
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                                required
                            />
                            <Select
                                value={newRole}
                                onValueChange={(value) => setNewRole(value as UserRole)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Администратор</SelectItem>
                                    <SelectItem value="MANAGER">Менеджер</SelectItem>
                                    <SelectItem value="USER">Пользователь</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Сохранить'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Текущие права</h3>
                        <div className="grid gap-4">
                            {permissions?.map((permission) => (
                                <Card key={permission.userId}>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-medium">{permission.userId}</p>
                                            {permission.userName && (
                                                <p className="text-sm text-muted-foreground">
                                                    Имя: {permission.userName}
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Роль: {permission.role}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(permission.updatedAt).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}