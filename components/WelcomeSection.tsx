'use client';

import { BadgeCheck, Building2, Clock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const WelcomeSection = () => {
    const { status } = useSession();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Показываем секцию только если пользователь не авторизован
        if (status === 'unauthenticated') {
            setIsVisible(true);
        } else if (status === 'authenticated') {
            setIsVisible(false);
        }
    }, [status]);

    // Не рендерим компонент, если он невидим
    if (!isVisible) return null;

    return (
        <div className={cn(
            "py-12 space-y-12 transition-all duration-1000 ease-in-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
            {/* Hero section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">
                    Добро пожаловать в Online Booking
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Найдите идеальное место для вашего отдыха среди тысяч отелей по всей России
                </p>
            </div>

            {/* Features section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card">
                    <Building2 className="h-10 w-10 text-primary" />
                    <h3 className="font-semibold">Лучшие отели</h3>
                    <p className="text-sm text-muted-foreground">
                        Тщательно отобранные отели с высоким рейтингом и отличным сервисом
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card">
                    <Shield className="h-10 w-10 text-primary" />
                    <h3 className="font-semibold">Безопасное бронирование</h3>
                    <p className="text-sm text-muted-foreground">
                        Гарантия безопасности платежей и сохранности личных данных
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card">
                    <Clock className="h-10 w-10 text-primary" />
                    <h3 className="font-semibold">Мгновенное подтверждение</h3>
                    <p className="text-sm text-muted-foreground">
                        Моментальное подтверждение бронирования и полная информация о заказе
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 p-6 rounded-lg bg-card">
                    <BadgeCheck className="h-10 w-10 text-primary" />
                    <h3 className="font-semibold">Лучшие цены</h3>
                    <p className="text-sm text-muted-foreground">
                        Гарантия лучшей цены на все представленные отели
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeSection;