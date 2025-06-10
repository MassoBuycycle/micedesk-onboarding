import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Hotel } from "@/apiClient/hotelsApi";
import { 
  createInformationPolicy, 
  updateInformationPolicy,
  InformationPolicy 
} from "@/apiClient/informationPoliciesApi";

const policyFormSchema = z.object({
  type: z.enum(['room_information', 'service_information', 'general_policies'], {
    required_error: "Policy type is required"
  })
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

interface PolicyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: Hotel | null;
  policy?: InformationPolicy | null;
  onSuccess: () => void;
}

const PolicyFormDialog = ({ 
  open, 
  onOpenChange, 
  hotel, 
  policy, 
  onSuccess 
}: PolicyFormDialogProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!policy;

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      type: "room_information"
    }
  });

  // Reset form when dialog opens/closes or policy changes
  useEffect(() => {
    if (open) {
      if (policy) {
        form.reset({
          type: policy.type
        });
      } else {
        form.reset({
          type: "room_information"
        });
      }
    }
  }, [open, policy, form]);

  const onSubmit = async (data: PolicyFormValues) => {
    if (!hotel?.system_hotel_id) {
      toast.error(t("policies.hotelIdRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && policy?.id) {
        // Update existing policy
        await updateInformationPolicy(policy.id, {
          type: data.type
        });
        toast.success(t("policies.policyUpdated"));
      } else {
        // Create new policy
        await createInformationPolicy({
          system_hotel_id: hotel.system_hotel_id,
          type: data.type,
          items: []
        });
        toast.success(t("policies.policyCreated"));
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving policy:", error);
      toast.error(isEditing ? t("policies.failedToUpdatePolicy") : t("policies.failedToCreatePolicy"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPolicyTypeLabel = (type: string) => {
    switch (type) {
      case 'room_information':
        return t("policies.policyTypes.roomInformation");
      case 'service_information':
        return t("policies.policyTypes.serviceInformation");
      case 'general_policies':
        return t("policies.policyTypes.generalPolicies");
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("policies.editPolicy") : t("policies.createNewPolicy")}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? t("policies.updatePolicyType")
              : t("policies.createPolicyDescription", { hotelName: hotel?.name || 'the selected hotel' })
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("policies.policyType")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("policies.selectPolicyType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="room_information">
                        {getPolicyTypeLabel('room_information')}
                      </SelectItem>
                      <SelectItem value="service_information">
                        {getPolicyTypeLabel('service_information')}
                      </SelectItem>
                      <SelectItem value="general_policies">
                        {getPolicyTypeLabel('general_policies')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? t("common.updating") : t("common.creating")) 
                  : (isEditing ? t("policies.updatePolicy") : t("policies.createPolicyButton"))
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyFormDialog; 