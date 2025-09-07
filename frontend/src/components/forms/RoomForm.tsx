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
import { useTranslation } from 'react-i18next';
import { PhoneField } from '@/components/shared/FormFields';

// Schema for form validation
const roomFormSchema = z.object({
  main_contact_name_room: z.string().min(1, "Contact name is required"),
  main_contact_position_room: z.string().min(1, "Contact position is required"),
  room_phone: z.string().min(1, "Phone number is required"),
  room_email: z.string().email("Invalid email address"),
  check_in_time: z.string().min(1, "Check-in time is required"),
  check_out_time: z.string().min(1, "Check-out time is required"),
  early_checkin_fee: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
  late_checkout_fee: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
  early_check_in_time_frame: z.string().optional(),
  late_check_out_tme: z.string().optional(),
  reception_hours: z.string().optional(),
  payment_methods: z.array(z.string()).default([]),
  standard_features: z.array(z.string()).default([]),
  single_rooms: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
  double_rooms: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
  connected_rooms: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
  accessible_rooms: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
  dogs_allowed: z.boolean().default(false),
  dog_fee: z.preprocess((v) => v === '' || v === null ? undefined : v, z.coerce.number().min(0).optional()),
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

const RoomForm = ({ selectedHotel, initialData = {}, onNext, onPrevious, onChange, mode }: RoomFormProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      main_contact_name_room: '',
      main_contact_position_room: '',
      room_phone: '',
      room_email: '',
      check_in_time: '14:00',
      check_out_time: '12:00',
      early_checkin_fee: undefined as unknown as number, // leave empty
      late_checkout_fee: undefined as unknown as number, // leave empty
      early_check_in_time_frame: '',
      late_check_out_tme: '',
      reception_hours: '24/7',
      payment_methods: [],
      standard_features: [],
      single_rooms: undefined as unknown as number, // leave empty
      double_rooms: undefined as unknown as number, // leave empty
      connected_rooms: undefined as unknown as number, // leave empty
      accessible_rooms: undefined as unknown as number, // leave empty
      dogs_allowed: false,
      dog_fee: undefined as unknown as number, // leave empty
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

  const onSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Remove old API call - let useHotelFormState handle room creation
      toast.success("Room information captured.");
      
      onNext(data); // Pass data to useHotelFormState
    } catch (error) {
      console.error('Error in RoomForm onSubmit:', error);
      toast.error("An error occurred in the room form step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // build translated arrays
  const standardRoomFeatures = [
    { id: 'shower_toilet', label: t('rooms.features.showerToilet') },
    { id: 'bathtub_toilet', label: t('rooms.features.bathtubToilet') },
    { id: 'open_bathroom', label: t('rooms.features.openBathroom') },
    { id: 'balcony', label: t('rooms.features.balcony') },
    { id: 'safe', label: t('rooms.features.safe') },
    { id: 'air_condition', label: t('rooms.features.airCondition') },
    { id: 'heating', label: t('rooms.features.heating') },
    { id: 'hair_dryer', label: t('rooms.features.hairDryer') },
    { id: 'ironing_board', label: t('rooms.features.ironingBoard') },
    { id: 'tv', label: t('rooms.features.tv') },
    { id: 'telephone', label: t('rooms.features.telephone') },
    { id: 'wifi', label: t('rooms.features.wifi') },
    { id: 'desk', label: t('rooms.features.desk') },
    { id: 'coffee_maker', label: t('rooms.features.coffeeMaker') },
    { id: 'kettle', label: t('rooms.features.kettle') },
    { id: 'minibar', label: t('rooms.features.minibar') },
    { id: 'fridge', label: t('rooms.features.fridge') },
    { id: 'allergy_friendly_bedding', label: t('rooms.features.allergyFriendlyBedLinen') },
  ];

  const paymentMethodOptions = [
    { id: 'cash', label: t('rooms.paymentMethodsList.cash') },
    { id: 'credit_card', label: t('rooms.paymentMethodsList.creditCard') },
    { id: 'debit_card', label: t('rooms.paymentMethodsList.debitCard') },
    { id: 'bank_transfer', label: t('rooms.paymentMethodsList.bankTransfer') },
    { id: 'paypal', label: t('rooms.paymentMethodsList.paypal') },
    { id: 'apple_pay', label: t('rooms.paymentMethodsList.applePay') },
    { id: 'google_pay', label: t('rooms.paymentMethodsList.googlePay') },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{t('rooms.title')}</h2>
        <p className="text-muted-foreground">
            {t('rooms.formIntro', { hotelName: selectedHotel?.name || '' })}
        </p>
      </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('rooms.mainContact')}</CardTitle>
            <CardDescription>{t('rooms.mainContactDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="main_contact_name_room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rooms.mainContact')}*</FormLabel>
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
                    <FormLabel>{t('rooms.position')}*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Front Desk Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <PhoneField
                form={form}
                name="room_phone"
                label={`${t('rooms.phone')}*`}
                placeholder="+123 456 7890"
              />
              
              <FormField
                control={form.control}
                name="room_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rooms.email')}*</FormLabel>
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
            <CardTitle>{t('rooms.checkInOutSection')}</CardTitle>
            <CardDescription>{t('rooms.checkInOutDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="check_in_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rooms.checkInTime')}*</FormLabel>
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
                    <FormLabel>{t('rooms.checkOutTime')}*</FormLabel>
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
                    <FormLabel>{t('rooms.earlyCheckInTimeFrame')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10:00-14:00" {...field} />
                    </FormControl>
                    <FormDescription>{t('rooms.earlyCheckInTimeFrameDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="early_checkin_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rooms.earlyCheckInFee')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder={t('rooms.earlyCheckInFee')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
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
                    <FormLabel>{t('rooms.lateCheckOutTime')}</FormLabel>
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
                    <FormLabel>{t('rooms.lateCheckOutFee')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder={t('rooms.lateCheckOutFee')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
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
                    <FormLabel>{t('rooms.receptionHours')}</FormLabel>
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
            <CardTitle>{t('rooms.roomInformation')}</CardTitle>
            <CardDescription>{t('rooms.roomInformationDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="single_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rooms.singleRooms')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder={t('rooms.singleRooms')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
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
                    <FormLabel>{t('rooms.doubleRooms')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder={t('rooms.doubleRooms')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
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
                    <FormLabel>{t('rooms.connectedRooms')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder={t('rooms.connectedRooms')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
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
                    <FormLabel>{t('rooms.accessibleRooms')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder={t('rooms.accessibleRooms')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
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
            <CardTitle>{t('rooms.standardRoomFeatures')}</CardTitle>
            <CardDescription>{t('rooms.standardRoomFeaturesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="standard_features"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {standardRoomFeatures.map(feature => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name="standard_features"
                        render={({ field }) => (
                          <FormItem key={feature.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(feature.id)}
                                onCheckedChange={checked => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, feature.id])
                                    : field.onChange(currentValue.filter(value => value !== feature.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{feature.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>{t('rooms.paymentMethods')}</CardTitle>
            <CardDescription>{t('rooms.paymentMethodsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="payment_methods"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {paymentMethodOptions.map(method => (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name="payment_methods"
                        render={({ field }) => (
                          <FormItem key={method.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(method.id)}
                                onCheckedChange={checked => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, method.id])
                                    : field.onChange(currentValue.filter(value => value !== method.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{method.label}</FormLabel>
                          </FormItem>
                        )}
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
            <CardTitle>{t('rooms.petPolicy')}</CardTitle>
            <CardDescription>{t('rooms.petPolicyDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="dogs_allowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t('rooms.dogsAllowed')}</FormLabel>
                    <FormDescription>
                      {t('rooms.dogsAllowedDescription')}
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
                      <FormLabel>{t('rooms.dogFee')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder={t('rooms.dogFee')} {...field} value={field.value ?? ''} onWheel={(e) => e.currentTarget.blur()} />
                      </FormControl>
                      <FormDescription>{t('rooms.dogFeeDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dog_fee_inclusions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rooms.dogFeeInclusions')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('rooms.dogFeeInclusionsPlaceholder')}
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>{t('rooms.dogFeeInclusionsDescription')}</FormDescription>
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
          <ArrowLeft className="h-4 w-4" /> {t('rooms.previous')}
        </Button>
          
          <Button type="submit" className="gap-1">
            {t('rooms.next')} <ArrowRight className="h-4 w-4" />
          </Button>
      </div>
      </form>
    </Form>
  );
};

export default RoomForm;
