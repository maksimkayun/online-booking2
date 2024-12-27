import { Room } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface RoomsListProps {
    rooms: Room[];
    selectedRoom?: string;
    onRoomSelect?: (roomId: string) => void;
}

export function RoomsList({ rooms, selectedRoom, onRoomSelect }: RoomsListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
                <Card
                    key={room.id}
                    className={cn(
                        "transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-primary/50",
                        selectedRoom === room.id ? 'ring-2 ring-primary' : ''
                    )}
                    onClick={() => onRoomSelect?.(room.id)}
                >
                    <div className="relative h-48">
                        <Image
                            src={room.image}
                            alt={room.title}
                            fill
                            className="object-cover rounded-t-lg"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{room.title}</span>
                            <Badge variant="secondary">{room.roomPrice}₽/ночь</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{room.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}