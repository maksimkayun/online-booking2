"use client";

import { signOut, useSession } from "next-auth/react";
import Container from "@/components/Container";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/layout/NavMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useEffect, useState} from "react";
import {Hotel, User} from "lucide-react";
import {ExitIcon} from "@radix-ui/react-icons"; // Добавляем иконку как запасной вариант

const NavBar = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            // Можно добавить дополнительную логику при необходимости
            router.refresh();
        }
    }, [session, status, router]);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    const handleNavigate = (path: string) => {
        // Используем setTimeout чтобы дать время на закрытие диалога/дропдауна
        setTimeout(() => {
            router.push(path);
        }, 0);
    };

    const handleLogoError = () => {
        setLogoError(true);
    };

    const Logo = () => {
        if (logoError) {
            return <Hotel className="w-[30px] h-[30px]" />;
        }

        return (
            <Image
                src="/logo.svg"
                alt="logo"
                width={30}
                height={30}
                onError={handleLogoError}
                priority
            />
        );
    };

    return (
        <div className="sticky top-0 border border-b-primary/10 bg-secondary z-50">
            <Container>
                <div className="flex justify-between items-center">
                    <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <div className="relative w-[30px] h-[30px]">
                            <Logo />
                        </div>
                        <div className="font-bold text-xl">Online booking</div>
                    </div>

                    {/*<SearchInput />*/}

                    <div className="flex gap-3 items-center">
                        <NavMenu />

                        {status === 'authenticated' ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={session.user?.image || ''} />
                                        <AvatarFallback>
                                            {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleNavigate('/profile')}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Профиль
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <ExitIcon className="mr-2 h-4 w-4" />
                                        Выйти
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    onClick={() => router.push('/auth/signin')}
                                    variant="outline"
                                    size="sm"
                                >
                                    Войти
                                </Button>
                                <Button
                                    onClick={() => router.push('/auth/signup')}
                                    size="sm"
                                >
                                    Регистрация
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default NavBar;