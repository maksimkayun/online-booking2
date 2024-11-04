import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

const ImageUpload = ({ onChange, value }: ImageUploadProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setIsLoading(true);

        if (!file.type.includes('image')) {
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            onChange(base64String);
            setIsLoading(false);
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col space-y-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="imageUpload"
            />
            <label
                htmlFor="imageUpload"
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
                <div className="text-lg font-semibold">Нажмите для загрузки</div>
                {isLoading && (
                    <div>Загрузка...</div>
                )}
            </label>
            {value && (
                <div className="relative w-full h-96">
                    <Image
                        fill
                        alt="Upload"
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

export default ImageUpload;