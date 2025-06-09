import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoomTypeInput } from '@/apiClient/roomsApi'; // Ensure correct path
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Schema for RoomTypeInput - ensure it matches the API expected structure
const roomTypeDetailsSchema = z.object({
  name: z.string().min(1, "Room type name is required"),
  max_occupancy: z.coerce.number().min(1, "Max occupancy must be at least 1"),
  base_price: z.coerce.number().min(0, "Base price cannot be negative"),
  description: z.string().optional(),
  hotel_id: z.number(), // This will be passed in, not editable here
});

// We only need a subset for the form itself, hotel_id will be added before API call
export type RoomTypeDetailsFormValues = Omit<RoomTypeInput, 'hotel_id' | 'categories'>;

interface RoomTypeDetailsFormProps {
  initialData?: Partial<RoomTypeDetailsFormValues>;
  onNext: (data: RoomTypeDetailsFormValues) => void;
  onPrevious: (data: Partial<RoomTypeDetailsFormValues>) => void;
  onChange?: (data: Partial<RoomTypeDetailsFormValues>) => void; 
  // hotelId will be used by useHotelFormState to populate hotel_id in RoomTypeInput
}

const RoomTypeDetailsForm: React.FC<RoomTypeDetailsFormProps> = ({ 
  initialData = {}, 
  onNext, 
  onPrevious, 
  onChange 
}) => {
  const form = useForm<RoomTypeDetailsFormValues>({
    resolver: zodResolver(roomTypeDetailsSchema.omit({ hotel_id: true })), // Omit hotel_id from form validation directly
    defaultValues: {
      name: '',
      max_occupancy: 1,
      base_price: 0,
      description: '',
      ...initialData,
    },
  });

  React.useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value as Partial<RoomTypeDetailsFormValues>);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

  const onSubmit = (data: RoomTypeDetailsFormValues) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Type Details</CardTitle>
            <CardDescription>Define the basic details for this room type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Standard Double, Deluxe Suite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_occupancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Occupancy*</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="e.g., 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price (per night)*</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="e.g., 99.90" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe this room type..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onPrevious(form.getValues())}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          
          <Button type="submit" className="gap-1">
             Next <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoomTypeDetailsForm; 