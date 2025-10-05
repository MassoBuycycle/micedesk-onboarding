import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
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
  { id: 'cash', label: 'Barzahlung' },
  { id: 'credit_card', label: 'Kreditkarte' },
  { id: 'debit_card', label: 'Debitkarte' },
  { id: 'bank_transfer', label: 'Banküberweisung' },
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
  group_handling_notes: z.string().optional(),
  breakfast_share: z.coerce.number().optional(),
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
  call_off_notes: z.string().optional(),
  commission_rules: z.string().optional(),
  free_spot_policy_leisure_groups: z.string().optional(),
  restricted_dates: z.string().optional(),
  handled_by_mice_desk: z.boolean().default(false),
  mice_desk_handling_scope: z.string().optional(),
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
  const { t } = useTranslation();

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
      group_handling_notes: '',
      breakfast_share: undefined,
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
      mice_desk_handling_scope: '',
      requires_deposit: false,
      deposit_rules: '',
      payment_methods_room_handling: [],
      final_invoice_handling: '',
      deposit_invoice_responsible: '',
      info_invoice_created: false,
      call_off_notes: '',
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
      toast.success('Operatives Handling erfasst.');
      onNext(data);
    } catch (error) {
      toast.error('Daten zum operativen Handling konnten nicht verarbeitet werden.');
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
            <CardDescription>Wer überwacht den Umsatz und wie wird die Nachfrage verfolgt?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="revenue_manager_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name Revenue Manager</FormLabel>
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
                    <FormLabel>Kontaktdaten</FormLabel>
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
                    <FormLabel>Demand-Kalender verfügbar?</FormLabel>
                    <FormDescription>Aktivieren, falls das Hotel einen Demand-Kalender bereitstellt.</FormDescription>
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
                    <FormLabel>Informationen zum Demand-Kalender</FormLabel>
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
                    <FormLabel>Regelmäßige Revenue Calls?</FormLabel>
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
                    <FormLabel>Informationen zu Revenue Calls</FormLabel>
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
            <CardTitle>Gruppenhandling & Raten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="group_request_min_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Zimmer für Gruppenanfrage</FormLabel>
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
                    <FormLabel>Standardkategorie Gruppenbuchung</FormLabel>
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
                  <FormLabel>Gibt es vordefinierte Gruppenraten?</FormLabel>
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
                  <FormLabel>Details zu Gruppenraten</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group_handling_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rooms.groupHandlingNotes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[100px]"
                      placeholder={t('rooms.groupHandlingNotesPlaceholder')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breakfast_share"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wie hoch ist der Frühstücksanteil in der Rate?</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="z.B. 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="first_second_option"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>1. & 2. Option anbieten?</FormLabel>
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
                  <FormLabel>Werden geteilte Optionen angeboten?</FormLabel>
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
                  <FormLabel>1. Optionsfrist</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 7 Tage" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Overbooking & Weekend Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Überbuchung & Aufenthaltsrichtlinien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="overbooking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Überbuchung erlaubt?</FormLabel>
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
                    <FormLabel>Informationen zur Überbuchung</FormLabel>
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
                  <FormLabel>Mindestaufenthalt an Wochenenden?</FormLabel>
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
                    <FormLabel>Informationen zum Wochenendaufenthalt</FormLabel>
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
            <CardTitle>Abruf & Kommission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="call_off_quota"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Werden Abrufkontingente angeboten?</FormLabel>
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
                    <FormLabel>Methode</FormLabel>
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
                    <FormLabel>Fristen</FormLabel>
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
                  <FormLabel>Kommissionsregeln</FormLabel>
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
                  <FormLabel>Freiplatzregelung (Leisure Groups)</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Additional note for call-off quotas */}
            <FormField
              control={form.control}
              name="call_off_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notiz zu Abrufkontingenten</FormLabel>
                  <FormDescription>Weitere Details zum Handling von Abrufkontingenten (optional)</FormDescription>
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
            <CardTitle>Deposit & Zahlung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="requires_deposit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Deposit erforderlich?</FormLabel>
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
                    <FormLabel>Deposit-Regelungen</FormLabel>
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
                  <FormLabel>Akzeptierte Zahlungsmethoden</FormLabel>
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
                    <FormLabel>Handling Abschlussrechnung</FormLabel>
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
                    <FormLabel>Verantwortlich für Depositrechnung</FormLabel>
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
                  <FormLabel>Wird eine Pro-Forma Rechnung versendet?</FormLabel>
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
            <CardTitle>Zusätzliches & Restriktionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="restricted_dates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sperrdaten</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Always show a simple note field instead of a toggle */}
            <FormField
              control={form.control}
              name="mice_desk_handling_scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rooms.miceDeskHandlingScope')}</FormLabel>
                  <FormDescription>
                    {t('rooms.miceDeskHandlingScopeDescription')}
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[100px]"
                      placeholder={t('rooms.miceDeskHandlingScopeDescription')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

      <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={() => onPrevious(form.getValues())} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-1">
            {isSubmitting ? 'Speichern...' : <>Weiter <ArrowRight className="h-4 w-4" /> </>}
        </Button>
      </div>
      </form>
    </Form>
  );
};

export default RoomHandlingForm;
