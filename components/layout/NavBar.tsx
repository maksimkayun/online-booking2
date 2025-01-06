"use client";

import { memo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/layout/NavMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Hotel, User } from "lucide-react";
import { ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";

const NavBar = memo(() => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    const Logo = () => (
        <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => handleNavigation('/')}
        >
            <Hotel className="w-[30px] h-[30px]" />
            <div className="font-bold text-xl">Online booking</div>
        </div>
    );

    const UserMenu = () => {
        if (status === 'loading') return null;

        if (status === 'authenticated') {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer">
                            <AvatarFallback>
                                {session.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            Профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                            <ExitIcon className="mr-2 h-4 w-4" />
                            Выйти
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <>
                <Button
                    onClick={() => handleNavigation('/auth/signin')}
                    variant="outline"
                    size="sm"
                >
                    Войти
                </Button>
                <Button
                    onClick={() => handleNavigation('/auth/signup')}
                    size="sm"
                >
                    Регистрация
                </Button>
            </>
        );
    };

    return (
        <div className="sticky top-0 border border-b-primary/10 bg-secondary z-50">
            <Container>
                <div className="flex justify-between items-center">
                    <Logo />
                    <div className="flex gap-3 items-center">
                        <NavMenu />
                        <UserMenu />
                    </div>
                </div>
            </Container>
        </div>
    );
});

NavBar.displayName = 'NavBar';

export default NavBar;