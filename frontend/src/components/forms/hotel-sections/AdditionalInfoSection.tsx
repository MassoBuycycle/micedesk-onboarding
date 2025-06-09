import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Building } from "lucide-react";
import { HotelFormValues } from "../HotelForm";

interface AdditionalInfoSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const AdditionalInfoSection = ({ form }: AdditionalInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0">
      <CardHeader className="px-4 py-2">
        <div className="flex items-center space-x-3">
          <Building className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">{t("hotel.additionalInfo")}</CardTitle>
            <CardDescription className="text-xs">{t("hotel.additionalInfoDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <FormField
          control={form.control}
          name="plannedChanges"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">{t("hotel.plannedChanges")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("hotel.plannedChangesDescription")}
                  className="min-h-[80px] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoSection;
