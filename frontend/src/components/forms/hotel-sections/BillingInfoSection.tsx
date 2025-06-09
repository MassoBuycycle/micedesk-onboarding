import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HotelFormValues } from "../HotelForm";
import FormSection from "@/components/shared/FormSection";
import { TextField, TwoColumnGrid } from "@/components/shared/FormFields";

interface BillingInfoSectionProps {
  form: UseFormReturn<HotelFormValues>;
  onCopyAddress: () => void;
}

const BillingInfoSection = ({ form, onCopyAddress }: BillingInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t("hotel.billingInfo")}
      description={t("hotel.billingInfoDescription")}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      {/* Header with icon and copy button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="font-medium">{t("hotel.billingDetails")}</span>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onCopyAddress}
          className="text-xs h-7"
        >
          {t("hotel.copyFromHotelAddress")}
        </Button>
      </div>
      
      <TwoColumnGrid>
        <TextField
          form={form}
          name="billingAddressName"
          label={`${t("hotel.billingName")}*`}
          placeholder={t("forms.placeholders.enterBillingName")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="billingAddressStreet"
          label={`${t("hotel.billingStreet")}*`}
          placeholder={t("forms.placeholders.enterBillingStreet")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="billingAddressZip"
          label={`${t("hotel.billingZip")}*`}
          placeholder={t("forms.placeholders.enterBillingPostalCode")}
          className="text-sm"
        />
        
        <TextField
          form={form}
          name="billingAddressCity"
          label={`${t("hotel.billingCity")}*`}
          placeholder={t("forms.placeholders.enterBillingCity")}
          className="text-sm"
        />
      </TwoColumnGrid>
      
      <TextField
        form={form}
        name="billingAddressVat"
        label={t("hotel.billingVat")}
        placeholder={t("forms.placeholders.enterVatTaxId")}
        className="text-sm"
      />
    </FormSection>
  );
};

export default BillingInfoSection;
