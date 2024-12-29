'use client';

import { Star, StarHalf } from "lucide-react";

interface HotelRatingProps {
    rating: number | { toNumber: () => number };
    className?: string;
    showValue?: boolean; // Добавляем опциональный параметр для отображения значения
}

const HotelRating = ({ rating, className = "", showValue = true }: HotelRatingProps) => {
    // Преобразуем rating в число
    const ratingNumber = typeof rating === 'number' ? rating : 1;

    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(ratingNumber);
        const hasHalfStar = ratingNumber % 1 !== 0;

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={`full-${i}`}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
            );
        }

        // Add half star if needed
        if (hasHalfStar) {
            stars.push(
                <StarHalf
                    key="half"
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
            );
        }

        // Add empty stars
        const emptyStars = 5 - Math.ceil(ratingNumber);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star
                    key={`empty-${i}`}
                    className="w-4 h-4 text-yellow-400"
                />
            );
        }

        return stars;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex gap-0.5">
                {renderStars()}
            </div>
            {showValue && (
                <span className="text-sm font-medium">
                    {ratingNumber.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default HotelRating;