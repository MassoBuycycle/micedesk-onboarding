import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import {
  EventInput,
  EventBookingInput,
  EventOperationsInput,
  EventFinancialsInput,
  EventEquipmentInput,
  EventTechnicalInput,
  EventContractingInput,
} from '@/types/events';
import FormSection from '@/components/shared/FormSection';
import { 
  TextField, 
  NumberField, 
  TextareaField, 
  SwitchField, 
  TwoColumnGrid,
  PhoneField,
  PaymentMethodsField
} from '@/components/shared/FormFields';
import { API_BASE_URL } from '@/apiClient/config';
import { createEvent as apiCreateEvent, upsertEquipment } from '@/apiClient/eventsApi';
import { getAuthToken } from "@/apiClient/authApi";
import { mapEventFormToApi } from '@/utils/eventMapping';
import { useTranslation } from 'react-i18next';

export interface EventEquipmentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface EventInfoData {
  contact: {
    hotel_id: number;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_position?: string;
  };
  booking: EventBookingInput;
  operations: EventOperationsInput;
  financials: EventFinancialsInput;
  equipment: EventEquipmentItem[];
  technical: EventTechnicalInput;
  contracting: EventContractingInput;
}

interface EventInfoFormProps {
  selectedHotel: any;
  initialData?: Partial<EventInfoData>;
  createdEventId?: number | null;
  onNext: (data: EventInfoData) => void;
  onPrevious: (data: EventInfoData) => void;
  onChange?: (data: Partial<EventInfoData>) => void;
  mode?: 'add' | 'edit';
}

// Zod schema for validation (basic, mostly optional)
const contactSchema = z.object({
  contact_name: z.string().nullable().optional().or(z.literal('')),
  contact_phone: z.string().nullable().optional().or(z.literal('')),
  contact_email: z.string().nullable().optional().or(z.literal('')),
  contact_position: z.string().nullable().optional().or(z.literal('')),
});

const bookingSchema = z.object({
  has_options: z.boolean().default(false),
  allows_split_options: z.boolean().default(false),
  option_duration: z.string().nullable().optional().or(z.literal('')),
  allows_overbooking: z.boolean().default(false),
  rooms_only: z.boolean().default(false),
  last_minute_leadtime: z.string().nullable().optional().or(z.literal('')),
  contracted_companies: z.string().nullable().optional().or(z.literal('')),
  refused_requests: z.string().nullable().optional().or(z.literal('')),
  unwanted_marketing: z.string().nullable().optional().or(z.literal('')),
  requires_second_signature: z.boolean().default(false),
  exclusive_clients: z.boolean().default(false),
});

const operationsSchema = z.object({
  has_overtime_material: z.boolean().default(false),
  sent_over_time_material: z.boolean().default(false),
  has_storage: z.boolean().default(false),
  sold_with_rooms_only: z.boolean().default(false),
  hotel_exclusive_clients: z.boolean().default(false),
  exclusive_clients_info: z.string().nullable().optional().or(z.literal('')),
  has_minimum_spent: z.boolean().default(false),
  minimum_spent_info: z.string().nullable().optional().or(z.literal('')),
  deposit_needed_event: z.boolean().default(false),
  informational_invoice_created: z.boolean().default(false),
  lunch_location: z.string().nullable().optional().or(z.literal('')),
  coffee_break_location: z.string().nullable().optional().or(z.literal('')),
  last_minute_lead_time: z.string().nullable().optional().or(z.literal('')),
  deposit_invoice_creator: z.string().nullable().optional().or(z.literal('')),
  min_participants_package: z.coerce.number().nullable().optional(),
  advance_days_for_material: z.coerce.number().nullable().optional(),
  room_drop_cost: z.coerce.number().nullable().optional(),
  deposit_rules_event: z.string().nullable().optional().or(z.literal('')),
  payment_methods_events: z.array(z.string()).default([]),
  final_invoice_handling_event: z.string().nullable().optional().or(z.literal('')),
  // Storage handling
  storage_free_of_charge: z.boolean().default(false),
  storage_pricing_info: z.string().nullable().optional().or(z.literal('')),
});

