import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HotelFormValues } from "../HotelForm";
import { MapPin } from "lucide-react";
import FormSection from "@/components/shared/FormSection";
import { NumberField, TextareaField, TwoColumnGrid } from "@/components/shared/FormFields";
import React from "react";

interface LocationDistanceSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const LocationDistanceSection = ({ form }: LocationDistanceSectionProps) => {
  const { t } = useTranslation();

  return (
    <FormSection 
      title={t("hotel.location")}
      description={t("hotel.distances")}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      {/* Add the icon at the top */}
      <div className="flex items-center space-x-3 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <span className="font-medium">{t("hotel.distances")}</span>
      </div>

      <TwoColumnGrid>
        <NumberField
          form={form}
          name="distanceToAirportKm"
          label={t("hotel.distanceToAirport")}
          min={0}
          step={0.1}
          placeholder="0.0"
          className="text-sm"
        />
        <TextareaField
          form={form}
          name="airportNote"
          label={t('hotel.airportNote')}
          placeholder={t('forms.placeholders.optionalNote')}
          rows={2}
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="distanceToHighwayKm"
          label={t("hotel.distanceToHighway")}
          min={0}
          step={0.1}
          placeholder="0.0"
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="distanceToFairKm"
          label={t("hotel.distanceToFair")}
          min={0}
          step={0.1}
          placeholder="0.0"
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="distanceToTrainStation"
          label={t("hotel.distanceToTrainStation")}
          min={0}
          step={0.1}
          placeholder="0.0"
          className="text-sm"
        />
        
        <NumberField
          form={form}
          name="distanceToPublicTransport"
          label={t("hotel.distanceToPublicTransport")}
          min={0}
          step={0.1}
          placeholder="0.0"
          className="text-sm"
        />
      </TwoColumnGrid>
      
      <TextareaField
        form={form}
        name="attractionInTheArea"
        label={t("hotel.attractions")}
        placeholder={t("forms.placeholders.describeAttractions")}
        rows={4}
        className="text-sm"
      />
    </FormSection>
  );
};

export default LocationDistanceSection;
