import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import FormSection from "@/components/shared/FormSection";

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

// Define schema for information policies
const informationPolicySchema = z.object({
  system_hotel_id: z.string().min(1, "System Hotel ID is required"),
  type: z.enum(['room_information', 'service_information', 'general_policies'], {
    required_error: "Policy type is required"
  }),
  items: z.array(policyItemSchema).default([])
});

export type InformationPolicyFormValues = z.infer<typeof informationPolicySchema>;

interface InformationPoliciesFormProps {
  initialData?: Partial<InformationPolicyFormValues>;
  onNext: (data: InformationPolicyFormValues) => void;
  onPrevious?: (data: InformationPolicyFormValues) => void;
  onChange?: (data: Partial<InformationPolicyFormValues>) => void;
  mode?: 'add' | 'edit';
  hotelId?: string;
}

const InformationPoliciesForm = ({ 
  initialData = {}, 
  onNext, 
  onPrevious, 
  onChange, 
  mode = 'add',
  hotelId 
}: InformationPoliciesFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InformationPolicyFormValues>({
    resolver: zodResolver(informationPolicySchema),
    defaultValues: {
      system_hotel_id: hotelId || "",
      type: "room_information",
      items: [],
      ...initialData
    }
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Watch form values for onChange callback
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

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

  const onSubmit = async (data: InformationPolicyFormValues) => {
    setIsSubmitting(true);
    try {
      toast.success("Information policies saved successfully.");
      onNext(data);
    } catch (error) {
      console.error('Error in InformationPoliciesForm onSubmit:', error);
      toast.error("Failed to save information policies.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      const currentData = form.getValues();
      onPrevious(currentData);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSection 
          title="Information Policies" 
          description="Define hotel information policies, service details, and general policies"
        >
          {/* System Hotel ID Field */}
          <FormField
            control={form.control}
            name="system_hotel_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Hotel ID*</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. HB4I2, 57392, H5425"
                    className="text-sm"
                  />
                </FormControl>
                <FormDescription>
                  External system identifier for this hotel used in policies
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Policy Type Field */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="room_information">Room Information</SelectItem>
                    <SelectItem value="service_information">Service Information</SelectItem>
                    <SelectItem value="general_policies">General Policies</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Separator className="my-6" />

          {/* Policy Items Section */}
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
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-between">
          {onPrevious && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="submit" className="gap-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Next'} 
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default InformationPoliciesForm; 