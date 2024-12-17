'use client';

import { useEffect, useState } from 'react';
import { Hotel } from '@prisma/client';
import HotelList from './HotelList';

interface HotelsWrapperProps {
    initialHotels: Hotel[];
}

export default function HotelsWrapper({ initialHotels }: HotelsWrapperProps) {
    const [hotels, setHotels] = useState<Hotel[]>(initialHotels);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('/api/hotels');
                if (response.ok) {
                    const data = await response.json();
                    setHotels(data);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        };

        // Устанавливаем интервал обновления данных
        const interval = setInterval(fetchHotels, 5000); // каждые 5 секунд

        return () => clearInterval(interval);
    }, []);

    return <HotelList hotels={hotels} />;
}