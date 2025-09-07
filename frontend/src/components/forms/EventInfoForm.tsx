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
  PhoneField
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
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().optional(),
  contact_position: z.string().optional(),
});

const bookingSchema = z.object({
  has_options: z.boolean().default(false),
  allows_split_options: z.boolean().default(false),
  option_duration: z.string().optional(),
  allows_overbooking: z.boolean().default(false),
  rooms_only: z.boolean().default(false),
  last_minute_leadtime: z.string().optional(),
  contracted_companies: z.string().optional(),
  refused_requests: z.string().optional(),
  unwanted_marketing: z.string().optional(),
  requires_second_signature: z.boolean().default(false),
  exclusive_clients: z.boolean().default(false),
});

const operationsSchema = z.object({
  has_overtime_material: z.boolean().default(false),
  sent_over_time_material: z.boolean().default(false),
  has_storage: z.boolean().default(false),
  sold_with_rooms_only: z.boolean().default(false),
  hotel_exclusive_clients: z.boolean().default(false),
  exclusive_clients_info: z.string().optional(),
  has_minimum_spent: z.boolean().default(false),
  minimum_spent_info: z.string().optional(),
  deposit_needed_event: z.boolean().default(false),
  informational_invoice_created: z.boolean().default(false),
  lunch_location: z.string().optional(),
  coffee_break_location: z.string().optional(),
  last_minute_lead_time: z.string().optional(),
  deposit_invoice_creator: z.string().optional(),
  min_participants_package: z.coerce.number().optional(),
  advance_days_for_material: z.coerce.number().optional(),
  room_drop_cost: z.coerce.number().optional(),
  deposit_rules_event: z.string().optional(),
  payment_methods_events: z.array(z.string()).default([]),
  final_invoice_handling_event: z.string().optional(),
});

const financialsSchema = z.object({
  requires_deposit: z.boolean().default(false),
  deposit_rules: z.string().optional(),
  deposit_invoicer: z.string().optional(),
  has_info_invoice: z.boolean().default(false),
  payment_methods: z.array(z.string()).default([]),
  invoice_handling: z.string().optional(),
  commission_rules: z.string().optional(),
  has_minimum_spent: z.boolean().default(false),
});

const equipmentSchema = z.array(
  z.object({
    name: z.string(),
    quantity: z.coerce.number().default(0),
    price: z.coerce.number().default(0),
  })
);

const technicalSchema = z.object({
  beamer_lumens: z.string().optional(),
  copy_cost: z.coerce.number().optional(),
  wifi_data_rate: z.string().optional(),
  software_presentation: z.string().optional(),
  has_ac_or_ventilation: z.boolean().default(false),
  has_blackout_curtains: z.boolean().default(false),
  is_soundproof: z.boolean().default(false),
  has_daylight: z.boolean().default(false),
  is_hybrid_meeting_possible: z.boolean().default(false),
  technical_support_available: z.boolean().default(false),
  technical_notes: z.string().optional(),
});

