'use client';

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
    value: string;
    onValueChange: (value: string) => void;
}

const StarRating = ({ value, onValueChange }: StarRatingProps) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const currentRating = hoverRating ?? parseFloat(value);

    const handleStarClick = (starIndex: number, isHalf: boolean) => {
        const newRating = starIndex + (isHalf ? 0.5 : 1);
        onValueChange(newRating.toString());
    };

    const handleStarHover = (starIndex: number, isHalf: boolean) => {
        setHoverRating(starIndex + (isHalf ? 0.5 : 1));
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            const starValue = i + 1;
            const fillPercentage = Math.min(Math.max((currentRating - i) * 100, 0), 100);

            stars.push(
                <div
                    key={i}
                    className="relative cursor-pointer"
                    onMouseLeave={() => setHoverRating(null)}
                >
                    {/* Левая половина звезды */}
                    <div
                        className="absolute left-0 w-[50%] h-full z-10"
                        onMouseEnter={() => handleStarHover(i, true)}
                        onClick={() => handleStarClick(i, true)}
                    />
                    {/* Правая половина звезды */}
                    <div
                        className="absolute right-0 w-[50%] h-full z-10"
                        onMouseEnter={() => handleStarHover(i, false)}
                        onClick={() => handleStarClick(i, false)}
                    />
                    <div className="relative w-6 h-6">
                        {/* Фоновая звезда */}
                        <Star className="absolute w-6 h-6 text-gray-300" />
                        {/* Заполненная звезда */}
                        <div
                            className="absolute w-6 h-6 overflow-hidden"
                            style={{ width: `${fillPercentage}%` }}
                        >
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                    </div>
                </div>
            );
        }
        return stars;
    };

    return (
        <div className="flex gap-1 items-center">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-500">
                {currentRating.toFixed(1)}
            </span>
        </div>
    );
};

export default StarRating;