const financialsSchema = z.object({
  requires_deposit: z.boolean().default(false),
  deposit_rules: z.string().nullable().optional().or(z.literal('')),
  deposit_invoicer: z.string().nullable().optional().or(z.literal('')),
  has_info_invoice: z.boolean().default(false),
  payment_methods: z.array(z.string()).default([]),
  invoice_handling: z.string().nullable().optional().or(z.literal('')),
  commission_rules: z.string().nullable().optional().or(z.literal('')),
  has_minimum_spent: z.boolean().default(false),
});

const equipmentSchema = z.array(
  z.object({
    name: z.string().nullable().optional().or(z.literal('')),
    quantity: z.coerce.number().nullable().default(0),
    price: z.coerce.number().nullable().default(0),
  })
);

const technicalSchema = z.object({
  beamer_lumens: z.string().nullable().optional().or(z.literal('')),
  copy_cost: z.coerce.number().nullable().optional(),
  wifi_data_rate: z.string().nullable().optional().or(z.literal('')),
  software_presentation: z.string().nullable().optional().or(z.literal('')),
  has_ac_or_ventilation: z.boolean().default(false),
  has_blackout_curtains: z.boolean().default(false),
  is_soundproof: z.boolean().default(false),
  has_daylight: z.boolean().default(false),
  is_hybrid_meeting_possible: z.boolean().default(false),
  technical_support_available: z.boolean().default(false),
  technical_notes: z.string().nullable().optional().or(z.literal('')),
});

const contractingSchema = z.object({
  contracted_companies: z.string().nullable().optional().or(z.literal('')),
  refused_requests: z.string().nullable().optional().or(z.literal('')),
  unwanted_marketing_tools: z.string().nullable().optional().or(z.literal('')),
  first_second_option: z.boolean().default(false),
  split_options: z.boolean().default(false),
  option_hold_duration: z.string().nullable().optional().or(z.literal('')),
  overbooking_policy: z.boolean().default(false),
  deposit_required: z.boolean().default(false),
  accepted_payment_methods: z.array(z.string()).default([]),
  commission_rules: z.string().nullable().optional().or(z.literal('')),
  second_signature_required: z.boolean().default(false),
});

const formSchema = z.object({
  contact: contactSchema,
  booking: bookingSchema,
  operations: operationsSchema,
  financials: financialsSchema,
  equipment: equipmentSchema,
  technical: technicalSchema,
  contracting: contractingSchema,
});

type FormValues = z.infer<typeof formSchema>;

// Define default equipment list
const DEFAULT_EQUIPMENT = [
  { name: "Beamer", id: "beamer" },
  { name: "Screen", id: "screen" },
  { name: "Moderationskoffer", id: "moderationskoffer" },
  { name: "Flipchart", id: "flipchart" },
  { name: "Pinwand", id: "pinwand" },
  { name: "Rednerpult", id: "rednerpult" },
  { name: "Soundsystem", id: "soundsystem" },
  { name: "Bühne", id: "buhne" },
  { name: "Microphone", id: "microphone" },
  { name: "Dancefloor", id: "dancefloor" },
];

