import { useState, useEffect } from "react";
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
  InformationPolicy 
} from "@/apiClient/informationPoliciesApi";

// Define schema for policy item details
const policyItemDetailSchema = z.object({
  name: z.string().min(1, "Detail name is required"),
  description: z.string().optional()
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
      const formattedItems = policy.items?.map(item => ({
        title: item.title || "",
        is_condition: item.is_condition || false,
        details: item.details?.map(detail => ({
          name: detail.name || "",
          description: detail.description || ""
        })) || []
      })) || [];

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
      description: ""
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
      toast.error("Policy ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateInformationPolicy(policy.id, {
        items: data.items
      });
      toast.success("Policy items updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating policy items:", error);
      toast.error("Failed to update policy items");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPolicyTypeLabel = (type: string) => {
    switch (type) {
      case 'room_information':
        return 'Room Information';
      case 'service_information':
        return 'Service Information';
      case 'general_policies':
        return 'General Policies';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Policy Items
          </DialogTitle>
          <DialogDescription>
            {policy && (
              <>
                Manage items for <strong>{getPolicyTypeLabel(policy.type)}</strong> policy
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Policy Items</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewItem}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {itemFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No policy items added yet.</p>
                  <p className="text-sm">Click "Add Item" to create your first policy item.</p>
                </div>
              )}

              {itemFields.map((item, itemIndex) => (
                <Card key={item.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Policy Item {itemIndex + 1}</CardTitle>
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
                          <FormLabel>Title*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter item title" className="text-sm" />
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
                            <FormLabel>Is this a condition?</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Mark if this item represents a condition or requirement
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
                        <FormLabel className="text-sm">Details</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addDetailToItem(itemIndex)}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Detail
                        </Button>
                      </div>

                      {form.watch(`items.${itemIndex}.details`)?.map((detail, detailIndex) => (
                        <div key={detailIndex} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/30">
                          <FormField
                            control={form.control}
                            name={`items.${itemIndex}.details.${detailIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Detail Name*</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Detail name" className="text-sm h-8" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name={`items.${itemIndex}.details.${detailIndex}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder="Detail description" 
                                      className="text-sm min-h-[60px]" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDetailFromItem(itemIndex, detailIndex)}
                              className="text-red-600 hover:text-red-700 h-6 px-2"
                            >
                              <Trash2 className="h-3 w-3" />
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Items'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyItemsDialog; 