import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Hotel, Plus, Trash2 } from "lucide-react";
import { HotelFormValues } from "../HotelForm";
import FormSection from "@/components/shared/FormSection";
import { TextField, TextareaField, TwoColumnGrid, PhoneField } from "@/components/shared/FormFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInfoSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const { t } = useTranslation();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalLinks"
  });

  const addNewLink = () => {
    append({ name: "", link: "" });
  };

  const removeLink = (index: number) => {
    remove(index);
  };

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
        
        <PhoneField
          form={form}
          name="phone"
          label={t("hotel.phone")}
          placeholder={t("forms.placeholders.enterPhone")}
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
      </TwoColumnGrid>

      <TextareaField
        form={form}
        name="description"
        label={t("hotel.description")}
        placeholder={t("forms.placeholders.enterDescription")}
        rows={4}
        className="text-sm"
      />

      {/* Additional Links Section */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{t("hotel.additionalLinks")}</h3>
          <p className="text-xs text-gray-500">{t("hotel.additionalLinksDescription")}</p>
        </div>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-gray-50">
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor={`additionalLinks.${index}.name`}>
                    {t("hotel.linkName")}
                  </Label>
                  <Input
                    id={`additionalLinks.${index}.name`}
                    {...form.register(`additionalLinks.${index}.name`)}
                    placeholder={t("hotel.linkNamePlaceholder")}
                    className="mt-1"
                  />
                  {form.formState.errors.additionalLinks?.[index]?.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.additionalLinks[index]?.name?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`additionalLinks.${index}.link`}>
                    {t("hotel.linkUrl")}
                  </Label>
                  <Input
                    id={`additionalLinks.${index}.link`}
                    {...form.register(`additionalLinks.${index}.link`)}
                    placeholder={t("hotel.linkUrlPlaceholder")}
                    className="mt-1"
                  />
                  {form.formState.errors.additionalLinks?.[index]?.link && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.additionalLinks[index]?.link?.message}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLink(index)}
                className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addNewLink}
            className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("hotel.addLink")}
          </Button>
        </div>
      </div>
    </FormSection>
  );
};

export default BasicInfoSection;
