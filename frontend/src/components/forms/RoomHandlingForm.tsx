import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { RoomOperationalHandlingInput } from '@/types/roomOperational';

const paymentMethodOptions = [
  { id: 'cash', label: 'Cash' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'apple_pay', label: 'Apple Pay' },
  { id: 'google_pay', label: 'Google Pay' },
];

// Zod schema for validation
const operationalSchema = z.object({
  revenue_manager_name: z.string().optional(),
  revenue_contact_details: z.string().optional(),
  demand_calendar: z.boolean().default(false),
  demand_calendar_infos: z.string().optional(),
  revenue_call: z.boolean().default(false),
  revenue_calls_infos: z.string().optional(),
  group_request_min_rooms: z.coerce.number().optional(),
  group_reservation_category: z.string().optional(),
  group_rates_check: z.boolean().default(false),
  group_rates: z.string().optional(),
  breakfast_share: z.boolean().default(false),
  first_second_option: z.boolean().default(false),
  shared_options: z.boolean().default(false),
  first_option_hold_duration: z.string().optional(),
  overbooking: z.boolean().default(false),
  overbooking_info: z.string().optional(),
  min_stay_weekends: z.boolean().default(false),
  min_stay_weekends_infos: z.string().optional(),
  call_off_quota: z.boolean().default(false),
  call_off_method: z.string().optional(),
  call_off_deadlines: z.string().optional(),
  commission_rules: z.string().optional(),
  free_spot_policy_leisure_groups: z.string().optional(),
  restricted_dates: z.string().optional(),
  handled_by_mice_desk: z.boolean().default(false),
  requires_deposit: z.boolean().default(false),
  deposit_rules: z.string().optional(),
  payment_methods_room_handling: z.array(z.string()).default([]),
  final_invoice_handling: z.string().optional(),
  deposit_invoice_responsible: z.string().optional(),
  info_invoice_created: z.boolean().default(false),
});

type OperationalFormValues = z.infer<typeof operationalSchema>;

interface RoomOperationalFormProps {
  initialData?: Partial<OperationalFormValues>;
  selectedHotel: any;
  onNext: (data: Partial<OperationalFormValues>) => void;
  onPrevious: (data: Partial<OperationalFormValues>) => void;
  onChange?: (data: Partial<OperationalFormValues>) => void;
  mode?: 'add' | 'edit';
}

const RoomHandlingForm = ({ selectedHotel, initialData = {}, onNext, onPrevious, onChange, mode }: RoomOperationalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OperationalFormValues>({
    resolver: zodResolver(operationalSchema),
    defaultValues: {
      revenue_manager_name: '',
      revenue_contact_details: '',
      demand_calendar: false,
      demand_calendar_infos: '',
      revenue_call: false,
      revenue_calls_infos: '',
      group_request_min_rooms: undefined,
      group_reservation_category: '',
      group_rates_check: false,
      group_rates: '',
      breakfast_share: false,
      first_second_option: false,
      shared_options: false,
      first_option_hold_duration: '',
      overbooking: false,
      overbooking_info: '',
      min_stay_weekends: false,
      min_stay_weekends_infos: '',
      call_off_quota: false,
      call_off_method: '',
      call_off_deadlines: '',
      commission_rules: '',
      free_spot_policy_leisure_groups: '',
      restricted_dates: '',
      handled_by_mice_desk: false,
      requires_deposit: false,
      deposit_rules: '',
      payment_methods_room_handling: [],
      final_invoice_handling: '',
      deposit_invoice_responsible: '',
      info_invoice_created: false,
      ...initialData,
    },
  });
    
  // Live preview callback
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => onChange(value));
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

  const onSubmit = async (data: OperationalFormValues) => {
    setIsSubmitting(true);
    try {
      toast.success('Operational handling captured.');
      onNext(data);
    } catch (error) {
      toast.error('Could not process operational handling data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Revenue Management */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Management</CardTitle>
            <CardDescription>Who oversees revenue and how is demand tracked?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="revenue_manager_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Manager Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revenue_contact_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Phone / Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Demand Calendar */}
            <FormField
              control={form.control}
              name="demand_calendar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Demand Calendar available?</FormLabel>
                    <FormDescription>Enable if hotel provides a demand calendar.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('demand_calendar') && (
              <FormField
                control={form.control}
                name="demand_calendar_infos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demand Calendar Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Revenue Calls */}
            <FormField
              control={form.control}
              name="revenue_call"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div>
                    <FormLabel>Regular Revenue Calls?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('revenue_call') && (
              <FormField
                control={form.control}
                name="revenue_calls_infos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Call Infos</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Group Handling */}
        <Card>
          <CardHeader>
            <CardTitle>Group Handling & Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="group_request_min_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Rooms for Group Request</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group_reservation_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation Category</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="group_rates_check"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Group Rates need Approval?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group_rates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Rates Details</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="breakfast_share"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Breakfast share applicable?</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_second_option"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Offer 1st & 2nd Options?</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
      </div>

            <FormField
              control={form.control}
              name="shared_options"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Shared Options allowed?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="first_option_hold_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1st Option Hold Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 7 days" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Overbooking & Weekend Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Overbooking & Stay Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="overbooking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Overbooking allowed?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('overbooking') && (
              <FormField
                control={form.control}
                name="overbooking_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overbooking Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="min_stay_weekends"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Min. Stay on Weekends?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('min_stay_weekends') && (
              <FormField
                control={form.control}
                name="min_stay_weekends_infos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Stay Info</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Call-off & Commission */}
        <Card>
          <CardHeader>
            <CardTitle>Call-off & Commission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="call_off_quota"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Call-off Quota defined?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="call_off_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="call_off_deadlines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadlines</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="commission_rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Rules</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="free_spot_policy_leisure_groups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Free Spot Policy (Leisure Groups)</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Deposit & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="requires_deposit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Deposit Required?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch('requires_deposit') && (
              <FormField
                control={form.control}
                name="deposit_rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Rules</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="payment_methods_room_handling"
              render={() => (
                <FormItem>
                  <FormLabel>Accepted Payment Methods</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {paymentMethodOptions.map((method) => (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name="payment_methods_room_handling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(method.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value ?? []), method.id]);
                                  } else {
                                    field.onChange(field.value?.filter((v) => v !== method.id));
                                  }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="final_invoice_handling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Invoice Handling</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deposit_invoice_responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Invoice Responsible</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="info_invoice_created"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Email when Invoice created?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional & Restrictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="restricted_dates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restricted Dates</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="handled_by_mice_desk"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Handled by MICE desk?</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

      <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={() => onPrevious(form.getValues())} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-1">
            {isSubmitting ? 'Saving...' : <>Next <ArrowRight className="h-4 w-4" /> </>}
        </Button>
      </div>
      </form>
    </Form>
  );
};

export default RoomHandlingForm;
