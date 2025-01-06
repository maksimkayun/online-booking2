import { BadgeCheck, Building2, Clock, Shield } from 'lucide-react';
import HotelsClientWrapper from "@/components/hotel/HotelsClientWrapper";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
    return (
        <div>
            {/* Hero Section */}
            <div className="relative py-20 bg-primary/5 rounded-lg mb-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Добро пожаловать в Online Booking
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Найдите идеальное место для вашего отдыха среди тысяч отелей по всей России
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="p-6 rounded-lg bg-card border transition-colors hover:bg-accent">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Building2 className="h-10 w-10 text-primary mb-2" />
                        <h3 className="font-semibold">Лучшие отели</h3>
                        <p className="text-sm text-muted-foreground">
                            Тщательно отобранные отели с высоким рейтингом
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-card border transition-colors hover:bg-accent">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Shield className="h-10 w-10 text-primary mb-2" />
                        <h3 className="font-semibold">Безопасное бронирование</h3>
                        <p className="text-sm text-muted-foreground">
                            Гарантия безопасности платежей и данных
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-card border transition-colors hover:bg-accent">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Clock className="h-10 w-10 text-primary mb-2" />
                        <h3 className="font-semibold">Быстрое подтверждение</h3>
                        <p className="text-sm text-muted-foreground">
                            Моментальное подтверждение бронирования
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-card border transition-colors hover:bg-accent">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <BadgeCheck className="h-10 w-10 text-primary mb-2" />
                        <h3 className="font-semibold">Лучшие цены</h3>
                        <p className="text-sm text-muted-foreground">
                            Гарантия лучшей цены на все отели
                        </p>
                    </div>
                </div>
            </div>

            <Separator className="my-8" />

            {/* Hotels Section */}
            <div>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Доступные отели</h2>
                    <p className="text-muted-foreground mt-2">
                        Выберите отель для вашего идеального отдыха
                    </p>
                </div>
                <HotelsClientWrapper />
            </div>
        </div>
    );
}