import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HotelFormValues } from "../HotelForm";
import { MapPin, StickyNote } from "lucide-react";
import FormSection from "@/components/shared/FormSection";
import { NumberField, TextareaField, TwoColumnGrid } from "@/components/shared/FormFields";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface LocationDistanceSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

interface DistanceFieldProps {
  form: UseFormReturn<HotelFormValues>;
  distanceName: string;
  noteName: string;
  distanceLabel: string;
  noteLabel: string;
  t: any;
}

const DistanceFieldWithNote = ({ form, distanceName, noteName, distanceLabel, noteLabel, t }: DistanceFieldProps) => {
  const [showNote, setShowNote] = useState(false);
  const noteValue = form.watch(noteName as any);
  
  // Auto-open if there's already a value
  React.useEffect(() => {
    if (noteValue && noteValue.length > 0) {
      setShowNote(true);
    }
  }, [noteValue]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <NumberField
            form={form}
            name={distanceName}
            label={distanceLabel}
            min={0}
            step={0.1}
            placeholder="0.0"
            className="text-sm"
          />
        </div>
        <Button
          type="button"
          variant={showNote || noteValue ? "default" : "outline"}
          size="icon"
          className={`mt-6 h-8 w-8 shrink-0 ${noteValue ? "bg-primary" : ""}`}
          onClick={() => setShowNote(!showNote)}
          title={t('hotel.addNote')}
        >
          <StickyNote className="h-4 w-4" />
        </Button>
      </div>
      {showNote && (
        <div className="pl-2 animate-in slide-in-from-top-2">
          <TextareaField
            form={form}
            name={noteName}
            label={noteLabel}
            placeholder={t('forms.placeholders.optionalNote')}
            rows={2}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
};

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

      <div className="space-y-4">
        <DistanceFieldWithNote
          form={form}
          distanceName="distanceToAirportKm"
          noteName="airportNote"
          distanceLabel={t("hotel.distanceToAirport")}
          noteLabel={t('hotel.airportNote')}
          t={t}
        />
        
        <DistanceFieldWithNote
          form={form}
          distanceName="distanceToHighwayKm"
          noteName="highwayNote"
          distanceLabel={t("hotel.distanceToHighway")}
          noteLabel={t('hotel.highwayNote')}
          t={t}
        />
        
        <DistanceFieldWithNote
          form={form}
          distanceName="distanceToFairKm"
          noteName="fairNote"
          distanceLabel={t("hotel.distanceToFair")}
          noteLabel={t('hotel.fairNote')}
          t={t}
        />
        
        <DistanceFieldWithNote
          form={form}
          distanceName="distanceToTrainStation"
          noteName="trainStationNote"
          distanceLabel={t("hotel.distanceToTrainStation")}
          noteLabel={t('hotel.trainStationNote')}
          t={t}
        />
        
        <DistanceFieldWithNote
          form={form}
          distanceName="distanceToPublicTransport"
          noteName="publicTransportNote"
          distanceLabel={t("hotel.distanceToPublicTransport")}
          noteLabel={t('hotel.publicTransportNote')}
          t={t}
        />
      </div>
      
      <TextareaField
        form={form}
        name="attractionInTheArea"
        label={t("hotel.attractions")}
        placeholder={t("forms.placeholders.describeAttractions")}
        rows={4}
        className="text-sm mt-6"
      />
    </FormSection>
  );
};

export default LocationDistanceSection;
