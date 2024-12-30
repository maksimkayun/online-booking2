import dynamic from 'next/dynamic';

const NewHotelPage = dynamic(
    () => import('@/components/hotel/NewHotelPage'),
    { ssr: false }
);

export default function Page() {
    return <NewHotelPage />;
}