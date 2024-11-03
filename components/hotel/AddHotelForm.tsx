'use client'

import {Hotel, Room} from "@prisma/client";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

interface AddHotelFormProps {
    hotel: HotelWithRooms | null;
}
export type HotelWithRooms = Hotel &
    { rooms: Room[] };

const formSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters long",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters long",
    }),
    image: z.string().min(1, {
        message: "Image URL is required",
    }),
    country: z.string().min(1, {
        message: "Country is required",
    }),
    state: z.string().optional(),
    city : z.string().optional(),
    locationDescription: z.string().optional(),
    gym: z.boolean().optional(),
    spa: z.boolean().optional(),
    bar: z.boolean().optional(),
    laundry: z.boolean().optional(),
    restaurant: z.boolean().optional(),
    shoppping: z.boolean().optional(),
    freeParking: z.boolean().optional(),
    bikeRental: z.boolean().optional(),
    freeWifi: z.boolean().optional(),
    movieNights: z.boolean().optional(),
    swimmingPool: z.boolean().optional(),
    coffeeShop: z.boolean().optional(),
});

const AddHotelForm = ({hotel}: AddHotelFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            image: "",
            country: "",
            state: "",
            city: "",
            locationDescription: "",
        },
    })
    return (
        <div>
            Add
        </div>
    );
}

export default AddHotelForm;