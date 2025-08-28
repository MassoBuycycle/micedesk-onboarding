import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, PlusCircle, Trash2, Image } from 'lucide-react';
import { deleteRoomCategory } from '@/apiClient/roomsApi';
import { toast } from 'sonner';
import FileUpload, { FileUploadRef } from '@/components/files/FileUpload';
import FileBrowser from '@/components/files/FileBrowser';
// import RoomCategoryCard, { RoomCategory } from "./room-sections/RoomCategoryCard"; // Unused for now

// Corresponds to RoomCategoryInput in apiClient, but for form use (strings for numbers initially)
const roomCategoryFormSchema = z.object({
  id: z.number().optional(), // Add ID field for existing categories
  category_name: z.string().min(1, "Category name is required"),
  pms_name: z.string().optional().nullable(),
  num_rooms: z.coerce.number().optional().nullable(),
  size: z.coerce.number().optional().nullable(),
  bed_type: z.string().optional().nullable(),
  room_features: z.string().optional().nullable(),
  surcharges_upsell: z.string().optional().nullable(), // DDL is TEXT, form can be string or number
  second_person_surcharge: z.coerce.number().optional().nullable(),
  extra_bed_available: z.boolean().default(false).nullable(),
  extra_bed_surcharge: z.coerce.number().optional().nullable(),
  baby_bed_available: z.boolean().default(false).nullable(),
  isAccessible: z.boolean().default(false).nullable(),
  hasBalcony: z.boolean().default(false).nullable(),
  // baby_bed_price: z.string().optional(), // Not in DDL, omitting for now
  tempIndex: z.number().optional(), // Add tempIndex field
});

export type RoomCategoryFormValues = z.infer<typeof roomCategoryFormSchema>;

// Define the overall form schema including the array of categories
const formSchema = z.object({
  categories: z.array(roomCategoryFormSchema)
});

export type FullCategoryFormValues = z.infer<typeof formSchema>;

const bedTypes = [
  { value: "single_90", label: "Einzelbett (90/100x200)" },
  { value: "king_180", label: "King (180x200)" },
  { value: "large_double_200", label: "Large Double (200x200)" },
  { value: "large_queen_160", label: "Large Queen (160x200)" },
  { value: "queen_120", label: "Queen (120x200)" },
  { value: "queen_140", label: "Queen (140x200)" },
  { value: "sofa_bed", label: "Sofa Bed" },
  { value: "twin", label: "Twin Beds" },
  { value: "other", label: "Other" },
];

interface RoomCategoryFormProps {
  initialData?: Partial<RoomCategoryFormValues>[];
  selectedHotel: any; // Or a more specific type if available
  onNext: (data: Partial<RoomCategoryFormValues>[]) => void;
  onPrevious: (data: Partial<RoomCategoryFormValues>[]) => void;
  onChange?: (data: Partial<RoomCategoryFormValues>[]) => void;
  mode?: 'add' | 'edit';
}

interface FileItem {
  file?: File;
  fileTypeCode: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: any;
}

