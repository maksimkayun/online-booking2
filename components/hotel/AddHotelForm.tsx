'use client'

import {Hotel, Room} from "@prisma/client";
import * as z from "zod";
import { useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";

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
            gym: false,
            spa: false,
            bar: false,
            laundry: false,
            restaurant: false,
            shoppping: false,
            freeParking: false,
            bikeRental: false,
            freeWifi: false,
            movieNights: false,
            swimmingPool: false,
            coffeeShop: false,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <h3 className="text-lg font-semibold" >{hotel ? 'Update hotel' : 'Create hotel'}</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 flex flex-col gap-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hotel title</FormLabel>
                                        <FormDescription>
                                            Hotel name
                                        </FormDescription>
                                        <FormControl>
                                            <Input placeholder="Beach Hotel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hotel description</FormLabel>
                                        <FormDescription>
                                            Description of the hotel
                                        </FormDescription>
                                        <FormControl>
                                            <Textarea placeholder="Beach Hotel is parked with many awesome" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                <FormLabel>Choose Amenities</FormLabel>
                                <FormDescription>Choose Amenities popular in this hotel</FormDescription>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <FormField
                                        control={form.control}
                                        name="gym"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                    onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>Gym</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="spa"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>Spa</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bar"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>Bar</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="laundry"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>Laundry</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="restaurant"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>Restaurant</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="shoppping"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>Shoppping</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="freeParking"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>FreeParking</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bikeRental"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>BikeRental</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="freeWifi"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>FreeWifi</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="movieNights"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>MovieNights</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="swimmingPool"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>SwimmingPool</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="coffeeShop"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-end space-x-3 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={field.onChange}/>
                                                </FormControl>
                                                <FormLabel>CoffeeShop</FormLabel>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-6">part 2</div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddHotelForm;