import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { HotelFormValues } from "../HotelForm";
import FormSection from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdditionalLinksSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const AdditionalLinksSection = ({ form }: AdditionalLinksSectionProps) => {
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
      title={t("hotel.additionalLinks")} 
      description={t("hotel.additionalLinksDescription")}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-gray-50">
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor={`additionalLinks.${index}.name`}>
                  {t("hotel.linkName")}*
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
                  {t("hotel.linkUrl")}*
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
    </FormSection>
  );
};

export default AdditionalLinksSection; 