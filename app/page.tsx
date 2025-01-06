import HotelsClientWrapper from "@/components/hotel/HotelsClientWrapper";
import { Separator } from "@/components/ui/separator";
import WelcomeSection from "@/components/WelcomeSection";

export default async function Home() {
    return (
        <div className="space-y-8">
            <WelcomeSection />
            <Separator/>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center">Популярные отели</h2>
                <HotelsClientWrapper/>
            </div>
        </div>
    );
}