const contractingSchema = z.object({
  contracted_companies: z.string().optional(),
  refused_requests: z.string().optional(),
  unwanted_marketing_tools: z.string().optional(),
  first_second_option: z.boolean().default(false),
  split_options: z.boolean().default(false),
  option_hold_duration: z.string().optional(),
  overbooking_policy: z.boolean().default(false),
  deposit_required: z.boolean().default(false),
  accepted_payment_methods: z.string().optional(),
  commission_rules: z.string().optional(),
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
  // Debug log to see what data we're receiving
  console.log("EventInfoForm received initialData:", initialData);
  console.log("EventInfoForm mode:", mode);
  console.log("EventInfoForm createdEventId:", createdEventId);
  
  // Merge initialData with default values properly
  const defaultValues = {
    contact: {
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      contact_position: '',
      ...(initialData?.contact || {})
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
      ...(initialData?.booking || {})
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
      ...(initialData?.operations || {})
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
      ...(initialData?.financials || {})
    },
    equipment: initialData?.equipment && initialData.equipment.length > 0 
      ? initialData.equipment.map((item, index) => ({
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
      ...(initialData?.technical || {})
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
      accepted_payment_methods: '',
      commission_rules: '',
      second_signature_required: false,
      ...(initialData?.contracting || {})
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

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
    console.log("Skipping equipment fetch due to backend endpoint issues");
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
      console.error("Failed to get equipment:", error);
      return [];
    }
  };

  // Call to save equipment with correct field names
  const saveEventEquipment = async (eventId: number, equipmentItems: any[]) => {
    if (!equipmentItems || equipmentItems.length === 0) {
      console.log("⚠️ No equipment items to save");
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
        console.log("⚠️ No equipment items with non-zero values to save");
        return;
      }
      
      console.log("📤 Saving equipment data payload:", JSON.stringify(equipmentData, null, 2));
      // Use the API function
      const result = await upsertEquipment(eventId, equipmentData);
      console.log("✅ Equipment saved successfully! Response:", JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error("❌ Failed to save equipment:", error);
      console.error("Error details:", error.message || error);
      throw error;
    }
  };

  const submit = async (values: FormValues, e?: React.FormEvent) => {
    // Prevent default form behavior
    e?.preventDefault();
    
    try {
      const hotelId = selectedHotel?.id;
      
      if (!hotelId) {
        console.error("❌ Hotel ID is missing!");
        console.log("selectedHotel:", selectedHotel);
        toast.error("Hotel ID is required but not available. Please ensure a hotel is selected.");
        return;
      }
      
      console.log("✅ Using hotel ID:", hotelId);
      
      // If we're in edit mode and already have an event ID, don't create a new one
      if (mode === 'edit' && createdEventId) {
        console.log("⏳ In edit mode with existing event ID:", createdEventId);
        
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
        
        console.log("✅ Passing data to parent for saving");
        onNext(fullPayload);
        return;
      }
      
      // Only create a new event in add mode
      console.log("⏳ Starting direct event creation with hotel ID:", hotelId);
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
          console.log("Equipment data saved successfully");
        }
      } catch (equipError) {
        console.error("Failed to save equipment data:", equipError);
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
      
      console.log("✅ Moving to next step with complete data");
      toast.success("Event created successfully!");
      onNext(fullPayload);
    } catch (error) {
      console.error("❌ Submit failed:", error);
      toast.error(`Failed to create event: ${error.message}`);
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
            console.log("🔐 No authentication token found - skipping event data loading");
            return;
          }
          
          console.log("🔄 Starting to fetch all event data for event ID:", createdEventId);
          console.log("📊 Mode:", mode);
          console.log("📊 Has initial data:", hasInitialData);
          
          // Import all the GET functions we need
          const { 
            getEventById,
            getEventBooking, 
            getEventOperations, 
            getEventFinancials,
            getEventAvEquipment,
            getEventHandlingInfo
          } = await import('@/apiClient/eventsApi');
          
          // Fetch all event data in parallel
          console.log("📡 Fetching data from 5 endpoints in parallel...");
          const [mainData, bookingData, operationsData, financialsData, equipmentData] = await Promise.all([
            getEventById(createdEventId).catch(err=>{
              console.error("❌ Failed to fetch main event data:", err.message||err);
              return null;
            }),
            getEventBooking(createdEventId).catch(err => {
              console.error("❌ Failed to fetch booking data:", err.message || err);
              return null;
            }),
            getEventOperations(createdEventId).catch(err => {
              console.error("❌ Failed to fetch operations data:", err.message || err);
              return null;
            }),
            getEventFinancials(createdEventId).catch(err => {
              console.error("❌ Failed to fetch financials data:", err.message || err);
              return null;
            }),
            getEventAvEquipment(createdEventId).catch(err => {
              console.error("❌ Failed to fetch equipment data:", err.message || err);
              return [];
            })
          ]);
          
          // Update form with fetched data
          if (bookingData) {
            console.log("✅ Booking data fetched:", JSON.stringify(bookingData, null, 2));
            form.setValue("booking", bookingData);
          } else {
            console.log("⚠️ No booking data received");
          }
          
          if (operationsData) {
            console.log("✅ Operations data fetched:", JSON.stringify(operationsData, null, 2));
            // The API should return data in the correct format for EventOperationsInput
            form.setValue("operations", operationsData);
          } else {
            console.log("⚠️ No operations data received");
          }
          
          if (financialsData) {
            console.log("✅ Financials data fetched:", JSON.stringify(financialsData, null, 2));
            form.setValue("financials", financialsData);
          } else {
            console.log("⚠️ No financials data received");
          }
          
          if (equipmentData && equipmentData.length > 0) {
            console.log("✅ Equipment data fetched:", JSON.stringify(equipmentData, null, 2));
            // Map database items to form equipment
            equipmentData.forEach(item => {
              const index = DEFAULT_EQUIPMENT.findIndex(e => e.name === item.equipment_name);
              if (index >= 0) {
                form.setValue(`equipment.${index}.quantity`, item.quantity || 0);
                form.setValue(`equipment.${index}.price`, item.price_per_unit || 0);
              }
            });
          } else {
            console.log("⚠️ No equipment data received");
          }
          
          if(mainData){
            console.log("✅ Main event data fetched:", JSON.stringify(mainData,null,2));
            form.setValue("contact.contact_name", mainData.contact_name||"");
            form.setValue("contact.contact_phone", mainData.contact_phone||"");
            form.setValue("contact.contact_email", mainData.contact_email||"");
            form.setValue("contact.contact_position", mainData.contact_position||"");
          } else {
            console.log("⚠️ No main event data received");
          }
          
          // Technical and Contracting data would go here once the backend endpoints are implemented
          // For now, we'll skip them as they return 404
          console.log("⏭️ Skipping technical and contracting data (endpoints not implemented)");
          
          // Trigger form validation
          form.trigger();
          console.log("✅ Form data loaded and validation triggered");
          
        } catch (error: any) {
          // Check if it's an authentication error
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.log("🔐 Authentication required to fetch event data - skipping");
          } else {
            console.error('❌ Unexpected error fetching event data:', error);
          }
        }
      } else if (hasInitialData) {
        console.log("📦 Using initialData instead of fetching from API");
        console.log("📦 Initial data content:", JSON.stringify(initialData, null, 2));
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
            <TextareaField
              form={form}
              name="contracting.accepted_payment_methods"
              label={t('events.eventForm.contracting.acceptedPaymentMethods')}
              rows={2}
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
          <Button type="button" variant="outline" onClick={() => onPrevious(form.getValues() as unknown as EventInfoData)}><ArrowLeft className="h-4 w-4"/> Previous</Button>
          <Button 
            type="submit"
          >
            <ArrowRight className="h-4 w-4"/> Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventInfoForm; 