import { auth } from "@clerk/nextjs/server";
import HotelsClientWrapper from "@/components/hotel/HotelsClientWrapper";

export default async function Home() {
    const { userId } = await auth();

    return <HotelsClientWrapper userId={userId} />;
}