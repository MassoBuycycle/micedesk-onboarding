import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { createRoom as saveMainRoomConfig } from '@/apiClient/roomsApi';
import { mapRoomFormToApi } from '@/utils/roomMapping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Schema for form validation
const roomFormSchema = z.object({
  main_contact_name_room: z.string().min(1, "Contact name is required"),
  main_contact_position_room: z.string().min(1, "Contact position is required"),
  room_phone: z.string().min(1, "Phone number is required"),
  room_email: z.string().email("Invalid email address"),
  check_in_time: z.string().min(1, "Check-in time is required"),
  check_out_time: z.string().min(1, "Check-out time is required"),
  early_checkin_fee: z.coerce.number().min(0).default(0),
  late_checkout_fee: z.coerce.number().min(0).default(0),
  early_check_in_time_frame: z.string().optional(),
  late_check_out_tme: z.string().optional(),
  reception_hours: z.string().optional(),
  payment_methods: z.array(z.string()).default([]),
  single_rooms: z.coerce.number().min(0).default(0),
  double_rooms: z.coerce.number().min(0).default(0),
  connected_rooms: z.coerce.number().min(0).default(0),
  accessible_rooms: z.coerce.number().min(0).default(0),
  dogs_allowed: z.boolean().default(false),
  dog_fee: z.coerce.number().min(0).default(0),
  dog_fee_inclusions: z.string().optional(),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
  selectedHotel: any;
  initialData?: Partial<RoomFormValues>;
  onNext: (data: RoomFormValues) => void;
  onPrevious: (data: RoomFormValues) => void;
  onChange?: (data: Partial<RoomFormValues>) => void;
  mode?: 'add' | 'edit';
}

// Standard room features options
const standardRoomFeatures = [
  { id: 'shower_toilet', label: 'Shower Toilet' },
  { id: 'bathtub_toilet', label: 'Bathtub Toilet' },
  { id: 'open_bathroom', label: 'Open Bathroom' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'safe', label: 'Safe' },
  { id: 'air_condition', label: 'Air Condition' },
  { id: 'heating', label: 'Heating' },
  { id: 'hair_dryer', label: 'Hair Dryer' },
  { id: 'ironing_board', label: 'Ironing Board' },
  { id: 'tv', label: 'TV' },
  { id: 'telefon', label: 'Telephone' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'desk', label: 'Desk' },
  { id: 'coffee_maker', label: 'Coffee Maker' },
  { id: 'kettle', label: 'Kettle' },
  { id: 'minibar', label: 'Minibar' },
  { id: 'fridge', label: 'Fridge' },
  { id: 'allergy_friendly_bed_linen', label: 'Allergy-Friendly Bed Linen' },
];

// Payment method options
const paymentMethodOptions = [
  { id: 'cash', label: 'Cash' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'apple_pay', label: 'Apple Pay' },
  { id: 'google_pay', label: 'Google Pay' },
];

const RoomForm = ({ selectedHotel, initialData = {}, onNext, onPrevious, onChange, mode }: RoomFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      main_contact_name_room: '',
      main_contact_position_room: '',
      room_phone: '',
      room_email: '',
      check_in_time: '14:00',
      check_out_time: '12:00',
      early_checkin_fee: 0,
      late_checkout_fee: 0,
      early_check_in_time_frame: '',
      late_check_out_tme: '',
      reception_hours: '24/7',
      payment_methods: [],
      single_rooms: 0,
      double_rooms: 0,
      connected_rooms: 0,
      accessible_rooms: 0,
      dogs_allowed: false,
      dog_fee: 0,
      dog_fee_inclusions: '',
      ...initialData
    }
  });

  // useEffect to call onChange prop when form values change for live preview
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value as Partial<RoomFormValues>); 
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  const onSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    
    try {
      const payload = mapRoomFormToApi(selectedHotel.id, data);
      await saveMainRoomConfig(payload);
      // TODO: Endpoint for standard features once backend ready
      
      toast.success("Room information saved.");
      
      onNext(data); // Proceed to next step, data is passed to useHotelFormState
    } catch (error) {
      console.error('Error in RoomForm onSubmit (old logic might be present):', error);
      toast.error("An error occurred in the room form step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Room Information</h2>
        <p className="text-muted-foreground">
            Enter details about the rooms and guest facilities for {selectedHotel?.name || "this hotel"}.
        </p>
      </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Main contact person for room-related inquiries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="main_contact_name_room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="main_contact_position_room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Front Desk Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="room_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="+123 456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="room_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Check-in/Check-out Information */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in & Check-out</CardTitle>
            <CardDescription>Room availability and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="check_in_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time*</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="check_out_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Time*</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="early_check_in_time_frame"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Early Check-in Time Frame</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10:00-14:00" {...field} />
                    </FormControl>
                    <FormDescription>Time window for early check-in</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="early_checkin_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Early Check-in Fee</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="late_check_out_tme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Check-out Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 14:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="late_checkout_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Check-out Fee</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reception_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reception Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 24/7 or 06:00-22:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Counts */}
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
            <CardDescription>Details about room types and quantities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="single_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Single Rooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="double_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Double Rooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="connected_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Connecting Rooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accessible_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Accessible Rooms</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Standard Room Features */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Room Features</CardTitle>
            <CardDescription>Select all features available in standard rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {standardRoomFeatures.map(feature => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={feature.id} 
                    checked={selectedFeatures.includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <Label htmlFor={feature.id}>{feature.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Select all accepted payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="payment_methods"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {paymentMethodOptions.map((method) => (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name="payment_methods"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={method.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(method.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, method.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== method.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {method.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pet Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Pet Policy</CardTitle>
            <CardDescription>Information about pet accommodation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="dogs_allowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Dogs Allowed</FormLabel>
                    <FormDescription>
                      Are dogs allowed in the hotel?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('dogs_allowed') && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="dog_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dog Fee</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Fee per pet per stay/night</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dog_fee_inclusions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dog Fee Inclusions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Bed, bowl, treats, etc."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>What is included in the pet fee?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
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
          
          <Button type="submit" className="gap-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
          Next <ArrowRight className="h-4 w-4" />
              </>
            )}
        </Button>
      </div>
      </form>
    </Form>
  );
};

export default RoomForm;
