import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HotelFormValues } from "../HotelForm";
import { Dumbbell } from "lucide-react"; // Example icon
import FormSection from "@/components/shared/FormSection";
import { TextField, TwoColumnGrid } from "@/components/shared/FormFields";

interface FacilitiesSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const FacilitiesSection = ({ form }: FacilitiesSectionProps) => {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t("hotel.facilities")}
      description={t("hotel.facilitiesDescription")}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      {/* Pool */}
      <TextField
        form={form}
        name="openingTimePool"
        label={t("hotel.poolHours")}
        placeholder={t("forms.placeholders.poolHours")}
        className="text-sm"
      />

      {/* Fitness */}
      <TwoColumnGrid>
        <TextField
          form={form}
          name="openingTimeFitnessCenter"
          label={t("hotel.fitnessHours")}
          placeholder={t("forms.placeholders.fitnessHours")}
          className="text-sm"
        />
        <TextField
          form={form}
          name="equipmentFitnessCenter"
          label={t("hotel.fitnessEquipment")}
          placeholder={t("forms.placeholders.fitnessEquipment")}
          className="text-sm"
        />
      </TwoColumnGrid>

      {/* Spa */}
      <TwoColumnGrid>
        <TextField
          form={form}
          name="openingTimeSpaArea"
          label={t("hotel.spaHours")}
          placeholder={t("forms.placeholders.spaHours")}
          className="text-sm"
        />
        <TextField
          form={form}
          name="equipmentSpaArea"
          label={t("hotel.spaEquipment")}
          placeholder={t("forms.placeholders.spaEquipment")}
          className="text-sm"
        />
      </TwoColumnGrid>
    </FormSection>
  );
};

export default FacilitiesSection; 