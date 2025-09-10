import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { 
  updateInformationPolicy,
  InformationPolicy,
  InformationPolicyItem
} from "@/apiClient/informationPoliciesApi";

// Define schema for policy item details
const policyItemDetailSchema = z.object({
  name: z.string().min(1, "Detail name is required"),
  description: z.string().optional(),
  default: z.boolean().default(false)
});

// Define schema for policy items
const policyItemSchema = z.object({
  title: z.string().min(1, "Item title is required"),
  is_condition: z.boolean().default(false),
  details: z.array(policyItemDetailSchema).default([])
});

// Define schema for the form
const policyItemsFormSchema = z.object({
  items: z.array(policyItemSchema).default([])
});

type PolicyItemsFormValues = z.infer<typeof policyItemsFormSchema>;

interface PolicyItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: InformationPolicy | null;
  onSuccess: () => void;
}

const PolicyItemsDialog = ({ 
  open, 
  onOpenChange, 
  policy, 
  onSuccess 
}: PolicyItemsDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const form = useForm<PolicyItemsFormValues>({
    resolver: zodResolver(policyItemsFormSchema),
    defaultValues: {
      items: []
    }
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Reset form when dialog opens/closes or policy changes
  useEffect(() => {
    if (open && policy) {
      const formattedItems: InformationPolicyItem[] = (policy.items ?? []).map(item => ({
        title: item.title ?? "",
        is_condition: (item.is_condition === true || item.is_condition === 1 || item.is_condition === '1') ? true : false,
        details: (item.details ?? []).map(detail => ({
          name: detail.name ?? "",
          description: detail.description ?? "",
          default: (detail.default === true || detail.default === 1 || detail.default === '1') ? true : false
        }))
      }));

      form.reset({
        items: formattedItems
      });
    } else if (open) {
      form.reset({
        items: []
      });
    }
  }, [open, policy, form]);

  const addNewItem = () => {
    appendItem({
      title: "",
      is_condition: false,
      details: []
    });
  };

  const addDetailToItem = (itemIndex: number) => {
    const currentItems = form.getValues("items");
    const updatedItems = [...currentItems];
    
    // Ensure details array exists
    if (!updatedItems[itemIndex].details) {
      updatedItems[itemIndex].details = [];
    }
    
    updatedItems[itemIndex].details.push({
      name: "",
      description: "",
      default: false
    });
    form.setValue("items", updatedItems);
  };

  const removeDetailFromItem = (itemIndex: number, detailIndex: number) => {
    const currentItems = form.getValues("items");
    const updatedItems = [...currentItems];
    
    // Ensure details array exists before trying to splice
    if (updatedItems[itemIndex].details) {
      updatedItems[itemIndex].details.splice(detailIndex, 1);
      form.setValue("items", updatedItems);
    }
  };

  const onSubmit = async (data: PolicyItemsFormValues) => {
    if (!policy?.id) {
      toast.error(t("policies.policyIdRequired"));
      return;
    }

    // Validate that we have at least one item with a title
    if (!data.items || data.items.length === 0) {
      toast.error(t("policies.noPolicyItems"));
      return;
    }

    // Validate that all items have titles
    const invalidItems = data.items.filter(item => !item.title || item.title.trim() === '');
    if (invalidItems.length > 0) {
      toast.error(t("policies.itemTitleRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateInformationPolicy(policy.id, {
        items: data.items
      });
      if (res?.success) {
        toast.success(t("policies.policyItemsUpdated"));
      } else {
        toast.success(t("policies.saveItems"));
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || t("policies.failedToUpdateItems"));
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
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("policies.managePolicyItems")}
          </DialogTitle>
          <DialogDescription>
            {policy && (
              <>
                {t("policies.managePolicyItemsDescription", { policyType: getPolicyTypeLabel(policy.type) })}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              toast.error('Bitte prüfen Sie die Eingaben in den Richtlinien-Elementen');
            })}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{t("policies.policyItems")}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewItem}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  {t("policies.addItem")}
                </Button>
              </div>

              {itemFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("policies.noPolicyItems")}</p>
                  <p className="text-sm">{t("policies.noPolicyItemsDescription")}</p>
                </div>
              )}

              {itemFields.map((item, itemIndex) => (
                <Card key={item.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{t("policies.policyItem", { number: itemIndex + 1 })}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(itemIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Item Title */}
                    <FormField
                      control={form.control}
                      name={`items.${itemIndex}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("policies.itemTitle")}*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t("policies.itemTitlePlaceholder")} className="text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Is Condition Switch */}
                    <FormField
                      control={form.control}
                      name={`items.${itemIndex}.is_condition`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div>
                            <FormLabel>{t("policies.isCondition")}</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              {t("policies.isConditionDescription")}
                            </p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Item Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm">{t("policies.details")}</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addDetailToItem(itemIndex)}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          {t("policies.addDetail")}
                        </Button>
                      </div>

                      {form.watch(`items.${itemIndex}.details`)?.map((detail, detailIndex) => (
                        <div key={detailIndex} className="space-y-3 p-3 border rounded-lg bg-muted/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`items.${itemIndex}.details.${detailIndex}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">{t("policies.detailName")}*</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder={t("policies.detailNamePlaceholder")} className="text-sm h-8" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${itemIndex}.details.${detailIndex}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">{t("policies.detailDescription")}</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder={t("policies.detailDescriptionPlaceholder")} className="text-sm min-h-[60px]" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <FormField
                              control={form.control}
                              name={`items.${itemIndex}.details.${detailIndex}.default`}
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-blue-50 border-blue-200 flex-1 mr-2">
                                    <div>
                                      <FormLabel className="text-xs font-medium text-blue-900">{t("policies.defaultPolicy")}</FormLabel>
                                      <p className="text-xs text-blue-700">{t("policies.markAsDefault")}</p>
                                    </div>
                                    <FormControl>
                                      <div className="flex items-center space-x-2">
                                        <Switch 
                                          checked={field.value || false} 
                                          onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                          }}
                                          className="data-[state=checked]:bg-blue-600"
                                        />
                                        <span className="text-xs text-blue-700">
                                          {field.value ? t('common.yes') : t('common.no')}
                                        </span>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDetailFromItem(itemIndex, detailIndex)}
                              className="text-red-600 hover:text-red-700 h-8 px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={() => {
                }}
              >
                {isSubmitting ? t('common.saving') : t('policies.saveItems')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyItemsDialog; 