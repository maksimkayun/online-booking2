'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, Clock } from "lucide-react";
import StarRating from "../ui/StarRating";
import { Label } from "@/components/ui/label";

interface HotelsFilterProps {
    selectedRating: string;
    onRatingChange: (value: string) => void;
    showBestFirst: boolean;
    onSortToggle: () => void;
    onReset: () => void;
}

export default function HotelsFilter({
                                         selectedRating,
                                         onRatingChange,
                                         showBestFirst,
                                         onSortToggle,
                                         onReset,
                                     }: HotelsFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mb-6">
            <div className="flex-1 space-y-2">
                <div className="flex items-center h-7"> {/* Фиксированная высота */}
                    <Label className="mr-3">Фильтр по рейтингу</Label>
                    <div className="w-[120px]"> {/* Фиксированная ширина для кнопки */}
                        {selectedRating !== "all" && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={onReset}
                                className="h-7 text-xs w-full"
                            >
                                Сбросить фильтр
                            </Button>
                        )}
                    </div>
                </div>
                <StarRating
                    value={selectedRating === "all" ? "0" : selectedRating}
                    onValueChange={(value) => onRatingChange(value === "0" ? "all" : value)}
                />
            </div>

            <Button
                variant="outline"
                onClick={onSortToggle}
                className="shrink-0"
            >
                {showBestFirst ? (
                    <>
                        <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                        Сначала лучшие
                    </>
                ) : (
                    <>
                        <Clock className="mr-2 h-4 w-4" />
                        Сначала новые
                    </>
                )}
            </Button>
        </div>
    );
}