import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Hotel } from "lucide-react";
import { HotelFormValues } from "../HotelForm";
import FormSection from "@/components/shared/FormSection";
import { TextField, TextareaField, TwoColumnGrid } from "@/components/shared/FormFields";

interface BasicInfoSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <FormSection 
      title={t("hotel.basicInfo")} 
      description={t("hotel.basicInfoDescription")}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      <TwoColumnGrid>
        <TextField
          form={form}
          name="systemHotelId"
          label={`${t("hotel.hotelId")}*`}
          placeholder={t("hotel.hotelIdPlaceholder")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="name"
          label={`${t("hotel.name")}*`}
          placeholder={t("forms.placeholders.enterName")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="street"
          label={`${t("hotel.street")}*`}
          placeholder={t("forms.placeholders.enterStreetAddress")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="postalCode"
          label={`${t("hotel.postalCode")}*`}
          placeholder={t("forms.placeholders.enterPostalCode")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="city"
          label={`${t("hotel.city")}*`}
          placeholder={t("forms.placeholders.enterCity")}
          className="text-sm"
        />

        <TextField
          form={form}
          name="country"
          label={`${t("hotel.country")}*`}
          placeholder={t("forms.placeholders.enterCountry")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="phone"
          label={t("hotel.phone")}
          placeholder={t("forms.placeholders.enterPhone")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="fax"
          label={t("hotel.fax")}
          placeholder={t("forms.placeholders.enterFax")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="email"
          label={`${t("hotel.email")}*`}
          type="email"
          placeholder={t("forms.placeholders.enterEmail")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="website"
          label={t("hotel.website")}
          type="url"
          placeholder={t("forms.placeholders.enterWebsite")}
          className="text-sm"
        />

        {/* General Manager Information */}
        <TextField
          form={form}
          name="generalManagerName"
          label={t("hotel.generalManagerName")}
          placeholder={t("forms.placeholders.enterName")}
          className="text-sm"
        />

        <TextField
          form={form}
          name="generalManagerPhone"
          label={t("hotel.generalManagerPhone")}
          placeholder={t("forms.placeholders.enterPhone")}
          className="text-sm"
        />

        <TextField
          form={form}
          name="generalManagerEmail"
          label={t("hotel.generalManagerEmail")}
          type="email"
          placeholder={t("forms.placeholders.enterEmail")}
          className="text-sm"
        />
      </TwoColumnGrid>

      <TextareaField
        form={form}
        name="description"
        label={t("hotel.description")}
        placeholder={t("forms.placeholders.enterDescription")}
        rows={4}
        className="text-sm"
      />
    </FormSection>
  );
};

export default BasicInfoSection;
