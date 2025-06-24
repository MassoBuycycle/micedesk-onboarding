import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Building } from "lucide-react";
import { HotelFormValues } from "../HotelForm";
import { Separator } from "@/components/ui/separator";
import FormSection from "@/components/shared/FormSection";
import { TextField, NumberField, TwoColumnGrid, TextareaField } from "@/components/shared/FormFields";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface HotelDetailsSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const HotelDetailsSection = ({ form }: HotelDetailsSectionProps) => {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t("hotel.hotelDetails")}
      description={t("hotel.hotelDetailsDescription")}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      {/* Header with icon */}
      <div className="flex items-center space-x-3 mb-4">
        <Building className="h-5 w-5 text-primary" />
        <span className="font-medium">{t("hotel.hotelClassification")}</span>
      </div>
      
      <TwoColumnGrid>
        {/* We need to keep the Select field as-is since we don't have a shared component for it */}
        <FormField
          control={form.control}
          name="starRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">{t("hotel.starRating")}*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t("hotel.selectStarRating")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">{t("starRatings.0")}</SelectItem>
                  <SelectItem value="1">{t("starRatings.1")}</SelectItem>
                  <SelectItem value="2">{t("starRatings.2")}</SelectItem>
                  <SelectItem value="3">{t("starRatings.3")}</SelectItem>
                  <SelectItem value="4">{t("starRatings.4")}</SelectItem>
                  <SelectItem value="5">{t("starRatings.5")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">{t("hotel.category")}*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t("hotel.selectCategory")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kongress">{t("hotelCategories.kongress")}</SelectItem>
                  <SelectItem value="wellness">{t("hotelCategories.wellness")}</SelectItem>
                  <SelectItem value="luxury">{t("hotelCategories.luxury")}</SelectItem>
                  <SelectItem value="budget">{t("hotelCategories.budget")}</SelectItem>
                  <SelectItem value="boutique">{t("hotelCategories.boutique")}</SelectItem>
                  <SelectItem value="resort">{t("hotelCategories.resort")}</SelectItem>
                  <SelectItem value="business">{t("hotelCategories.business")}</SelectItem>
                  <SelectItem value="family">{t("hotelCategories.family")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <TextField
          form={form}
          name="openingDate"
          label={t("hotel.openingDate")}
          placeholder={t("forms.placeholders.enterYear")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="latestRenovationDate"
          label={t("hotel.latestRenovationYear")}
          placeholder={t("forms.placeholders.enterYear")}
          className="text-sm"
        />
      </TwoColumnGrid>

      <Separator className="my-6" />
      <h4 className="text-sm font-medium mb-4">{t("hotel.roomsAndSystems")}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberField
          form={form}
          name="totalRooms"
          label={t("hotel.totalRooms")}
          placeholder={t("forms.placeholders.enterRoomCount")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="conferenceRooms"
          label={t("hotel.conferenceRooms")}
          placeholder={t("forms.placeholders.enterConferenceRooms")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="pmsSystem"
          label={t("hotel.pmsSystem")}
          placeholder={t("forms.placeholders.enterPmsSystem")}
          className="text-sm"
        />
      </div>
      
      <Separator className="my-6" />
      <h4 className="text-sm font-medium mb-4">{t("hotel.parking")}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NumberField
          form={form}
          name="noOfParkingSpaces"
          label={t("hotel.totalSpaces")}
          placeholder={t("forms.placeholders.enterParkingSpaces")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="noOfParkingSpacesGarage"
          label={t("hotel.garageSpaces")}
          placeholder={t("forms.placeholders.enterGarageSpaces")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="noOfParkingSpacesElectric"
          label={t("hotel.electricSpaces")}
          placeholder={t("forms.placeholders.enterElectricSpaces")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="noOfParkingSpacesBus"
          label={t("hotel.busSpaces")}
          placeholder={t("forms.placeholders.enterBusSpaces")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="noOfParkingSpacesOutside"
          label={t("hotel.outsideSpaces")}
          placeholder={t("forms.placeholders.enterOutsideSpaces")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="noOfParkingSpacesDisabled"
          label={t("hotel.disabledSpaces")}
          placeholder={t("forms.placeholders.enterDisabledSpaces")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="parkingCostPerHour"
          label={t("hotel.costPerHour")}
          step="0.1"
          placeholder={t("forms.placeholders.enterHourlyCost")}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="parkingCostPerDay"
          label={t("hotel.costPerDay")}
          step="0.1"
          placeholder={t("forms.placeholders.enterDailyCost")}
          className="text-sm"
        />
      </div>
      
      <div className="mt-4">
        <TextareaField
          form={form}
          name="parkingRemarks"
          label={t("hotel.parkingRemarks")}
          placeholder={t("forms.placeholders.parkingRemarks")}
          description={t("hotel.parkingRemarksDescription")}
          className="min-h-[80px]"
        />
      </div>
    </FormSection>
  );
};

export default HotelDetailsSection;