const RoomCategoryForm: React.FC<RoomCategoryFormProps> = ({ 
  initialData = [], 
  selectedHotel,
  onNext, 
  onPrevious, 
  onChange, 
  mode 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: FileItem[] }>({});
  const fileUploadRefs = useRef<{ [key: string]: FileUploadRef | null }>({});



  const form = useForm<FullCategoryFormValues>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      categories: initialData.length > 0 ? initialData.map(cat => ({
        ...cat,
        // Ensure boolean fields are properly converted
        baby_bed_available: Boolean(cat.baby_bed_available),
        extra_bed_available: Boolean(cat.extra_bed_available),
        isAccessible: Boolean(cat.isAccessible),
        hasBalcony: Boolean(cat.hasBalcony),
      })) : [{ 
        category_name: '',
        extra_bed_available: false,
        baby_bed_available: false,
        pms_name: '',
        num_rooms: 0,
        size: 0,
        bed_type: '',
        room_features: '',
        surcharges_upsell: '0',
        second_person_surcharge: 0,
        extra_bed_surcharge: 0,
        isAccessible: false,
        hasBalcony: false,
       }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  const handleFileChange = useCallback((categoryIndex: number, files: FileItem[]) => {
    setUploadedFiles(prev => ({
      ...prev,
      [categoryIndex]: files
    }));
    
    // Store the temp index in the form data so it can be passed to the backend
    const currentCategories = form.getValues('categories');
    if (currentCategories[categoryIndex] && !currentCategories[categoryIndex].id) {
      // This is a new category, store the temp index
      form.setValue(`categories.${categoryIndex}.tempIndex`, categoryIndex);
      
      // Trigger onChange to ensure tempIndex is passed to parent component
      if (onChange) {
        const updatedCategories = form.getValues('categories');
        onChange(updatedCategories as Partial<RoomCategoryFormValues>[]);
      }
    }
  }, [form, onChange]);

  // Watch for changes to pass to parent if onChange is provided
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value, { name, type }) => {
        if (name && name.startsWith("categories")) { // Only call onChange if a category field changed
          onChange(value.categories as Partial<RoomCategoryFormValues>[]);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

  // Custom remove function that handles API deletion
  const handleRemove = async (index: number) => {
    const category = form.getValues(`categories.${index}`);
    
    // If the category has an ID, it exists in the database and needs to be deleted via API
    if (category.id && mode === 'edit') {
      try {
        await deleteRoomCategory(category.id);
        toast.success('Category deleted successfully');
        remove(index);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category. Please try again.');
      }
    } else {
      // For new categories (no ID), just remove from the form
      remove(index);
    }
  };

  const onSubmit = async (data: FullCategoryFormValues) => {
    console.log("=== ROOM CATEGORIES FORM SUBMIT ===");
    console.log("Form data:", data);
    
    // Wait for all file uploads to complete before proceeding
    const uploadPromises = Object.values(fileUploadRefs.current)
      .filter(ref => ref !== null)
      .map(ref => ref!.waitForUploads());
    
    try {
      await Promise.all(uploadPromises);
      console.log("All file uploads completed");
    } catch (error) {
      console.error("Error waiting for uploads:", error);
      toast.error("Some files are still uploading. Please wait and try again.");
      return;
    }
    
    // Check if any uploads failed
    const failedUploads = Object.values(fileUploadRefs.current)
      .filter(ref => ref !== null)
      .some(ref => ref!.getUploadStatus().error > 0);
    
    if (failedUploads) {
      toast.error("Some files failed to upload. Please fix the errors and try again.");
      return;
    }
    
    // Proceed with form submission
    onNext(data.categories);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((item, index) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <CardTitle>{`Zimmerkategorie ${index + 1}`}</CardTitle>
              {fields.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-4 right-4 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Entfernen
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`categories.${index}.category_name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriename*</FormLabel>
                    <FormControl><Input placeholder="z.B. Doppelzimmer Meerblick" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`categories.${index}.pms_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PMS-Bezeichnung</FormLabel>
                      <FormControl><Input placeholder="Interner PMS-Code" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.num_rooms`}
                  render={({ field }) => (
                                      <FormItem>
                    <FormLabel>Anzahl Zimmer</FormLabel>
                    <FormControl><Input type="number" min="0" placeholder="0" {...field} value={field.value || '0'} onWheel={(e) => e.currentTarget.blur()} /></FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`categories.${index}.size`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Größe (m²)</FormLabel>
                      <FormControl><Input type="number" min="0" placeholder="0" {...field} value={field.value || '0'} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.bed_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bettentyp</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Bettentyp auswählen" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {bedTypes.map(bt => <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`categories.${index}.room_features`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spezielle Ausstattungsmerkmale</FormLabel>
                    <FormControl><Textarea placeholder="z.B. Balkon, Minibar, Jacuzzi" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`categories.${index}.surcharges_upsell`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upsell-Kosten (€)</FormLabel>
                      <FormControl><Input placeholder="z.B. Meerblick +20" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.second_person_surcharge`}
                  render={({ field }) => (
                                      <FormItem>
                    <FormLabel>Aufpreis 2. Person (€)</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" placeholder="0.00" {...field} value={field.value || '0'} onWheel={(e) => e.currentTarget.blur()} /></FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.extra_bed_surcharge`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aufpreis Zustellbett (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          value={field.value === null || field.value === undefined ? '' : String(field.value)} 
                          onChange={(e) => field.onChange(e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          disabled={!form.watch(`categories.${index}.extra_bed_available`)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <FormField
                  control={form.control}
                  name={`categories.${index}.baby_bed_available`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel className="!mt-0">Babybett verfügbar?</FormLabel>
                      <FormControl>
                        <Checkbox 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.extra_bed_available`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel className="!mt-0">Zustellbett verfügbar?</FormLabel>
                      <FormControl>
                        <Checkbox 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.isAccessible`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel className="!mt-0">Barrierefrei?</FormLabel>
                      <FormControl>
                        <Checkbox 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`categories.${index}.hasBalcony`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel className="!mt-0">Balkon?</FormLabel>
                      <FormControl>
                        <Checkbox 
                          checked={field.value || false} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Section for Room Category */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-5 w-5 text-primary" />
                  <h4 className="text-lg font-medium">Zimmerkategorie Bilder</h4>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Laden Sie Bilder für diese Zimmerkategorie hoch. Diese werden für die Präsentation der Zimmer verwendet.
                </div>
                
                {/* Upload Status Display */}
                {fileUploadRefs.current[index] && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Upload Status:</span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const status = fileUploadRefs.current[index]?.getUploadStatus();
                          if (!status) return null;
                          return (
                            <>
                              {status.pending > 0 && <span className="text-yellow-600">⏸️ {status.pending} pending</span>}
                              {status.uploading > 0 && <span className="text-blue-600">⏳ {status.uploading} uploading</span>}
                              {status.success > 0 && <span className="text-green-600">✓ {status.success} uploaded</span>}
                              {status.error > 0 && <span className="text-red-600">✗ {status.error} failed</span>}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                
                <FileUpload
                  ref={(el) => fileUploadRefs.current[index] = el}
                  entityType="room-categories"
                  entityId={form.getValues(`categories.${index}.id`) || `temp-${index}`}
                  category="room-category-images"
                  fileTypeCode="room_photos"
                  maxFiles={20}
                  className="w-full"
                  onFileChange={(files) => handleFileChange(index, files)}
                />
              </div>

              {/* Display existing files and uploaded files for this category */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-5 w-5 text-primary" />
                  <h4 className="text-lg font-medium">Bilder für diese Kategorie</h4>
                </div>
                
                {/* Show existing files if category has an ID */}
                {form.getValues(`categories.${index}.id`) && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Bereits hochgeladene Bilder</h5>
                    <FileBrowser
                      entityType="room-categories"
                      entityId={form.getValues(`categories.${index}.id`)}
                      category="room-category-images"
                      title="Bereits hochgeladene Bilder"
                      className="w-full"
                    />
                  </div>
                )}
                
                {/* Show uploaded files for new categories */}
                {!form.getValues(`categories.${index}.id`) && uploadedFiles[index] && uploadedFiles[index].length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Hochgeladene Bilder (noch nicht gespeichert)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {uploadedFiles[index].map((fileItem, fileIndex) => (
                        <div key={fileIndex} className="relative border rounded-lg p-2 bg-gray-50">
                          {fileItem.file && (
                            <>
                              <img
                                src={URL.createObjectURL(fileItem.file)}
                                alt={`Preview ${fileItem.file.name}`}
                                className="w-full h-24 object-cover rounded mb-2"
                              />
                              <p className="text-xs text-gray-600 truncate" title={fileItem.file.name}>
                                {fileItem.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <div className="absolute top-1 right-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  fileItem.status === 'success' ? 'bg-green-100 text-green-800' :
                                  fileItem.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                                  fileItem.status === 'error' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {fileItem.status === 'success' ? '✓' :
                                   fileItem.status === 'uploading' ? '⏳' :
                                   fileItem.status === 'error' ? '✗' :
                                   '⏸️'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={() => append({ 
            category_name: '', 
            extra_bed_available: false, 
            baby_bed_available: false, 
            pms_name: '',
            num_rooms: 0,
            size: 0,
            bed_type: '',
            room_features: '',
            surcharges_upsell: '0',
            second_person_surcharge: 0,
            extra_bed_surcharge: 0,
            isAccessible: false,
            hasBalcony: false,
          })} 
          className="mt-4 gap-1.5"
        >
          <PlusCircle className="h-4 w-4" /> Weitere Kategorie hinzufügen
        </Button>

        <div className="flex justify-between mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onPrevious(form.getValues().categories)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>
          
          <Button type="submit" className="gap-1">
             Weiter <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoomCategoryForm;
