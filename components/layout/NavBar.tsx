"use client"

import {useAuth, UserButton} from "@clerk/nextjs";
import Container from "@/components/Container";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/SearchInput";
import { NavMenu } from "@/components/layout/NavMenu";

const NavBar = () => {
    const router = useRouter();
    const { userId, isLoaded } = useAuth();

    if (!isLoaded) {
        return null;
    }

    return (
        <div className="sticky top-0 border border-b-primary/10 bg-secondary z-50">
            <Container>
                <div className='flex justify-between items-center'>
                    <div className="flex items-center gap-1 cursor-pointer"
                         onClick={() => router.push('/')}>
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
                    <div className='flex gap-3 items-center'>
                        <div>
                            <NavMenu />
                        </div>
                        <UserButton afterSignOutUrl="/"/>
                        {!userId && <>
                            <Button onClick={() => router.push('/sign-in')} variant='outline' size='sm'>Sign In</Button>
                            <Button onClick={() => router.push('/sign-up')} size='sm'>Sign Up</Button>
                        </>}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default NavBar;