const EventInfoForm: React.FC<EventInfoFormProps> = ({ selectedHotel, initialData = {}, createdEventId, onNext, onPrevious, onChange, mode }) => {
  // i18n translation hook
  const { t } = useTranslation();
  
  // Loading state to prevent double submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debug log to see what data we're receiving
  
  // Helper to build defaults merged with incoming initialData
  const buildDefaults = (data?: Partial<EventInfoData>) => ({
    contact: {
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      contact_position: '',
      ...(data?.contact || {})
    },
    booking: {
      has_options: false,
      allows_split_options: false,
      option_duration: '',
      allows_overbooking: false,
      rooms_only: false,
      last_minute_leadtime: '',
      contracted_companies: '',
      refused_requests: '',
      unwanted_marketing: '',
      requires_second_signature: false,
      exclusive_clients: false,
      ...(data?.booking || {})
    },
    operations: {
      has_overtime_material: false,
      sent_over_time_material: false,
      has_storage: false,
      sold_with_rooms_only: false,
      hotel_exclusive_clients: false,
      exclusive_clients_info: '',
      has_minimum_spent: false,
      minimum_spent_info: '',
      deposit_needed_event: false,
      informational_invoice_created: false,
      lunch_location: '',
      coffee_break_location: '',
      last_minute_lead_time: '',
      deposit_invoice_creator: '',
      min_participants_package: undefined,
      advance_days_for_material: undefined,
      room_drop_cost: undefined,
      deposit_rules_event: '',
      payment_methods_events: [],
      final_invoice_handling_event: '',
      ...(data?.operations || {})
    },
    financials: {
      requires_deposit: false,
      deposit_rules: '',
      deposit_invoicer: '',
      has_info_invoice: false,
      payment_methods: [],
      invoice_handling: '',
      commission_rules: '',
      has_minimum_spent: false,
      ...(data?.financials || {})
    },
    equipment: data?.equipment && data.equipment.length > 0 
      ? data.equipment.map((item, index) => ({
          name: DEFAULT_EQUIPMENT[index]?.name || item.name || "",
          quantity: item.quantity || 0,
          price: item.price || 0
        }))
      : DEFAULT_EQUIPMENT.map(item => ({
          name: item.name,
          quantity: 0,
          price: 0
        })),
    technical: {
      beamer_lumens: '',
      copy_cost: undefined,
      wifi_data_rate: '',
      software_presentation: '',
      has_ac_or_ventilation: false,
      has_blackout_curtains: false,
      is_soundproof: false,
      has_daylight: false,
      is_hybrid_meeting_possible: false,
      technical_support_available: false,
      technical_notes: '',
      ...(data?.technical || {})
    },
    contracting: {
      contracted_companies: '',
      refused_requests: '',
      unwanted_marketing_tools: '',
      first_second_option: false,
      split_options: false,
      option_hold_duration: '',
      overbooking_policy: false,
      deposit_required: false,
      commission_rules: '',
      second_signature_required: false,
      ...(data?.contracting || {}),
      // Convert string to array if needed (backward compatibility)
      accepted_payment_methods: data?.contracting?.accepted_payment_methods 
        ? (Array.isArray(data.contracting.accepted_payment_methods) 
            ? data.contracting.accepted_payment_methods 
            : [])
        : []
    }
  });

  // Merge initialData with default values properly
  const defaultValues = buildDefaults(initialData);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  // Keep form values in sync when initialData updates (edit mode load)
  useEffect(() => {
    form.reset(buildDefaults(initialData));
  }, [initialData]);

  const { fields: equipFields, append: addEquip, remove: removeEquip } = useFieldArray({
    control: form.control,
    name: 'equipment',
  });

  // Live preview
  useEffect(() => {
    if (onChange) {
      const sub = form.watch((v) => onChange(v as Partial<EventInfoData>));
      return () => sub.unsubscribe();
    }
  }, [form, onChange]);

  useEffect(() => {
    // Skip equipment fetching since the endpoint doesn't work
  }, [form]);

  // Mapping helper will build the flattened payload for backend
  const buildEventPayload = (): Record<string, any> => {
    const values = form.getValues();
    const hotelId = selectedHotel?.id;
    
    if (!hotelId) {
      throw new Error("Hotel ID is required but not provided");
    }
    
    const fullData: EventInfoData = {
      contact: {
        hotel_id: hotelId,
        ...values.contact,
      },
      booking: values.booking,
      operations: values.operations,
      financials: values.financials,
      equipment: values.equipment as any,
      technical: values.technical,
      contracting: values.contracting,
    } as EventInfoData;
    return mapEventFormToApi(fullData);
  };

  // Get equipment - this endpoint doesn't work correctly, so we'll skip it
  const getEquipment = async (eventId) => {
    try {
      // Use the proper API client instead of direct fetch
      const { getEventAvEquipment } = await import('@/apiClient/eventsApi');
      const data = await getEventAvEquipment(eventId);
      
      // Map API data to our expected format
      return data.map(item => ({
        name: item.equipment_name || "", // Using correct field name
        quantity: item.quantity || 0,
        price: item.price_per_unit || 0
      }));
    } catch (error) {
      return [];
    }
  };

  // Call to save equipment with correct field names
  const saveEventEquipment = async (eventId: number, equipmentItems: any[]) => {
    if (!equipmentItems || equipmentItems.length === 0) {
      return;
    }
    
    try {
      // Map to the correct field names expected by the backend
      const equipmentData = equipmentItems
        .filter(item => item.quantity > 0 || item.price > 0) // Only send non-zero items
        .map(item => ({
          equipment_name: item.name || "", // Use equipment_name as expected by EventEquipmentInput
          quantity: item.quantity || 0,
          price: item.price || 0
        }));
      
      if (equipmentData.length === 0) {
        return;
      }
      
      // Use the API function
      const result = await upsertEquipment(eventId, equipmentData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const submit = async (values: FormValues, e?: React.FormEvent) => {
    // Prevent default form behavior
    e?.preventDefault();
    
    // Prevent double submissions
    if (isSubmitting) {
      toast.warning("Please wait, your request is being processed...");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const hotelId = selectedHotel?.id;
      
      if (!hotelId) {
        toast.error("Hotel ID is required but not available. Please ensure a hotel is selected.");
        setIsSubmitting(false);
        return;
      }
      
      
      // If we're in edit mode and already have an event ID, don't create a new one
      if (mode === 'edit' && createdEventId) {
        
        // Create the full payload for onNext
        const fullPayload: EventInfoData = {
          contact: { 
            hotel_id: hotelId,
            contact_name: values.contact.contact_name,
            contact_phone: values.contact.contact_phone,
            contact_email: values.contact.contact_email,
            contact_position: values.contact.contact_position
          },
          booking: values.booking || {},
          operations: values.operations || {},
          financials: values.financials || {},
          equipment: values.equipment.map(item => ({
            name: item.name || "",
            quantity: item.quantity || 0,
            price: item.price || 0
          })),
          technical: values.technical || {},
          contracting: values.contracting || {},
        };
        
        onNext(fullPayload);
        return;
      }
      
      // Only create a new event in add mode
      toast.info("Creating event...");
      
      // Step 1: Create the event with full payload
      const eventPayload = buildEventPayload();
      const createRes = await apiCreateEvent(eventPayload as any);
      const eventId = createRes.eventId;
      toast.success(`Event created! ID: ${eventId}`);
      
      // Step 2: Try to save equipment data if available
      try {
        if (values.equipment && values.equipment.some(item => item.quantity > 0 || item.price > 0)) {
          await saveEventEquipment(eventId, values.equipment);
        }
      } catch (equipError) {
        toast.warning("Could not save equipment data, but continuing to next step");
      }
      
      // Create the full payload for onNext
      const fullPayload: EventInfoData = {
        contact: { 
          hotel_id: hotelId,
          contact_name: values.contact.contact_name,
          contact_phone: values.contact.contact_phone,
          contact_email: values.contact.contact_email,
          contact_position: values.contact.contact_position
        },
        booking: values.booking || {},
        operations: values.operations || {},
        financials: values.financials || {},
        equipment: values.equipment.map(item => ({
          name: item.name || "",
          quantity: item.quantity || 0,
          price: item.price || 0
        })),
        technical: values.technical || {},
        contracting: values.contracting || {},
      };
      
      toast.success("Event created successfully!");
      onNext(fullPayload);
    } catch (error) {
      // Handle duplicate event error specifically
      if (error.response?.data?.code === 'DUPLICATE_EVENT_DETECTED') {
        toast.error("This event was just created. Please wait a moment before creating another event for this hotel.");
      } else {
        toast.error(`Failed to create event: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Fetch all event data if in edit mode and we have an event ID
    const fetchEventData = async () => {
      // Only fetch from API if we don't have initialData (to avoid overwriting user changes)
      const hasInitialData = initialData && (
        (initialData.contact && Object.keys(initialData.contact).length > 1) || // More than just hotel_id
        (initialData.booking && Object.keys(initialData.booking).length > 0) ||
        (initialData.operations && Object.keys(initialData.operations).length > 0) ||
        (initialData.financials && Object.keys(initialData.financials).length > 0) ||
        (initialData.equipment && initialData.equipment.length > 0)
      );
      
      if (mode === 'edit' && createdEventId && !hasInitialData) {
        try {
          // Check if user is authenticated
          const authToken = getAuthToken();
          if (!authToken) {
            return;
          }
          
          
          // Import all the GET functions we need
          const { 
            getEventById,
            getEventBooking, 
            getEventOperations, 
            getEventFinancials,
            getEventAvEquipment,
            getEventTechnicalInfo,
            getEventContractingInfo
          } = await import('@/apiClient/eventsApi');
          
          // Fetch all event data in parallel
          const [mainData, bookingData, operationsData, financialsData, equipmentData, technicalData, contractingData] = await Promise.all([
            getEventById(createdEventId).catch(err=>{
              return null;
            }),
            getEventBooking(createdEventId).catch(err => {
              return null;
            }),
            getEventOperations(createdEventId).catch(err => {
              return null;
            }),
            getEventFinancials(createdEventId).catch(err => {
              return null;
            }),
            getEventAvEquipment(createdEventId).catch(err => {
              return [];
            }),
            getEventTechnicalInfo(createdEventId).catch(err => {
              return null;
            }),
            getEventContractingInfo(createdEventId).catch(err => {
              return null;
            })
          ]);
          
          // Update form with fetched data
          if (bookingData) {
            form.setValue("booking", bookingData);
          } else {
          }
          
          if (operationsData) {
            // The API should return data in the correct format for EventOperationsInput
            form.setValue("operations", operationsData);
          } else {
          }
          
          if (financialsData) {
            form.setValue("financials", financialsData);
          } else {
          }
          
          if (equipmentData && equipmentData.length > 0) {
            // Map database items to form equipment
            equipmentData.forEach(item => {
              const index = DEFAULT_EQUIPMENT.findIndex(e => e.name === item.equipment_name);
              if (index >= 0) {
                form.setValue(`equipment.${index}.quantity`, item.quantity || 0);
                form.setValue(`equipment.${index}.price`, item.price_per_unit || 0);
              }
            });
          } else {
          }
          
          if(mainData){
            form.setValue("contact.contact_name", mainData.contact_name||"");
            form.setValue("contact.contact_phone", mainData.contact_phone||"");
            form.setValue("contact.contact_email", mainData.contact_email||"");
            form.setValue("contact.contact_position", mainData.contact_position||"");
          } else {
          }
          // Technical
          if (technicalData) {
            // Cast numeric booleans if any
            const cast = (v: any) => (typeof v === 'number' ? Boolean(v) : v);
            const tech = { ...technicalData } as any;
            [
              'has_ac_or_ventilation','has_blackout_curtains','is_soundproof','has_daylight',
              'is_hybrid_meeting_possible','technical_support_available'
            ].forEach(k => { if (tech[k] !== undefined) tech[k] = cast(tech[k]); });
            form.setValue('technical', tech);
          }

          // Contracting
          if (contractingData) {
            const cast = (v: any) => (typeof v === 'number' ? Boolean(v) : v);
            const c = { ...contractingData } as any;
            [
              'first_second_option','split_options','overbooking_policy','deposit_required','second_signature_required'
            ].forEach(k => { if (c[k] !== undefined) c[k] = cast(c[k]); });
            form.setValue('contracting', c);
          }
          
          // Trigger form validation
          form.trigger();
          
        } catch (error: any) {
          // Check if it's an authentication error
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          } else {
          }
        }
      } else if (hasInitialData) {
      }
    };
    
    fetchEventData();
  }, [mode, createdEventId, form, initialData]);

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault(); // Prevent form submission
        const values = form.getValues();
        submit(values, e);
      }} className="space-y-6">
        {/* 1. CONTACT DETAILS - Kontaktdetails */}
        <FormSection 
          title={t('events.eventForm.contact.sectionTitle')} 
          description=""
        >
          <TwoColumnGrid>
            <TextField
              form={form}
              name="contact.contact_name"
              label={t('events.eventForm.contact.name')}
            />
            <TextField
              form={form}
              name="contact.contact_position"
              label={t('events.eventForm.contact.position')}
            />
            <PhoneField
              form={form}
              name="contact.contact_phone"
              label={t('events.eventForm.contact.phone')}
            />
            <TextField
              form={form}
              name="contact.contact_email"
              label={t('events.eventForm.contact.email')}
              type="email"
            />
          </TwoColumnGrid>
        </FormSection>

        {/* 2. GENERAL INFORMATION EVENT SPACES */}
        <FormSection 
          title={t('events.eventForm.general.sectionTitle')} 
          description=""
        >
          <SwitchField
            form={form}
            name="operations.sold_with_rooms_only"
            label={t('events.eventForm.operations.soldWithRoomsOnly')}
          />
        </FormSection>

        {/* 3. LOCATION QUESTIONS */}
        <FormSection 
          title={t('events.eventForm.locations.sectionTitle')} 
          description=""
        >
          <TwoColumnGrid>
            <TextField
              form={form}
              name="operations.coffee_break_location"
              label={t('events.eventForm.operations.coffeeBreakLocation')}
            />
            <TextField
              form={form}
              name="operations.lunch_location"
              label={t('events.eventForm.operations.lunchLocation')}
            />
          </TwoColumnGrid>
        </FormSection>

        {/* 4. TECHNOLOGY / SERVICE AND PRICES - Technik/ Service und Preise */}
        <FormSection 
          title={t('events.eventForm.technical.sectionTitle')} 
          description=""
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SwitchField
              form={form}
              name="technical.is_soundproof"
              label={t('events.eventForm.technical.isSoundproof')}
            />
            <SwitchField
              form={form}
              name="technical.has_daylight"
              label={t('events.eventForm.technical.hasDaylight')}
            />
            <SwitchField
              form={form}
              name="technical.has_blackout_curtains"
              label={t('events.eventForm.technical.hasBlackoutCurtains')}
            />
            <SwitchField
              form={form}
              name="technical.has_ac_or_ventilation"
              label={t('events.eventForm.technical.hasAcOrVentilation')}
            />
            <SwitchField
              form={form}
              name="technical.is_hybrid_meeting_possible"
              label={t('events.eventForm.technical.isHybridMeetingPossible')}
            />
            <SwitchField
              form={form}
              name="technical.technical_support_available"
              label={t('events.eventForm.technical.technicalSupportAvailable')}
            />
          </div>
          
          <TwoColumnGrid>
            <TextField
              form={form}
              name="technical.wifi_data_rate"
              label={t('events.eventForm.technical.wifiDataRate')}
            />
            <TextField
              form={form}
              name="technical.beamer_lumens"
              label={t('events.eventForm.technical.beamerLumens')}
            />
            <TextField
              form={form}
              name="technical.software_presentation"
              label={t('events.eventForm.technical.softwarePresentation')}
            />
            <NumberField
              form={form}
              name="technical.copy_cost"
              label={t('events.eventForm.technical.copyCost')}
              step="0.01"
            />
          </TwoColumnGrid>
          
          <TextareaField
            form={form}
            name="technical.technical_notes"
            label="Notizfeld"
            rows={4}
            placeholder="Zusätzliche Notizen zu Technik/Service..."
          />
        </FormSection>

        {/* 5. TECHNICAL EQUIPMENT SECTION */}
        <FormSection 
          title={t('events.eventForm.equipment.sectionTitle')} 
          description=""
        >
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-sm font-medium">Equipment</div>
            <div className="text-sm font-medium">Amount</div>
            <div className="text-sm font-medium">Price per unit</div>
          </div>
          
          {DEFAULT_EQUIPMENT.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-3 gap-2 mb-3">
              <Input className="bg-gray-50" value={item.name} readOnly />
              <NumberField
                form={form}
                name={`equipment.${idx}.quantity`}
                label=""
                placeholder={t('events.eventForm.equipment.quantity')}
              />
              <NumberField
                form={form}
                name={`equipment.${idx}.price`}
                label=""
                placeholder={t('events.eventForm.equipment.pricePerUnit')}
                step="0.01"
              />
            </div>
          ))}
        </FormSection>

        {/* 6. OPERATIONAL HANDLING */}
        <FormSection 
          title={t('events.eventForm.operations.sectionTitle')} 
          description=""
        >
          <div className="space-y-6">
            {/* 1. Ab wieviele Personen werden Pauschalen angeboten? */}
            <NumberField
              form={form}
              name="operations.min_participants_package"
              label={t('events.eventForm.operations.minParticipantsPackage')}
            />
            
            {/* 2. Arbeiten Sie mit einem Mindestumsatz (ja/nein) plus Notizfeld */}
            <div className="space-y-4">
              <SwitchField
                form={form}
                name="operations.has_minimum_spent"
                label={t('events.eventForm.operations.hasMinimumSpent')}
              />
              {form.watch("operations.has_minimum_spent") && (
                <TextareaField
                  form={form}
                  name="operations.minimum_spent_info"
                  label="Details zum Mindestumsatz"
                  rows={3}
                  placeholder="Bitte geben Sie Details zum Mindestumsatz an..."
                />
              )}
            </div>
            
            {/* 3. Wie viel Vorlaufzeit ist für Last-Minute-Anfragen benötigt? */}
            <TextField
              form={form}
              name="operations.last_minute_lead_time"
              label={t('events.eventForm.operations.lastMinuteLeadTime')}
            />
            
            {/* 4. Verfügen Sie einen Lagerraum für Pakete und Materialien? */}
            <SwitchField
              form={form}
              name="operations.has_storage"
              label={t('events.eventForm.operations.hasStorage')}
            />
            
            {/* 5. Wie viele Tage im Voraus kann der Gast die Materialien für seine Veranstaltung senden? */}
            {/* Wunsch: Freitext (z. B. "7-10" oder Hinweise), nicht nur Zahl */}
            <TextField
              form={form}
              name="operations.advance_days_for_material"
              label={t('events.eventForm.operations.materialAdvanceDays')}
            />
            
            {/* 6. Kosten für Room Drop */}
            <NumberField
              form={form}
              name="operations.room_drop_cost"
              label={t('events.eventForm.operations.roomDropCost')}
              step="0.01"
            />
          </div>
        </FormSection>

        {/* 7. CONTRACTING */}
        <FormSection 
          title={t('events.eventForm.contracting.sectionTitle')} 
          description=""
        >
          <div className="space-y-6">
            {/* Einlagerung kostenfrei? Wenn Nein, Preise angeben */}
            <SwitchField
              form={form}
              name="operations.storage_free_of_charge"
              label={t('events.eventForm.operations.storageFreeOfCharge')}
            />
            {!form.watch('operations.storage_free_of_charge') && (
              <TextareaField
                form={form}
                name="operations.storage_pricing_info"
                label={t('events.eventForm.operations.storagePricingInfo')}
                rows={3}
                placeholder={t('events.eventForm.operations.storagePricingInfoPlaceholder')}
              />
            )}
            {/* Wird bei allen VA's ein Depo verlangt */}
            <SwitchField
              form={form}
              name="operations.deposit_needed_event"
              label={t('events.eventForm.operations.depositNeeded')}
            />
            
            {/* Depositregelungen */}
            <TextareaField
              form={form}
              name="operations.deposit_rules_event"
              label={t('events.eventForm.operations.depositRules')}
              rows={3}
            />
            
            {/* Wer erstellt die Depo- Rechnung */}
            <TextField
              form={form}
              name="operations.deposit_invoice_creator"
              label={t('events.eventForm.operations.depositInvoiceCreator')}
            />
            
            {/* Akzeptierte Zahlungsmethoden */}
            <PaymentMethodsField
              form={form}
              name="contracting.accepted_payment_methods"
              label={t('events.eventForm.contracting.acceptedPaymentMethods')}
              t={t}
            />
            
            {/* Wird eine Info-Rechnung an den Kunden versandt */}
            <SwitchField
              form={form}
              name="operations.informational_invoice_created"
              label={t('events.eventForm.operations.informationalInvoiceCreated')}
            />
            
            {/* Handling Abschluss-Rechnung */}
            <TextareaField
              form={form}
              name="operations.final_invoice_handling_event"
              label={t('events.eventForm.operations.finalInvoiceHandling')}
              rows={3}
            />
            
            {/* Kommissionsregelung */}
            <TextareaField
              form={form}
              name="contracting.commission_rules"
              label={t('events.eventForm.contracting.commissionRules')}
              rows={3}
            />
            
            {/* Gibt es Kunden, welche ausschließlich durch das Hotel betreut werden */}
            <div className="space-y-4">
              <SwitchField
                form={form}
                name="operations.hotel_exclusive_clients"
                label={t('events.eventForm.operations.hotelExclusiveClients')}
              />
              {form.watch("operations.hotel_exclusive_clients") && (
                <TextareaField
                  form={form}
                  name="operations.exclusive_clients_info"
                  label="Details zu exklusiven Kunden"
                  rows={3}
                  placeholder="Bitte geben Sie Details zu den exklusiven Kunden an..."
                />
              )}
            </div>

            <div className="pt-6 space-y-4">
              <h4 className="text-lg font-medium">Weitere Vertragsdetails</h4>
              
              <TextareaField
                form={form}
                name="contracting.contracted_companies"
                label={t('events.eventForm.contracting.contractedCompanies')}
                rows={2}
              />
              <TextareaField
                form={form}
                name="contracting.refused_requests"
                label={t('events.eventForm.contracting.refusedRequests')}
                rows={2}
              />
              <TextareaField
                form={form}
                name="contracting.unwanted_marketing_tools"
                label={t('events.eventForm.contracting.unwantedMarketingTools')}
                rows={2}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SwitchField
                  form={form}
                  name="contracting.first_second_option"
                  label={t('events.eventForm.contracting.firstSecondOption')}
                />
                <SwitchField
                  form={form}
                  name="contracting.split_options"
                  label={t('events.eventForm.contracting.splitOptions')}
                />
                <SwitchField
                  form={form}
                  name="contracting.overbooking_policy"
                  label={t('events.eventForm.contracting.overbookingPolicy')}
                />
                <SwitchField
                  form={form}
                  name="contracting.second_signature_required"
                  label={t('events.eventForm.contracting.secondSignatureRequired')}
                />
              </div>
              
              <TextField
                form={form}
                name="contracting.option_hold_duration"
                label={t('events.eventForm.contracting.optionHoldDuration')}
              />
            </div>
          </div>
        </FormSection>

        {/* NAV BUTTONS */}
        <div className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onPrevious(form.getValues() as unknown as EventInfoData)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4"/> Previous
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4"/> Next
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventInfoForm; 