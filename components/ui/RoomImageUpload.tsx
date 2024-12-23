import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface RoomImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

const RoomImageUpload = ({ onChange, value }: RoomImageUploadProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setIsLoading(true);

        if (!file.type.includes('image')) {
            setIsLoading(false);
            return;
        }

        try {
            // Создаем новый FileReader для этого конкретного файла
            const reader = new FileReader();

            // Создаем Promise для обработки загрузки файла
            const base64String = await new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject(new Error('Failed to read file'));
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
            });

            // Вызываем onChange только после успешного получения base64
            onChange(base64String);
        } catch (error) {
            console.error('Error reading file:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="roomImageUpload"
            />
            <label
                htmlFor="roomImageUpload"
                className="
                    relative
                    cursor-pointer
                    hover:opacity-70
                    border-2
                    border-dashed
                    border-gray-300
                    flex
                    flex-col
                    justify-center
                    items-center
                    gap-4
                    text-neutral-600
                    p-20
                "
            >
                <div className="text-lg font-semibold">
                    {isLoading ? 'Загрузка...' : 'Нажмите для загрузки фото номера'}
                </div>
            </label>
            {value && (
                <div className="relative w-full h-96">
                    <Image
                        fill
                        alt="Room Upload"
                        src={value}
                        className="object-contain"
                    />
                    <Button
                        className="absolute top-2 right-2"
                        variant="destructive"
                        type="button"
                        onClick={() => onChange('')}
                    >
                        Удалить
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RoomImageUpload;