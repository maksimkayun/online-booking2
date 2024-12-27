"use client";

import { signOut, useSession } from "next-auth/react";
import Container from "@/components/Container";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/SearchInput";
import { NavMenu } from "@/components/layout/NavMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
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
                            <Image
                                src="/logo.svg"
                                alt="logo"
                                fill
                                priority
                                sizes="30px"
                            />
                        </div>
                        <div className="font-bold text-xl">Online booking</div>
                    </div>

                    <SearchInput />

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
                                    <DropdownMenuItem onClick={handleSignOut}>
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