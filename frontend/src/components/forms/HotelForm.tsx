import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
// import { UploadedFile } from "./FileUpload"; // Remove old import
// import { createOrUpdateHotel } from "@/services/api"; // REMOVED: Old API import
// import axios from "axios";
// import { API_BASE_URL } from "@/apiClient/config";
// import { getAuthHeaders } from "@/apiClient/apiClient";

// Import the section components
import BasicInfoSection from "./hotel-sections/BasicInfoSection";
import BillingInfoSection from "./hotel-sections/BillingInfoSection";
import HotelDetailsSection from "./hotel-sections/HotelDetailsSection";
import LocationDistanceSection from "./hotel-sections/LocationDistanceSection";
// import ImagesDocumentsSection from "./hotel-sections/ImagesDocumentsSection"; // Replace with new component
import AdditionalInfoSection from "./hotel-sections/AdditionalInfoSection";
import FacilitiesSection from "./hotel-sections/FacilitiesSection";
import GeneralManagerSection from "./hotel-sections/GeneralManagerSection";

// Define schema for form validation
const createHotelFormSchema = (t: any) => z.object({
  // ID (optional, for existing hotels)
  id: z.number().optional(),
  
  // External System Hotel ID (required for information policies)
  systemHotelId: z.string().min(1, { message: t("forms.validation.systemHotelIdRequired") }),
  
  // Basic Information
  name: z.string().min(2, { message: t("forms.validation.hotelNameRequired") }),
  street: z.string().min(3, { message: t("forms.validation.streetRequired") }),
  postalCode: z.string().min(1, { message: t("forms.validation.postalCodeRequired") }),
  city: z.string().min(1, { message: t("forms.validation.cityRequired") }),
  country: z.string().min(1, { message: t("forms.validation.countryRequired") }),
  phone: z.string().optional().or(z.literal('')),
  generalManagerName: z.string().optional().or(z.literal('')),
  generalManagerPhone: z.string().optional().or(z.literal('')),
  generalManagerEmail: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: t("forms.validation.emailRequired") }),
  website: z.string().url({ message: t("forms.validation.websiteRequired") }).optional().or(z.literal('')),
  description: z.string().optional(),
  
  // Billing Address
  billingAddressName: z.string().min(2, { message: t("forms.validation.billingNameRequired") }),
  billingAddressStreet: z.string().min(3, { message: t("forms.validation.billingStreetRequired") }),
  billingAddressZip: z.string().min(1, { message: t("forms.validation.billingZipRequired") }),
  billingAddressCity: z.string().min(1, { message: t("forms.validation.billingCityRequired") }),
  billingAddressVat: z.string().optional().or(z.literal('')),
  
  // General Information
  starRating: z.coerce.number().optional(),
  category: z.string(),
  openingDate: z.coerce.number().optional(),
  latestRenovationDate: z.coerce.number().optional(),
  totalRooms: z.coerce.number().optional(),
  conferenceRooms: z.coerce.number().optional(),
  pmsSystem: z.string().optional(),
  
  // Location & Distances
  distanceToAirportKm: z.coerce.number().optional(),
  distanceToHighwayKm: z.coerce.number().optional(),
  distanceToFairKm: z.coerce.number().optional(),
  distanceToTrainStation: z.coerce.number().optional(),
  distanceToPublicTransport: z.coerce.number().optional(),
  
  // Additional Information
  plannedChanges: z.string().optional(),
  attractionInTheArea: z.string().optional(),
  externalBillingId: z.string().optional().or(z.literal('')),
  
  // Parking Information
  noOfParkingSpaces: z.coerce.number().optional(),
  noOfParkingSpacesGarage: z.coerce.number().optional(),
  noOfParkingSpacesElectric: z.coerce.number().optional(),
  noOfParkingSpacesBus: z.coerce.number().optional(),
  noOfParkingSpacesOutside: z.coerce.number().optional(),
  noOfParkingSpacesDisabled: z.coerce.number().optional(),
  parkingCostPerHour: z.coerce.number().optional(),
  parkingCostPerDay: z.coerce.number().optional(),
  parkingRemarks: z.string().optional().or(z.literal('')),

  // Specific Facilities
  openingTimePool: z.string().optional().or(z.literal('')),
  openingTimeFitnessCenter: z.string().optional().or(z.literal('')),
  equipmentFitnessCenter: z.string().optional().or(z.literal('')),
  openingTimeSpaArea: z.string().optional().or(z.literal('')),
  equipmentSpaArea: z.string().optional().or(z.literal('')),
  
  // Additional Links
  additionalLinks: z.array(z.object({
    name: z.string().optional(),
    link: z.string().optional()
  })).optional(),
});

export type HotelFormValues = z.infer<ReturnType<typeof createHotelFormSchema>>;

interface HotelFormProps {
  initialData?: Partial<HotelFormValues>;
  onNext: (data: HotelFormValues) => void;
  onChange?: (data: Partial<HotelFormValues>) => void;
  mode?: 'add' | 'edit';
}

const HotelForm = ({ initialData = {}, onNext, onChange, mode = 'add' }: HotelFormProps) => {
  const { t } = useTranslation();
  
  // State to track if the form has been successfully submitted
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hotelFormSchema = createHotelFormSchema(t);

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      id: undefined,
      systemHotelId: "",
      name: "",
      street: "",
      postalCode: "",
      city: "",
      country: "Germany",
      phone: "",
      generalManagerName: "",
      generalManagerPhone: "",
      generalManagerEmail: "",
      email: "",
      website: "",
      billingAddressName: "",
      billingAddressStreet: "",
      billingAddressZip: "",
      billingAddressCity: "",
      billingAddressVat: "",
      starRating: undefined,
      category: "",
      openingDate: undefined,
      latestRenovationDate: undefined,
      distanceToAirportKm: undefined,
      distanceToHighwayKm: undefined,
      distanceToFairKm: undefined,
      distanceToTrainStation: undefined,
      distanceToPublicTransport: undefined,
      plannedChanges: "",
      attractionInTheArea: "",
      description: "",
      noOfParkingSpaces: undefined,
      noOfParkingSpacesGarage: undefined,
      noOfParkingSpacesElectric: undefined,
      noOfParkingSpacesBus: undefined,
      noOfParkingSpacesOutside: undefined,
      noOfParkingSpacesDisabled: undefined,
      parkingCostPerHour: undefined,
      parkingCostPerDay: undefined,
      parkingRemarks: "",
      externalBillingId: "",
      totalRooms: undefined,
      conferenceRooms: undefined,
      pmsSystem: "",
      openingTimePool: "",
      openingTimeFitnessCenter: "",
      equipmentFitnessCenter: "",
      openingTimeSpaArea: "",
      equipmentSpaArea: "",
      additionalLinks: [],
      ...initialData
    }
  });

  // Watch form errors for debugging
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      console.log("=== FORM VALIDATION ERRORS ===");
      console.log("Form errors:", errors);
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`Field "${field}":`, error?.message);
      });
    }
  }, [form.formState.errors]);

  // Watch form values for onChange callback
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

  const handleCopyAddress = () => {
    const { street, postalCode, city } = form.getValues();
    
    form.setValue("billingAddressStreet", street);
    form.setValue("billingAddressZip", postalCode);
    form.setValue("billingAddressCity", city);
    
    toast.success(t("messages.success.addressCopied"));
  };

  const onSubmit = async (data: HotelFormValues) => {
    console.log("=== HOTEL FORM SUBMIT STARTED ===");
    console.log("Form data received:", data);
    console.log("isSubmitting:", isSubmitting);
    console.log("onNext function type:", typeof onNext);
    console.log("onNext function:", onNext);
    
    // Safety check for onNext callback
    if (typeof onNext !== 'function') {
      console.error("onNext is not a function:", onNext);
      toast.error("Form submission error: Invalid callback function");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Processing form submission...");
      
      // Transform the form data to match the database schema (this mapping might still be useful for preparing data for useHotelFormState)
      const hotelDataFromForm = {
        name: data.name,
        street: data.street,
        postal_code: data.postalCode,
        city: data.city,
        phone: data.phone || null,
        general_manager_name: data.generalManagerName || null,
        general_manager_phone: data.generalManagerPhone || null,
        general_manager_email: data.generalManagerEmail || null,
        email: data.email,
        website: data.website || '',
        billing_address_name: data.billingAddressName,
        billing_address_street: data.billingAddressStreet,
        billing_address_zip: data.billingAddressZip,
        billing_address_city: data.billingAddressCity,
        billing_address_vat: data.billingAddressVat || '',
        star_rating: data.starRating || 0,
        category: data.category,
        opening_date: data.openingDate || 0,
        latest_renovation_date: data.latestRenovationDate || 0,
        total_rooms: data.totalRooms || 0,
        conference_rooms: data.conferenceRooms || 0,
        pms_system: data.pmsSystem || '',
        no_of_parking_spaces: data.noOfParkingSpaces || 0,
        no_of_parking_spaces_garage: data.noOfParkingSpacesGarage || 0,
        no_of_parking_spaces_electric: data.noOfParkingSpacesElectric || 0,
        no_of_parking_spaces_bus: data.noOfParkingSpacesBus || 0,
        no_of_parking_spaces_outside: data.noOfParkingSpacesOutside || 0,
        no_of_parking_spaces_disabled: data.noOfParkingSpacesDisabled || 0,
        parking_cost_per_hour: data.parkingCostPerHour || 0,
        parking_cost_per_day: data.parkingCostPerDay || 0,
        parking_remarks: data.parkingRemarks || '',
        distance_to_airport_km: data.distanceToAirportKm || 0,
        distance_to_highway_km: data.distanceToHighwayKm || 0,
        distance_to_fair_km: data.distanceToFairKm || 0,
        distance_to_train_station: data.distanceToTrainStation || 0,
        distance_to_public_transport: data.distanceToPublicTransport || 0,
        opening_time_pool: data.openingTimePool || '',
        opening_time_fitness_center: data.openingTimeFitnessCenter || '',
        opening_time_spa_area: data.openingTimeSpaArea || '',
        equipment_fitness_center: data.equipmentFitnessCenter || '',
        equipment_spa_area: data.equipmentSpaArea || '',
        planned_changes: data.plannedChanges || '',
        attraction_in_the_area: data.attractionInTheArea || '',
        external_billing_id: data.externalBillingId || '',
        additional_links: data.additionalLinks || [],
      };

      console.log("Transformed hotel data:", hotelDataFromForm);

      // TODO: Review if hotelDataFromForm transformation is still fully needed here.
      // The data is passed to useHotelFormState via onNext(data), 
      // and useHotelFormState now handles the API call with HotelInput.
      // This transformation might be redundant if 'data: HotelFormValues' itself is compatible 
      // with what useHotelFormState expects for formData.hotel (Partial<HotelInput>)

      // const result = await createOrUpdateHotel(hotelDataFromForm); // OLD API CALL - REMOVED
      
      console.log("About to show success toast...");
      toast.success(mode === 'edit' ? t("messages.success.hotelInfoUpdated") : t("messages.success.hotelInfoCompleted"));
      
      // Set isSubmitted to true and fetch or set hotel ID if available
      setIsSubmitted(true);
      // We should get this ID from the actual API response in a real implementation
      const newHotelId = data.id || 1;
      setHotelId(newHotelId); 
      
      console.log("About to call onNext with data:", data);
      console.log("onNext function:", onNext);
      
      // onNext passes the raw form data (HotelFormValues) to useHotelFormState
      // useHotelFormState then uses its formData.hotel (which this data becomes)
      // to construct the HotelInput for the actual API call on the final step.
      try {
        onNext(data);
        console.log("onNext called successfully");
      } catch (onNextError) {
        console.error("Error calling onNext:", onNextError);
        toast.error("Error proceeding to next step. Please try again.");
        return;
      }
      
      console.log("=== HOTEL FORM SUBMIT COMPLETED ===");
    } catch (error) {
      console.error('=== ERROR IN HOTEL FORM SUBMIT ===');
      console.error('Error in HotelForm onSubmit:', error);
      toast.error(t("messages.error.failedToProcessHotelInfo"));
    } finally {
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // If initialData changes, update the form
    if (Object.keys(initialData).length > 0) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value);
        }
      });
      
      // If initialData has an ID, set the hotelId state
      if ('id' in initialData && initialData.id !== undefined) {
        setHotelId(initialData.id);
      }
    }
  }, [initialData, form]);

  // Function to handle file uploads
  const handleFileUploaded = () => {
    toast.success(t("messages.success.fileUploaded"));
  };

  const handleSubmitClick = () => {
    console.log("=== SUBMIT BUTTON CLICKED ===");
    console.log("Current form values:", form.getValues());
    console.log("Form state:", form.formState);
    console.log("Is form valid?", form.formState.isValid);
    console.log("Form errors:", form.formState.errors);
    console.log("isSubmitting:", isSubmitting);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <BasicInfoSection form={form} />
          <GeneralManagerSection form={form} />
          <BillingInfoSection form={form} onCopyAddress={handleCopyAddress} />
          <HotelDetailsSection form={form} />
          <FacilitiesSection form={form} />
          <LocationDistanceSection form={form} />
          <AdditionalInfoSection form={form} />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="gap-1" 
              disabled={isSubmitting}
              onClick={handleSubmitClick}
            >
              {isSubmitting ? t("common.saving") : mode === 'edit' ? t("common.update") : t("common.next")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default HotelForm;
