import { DoorOpen, Image } from "lucide-react";
import { useTranslation } from "react-i18next";
// import { RoomCategoryFormValues } from "@/components/forms/RoomCategoryForm"; // No longer needed
import { RoomCategoryInput } from "@/apiClient/roomsApi"; // Import the correct type

interface FileItem {
  file?: File;
  fileTypeCode: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: any;
}

interface RoomCategoriesPreviewProps {
  // roomCategories: Partial<RoomCategoryFormValues>[]; // Old type
  roomCategories: Partial<RoomCategoryInput>[]; // Use the API input type
  uploadedFiles?: { [key: string]: FileItem[] }; // Add uploaded files prop
}

const RoomCategoriesPreview = ({ roomCategories, uploadedFiles }: RoomCategoriesPreviewProps) => {
  const { t } = useTranslation();
  
  // Helper function to handle boolean display
  const formatBooleanValue = (value: any): string => {
    // Handle numeric 1/0 as well as boolean true/false
    if (value === 1 || value === true || value === "1" || value === "true") {
      return t('common.yes');
    } else if (value === 0 || value === false || value === "0" || value === "false") {
      return t('common.no');
    }
    return String(value);
  };
  
  if (!roomCategories || roomCategories.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
          <DoorOpen className="h-4 w-4" /> {t('rooms.preview.roomCategories')}
        </h3>
        <p className="text-sm italic text-muted-foreground">{t('rooms.preview.noCategoriesAdded')}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <DoorOpen className="h-4 w-4" /> {t('rooms.preview.roomCategories')}
      </h3>
      <div className="space-y-4">
        {roomCategories.map((category, index) => (
          <div key={index} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
            <p className="font-medium text-foreground">
              {/* RoomCategoryInput uses category_name */}
              {category.category_name || `Category ${index + 1}`}
            </p>
            <div className="space-y-0.5 mt-1">
              {category.pms_name && <p><span className="text-foreground">{t('rooms.preview.pmsDesignation')}:</span> {category.pms_name}</p>}
              {/* RoomCategoryInput uses num_rooms, size as numbers - they are displayed directly */}
              {category.num_rooms !== undefined && <p><span className="text-foreground">{t('rooms.preview.roomCount')}:</span> {category.num_rooms}</p>}
              {category.size !== undefined && <p><span className="text-foreground">{t('rooms.preview.size')}:</span> {category.size} m²</p>}
              {category.bed_type && <p><span className="text-foreground">{t('rooms.preview.bedType')}:</span> {category.bed_type}</p>}
              {category.room_features && <p><span className="text-foreground">{t('rooms.preview.roomFeatures')}:</span> {category.room_features}</p>}
              {category.surcharges_upsell && <p><span className="text-foreground">{t('rooms.preview.upsellCosts')}:</span> {category.surcharges_upsell}</p>}
              {category.second_person_surcharge !== undefined && <p><span className="text-foreground">{t('rooms.preview.secondPersonSurcharge')}:</span> €{category.second_person_surcharge}</p>}
              {category.extra_bed_available !== undefined && (
                <p>
                  <span className="text-foreground">{t('rooms.preview.extraBed')}:</span> {formatBooleanValue(category.extra_bed_available)}
                  {category.extra_bed_available && category.extra_bed_surcharge !== undefined && <span> ({t('rooms.preview.extraBedSurcharge')}: €{category.extra_bed_surcharge})</span>}
                </p>
              )}
              {category.baby_bed_available !== undefined && <p><span className="text-foreground">{t('rooms.preview.babyBed')}:</span> {formatBooleanValue(category.baby_bed_available)}</p>}
            </div>
            
            {/* Show images for this category */}
            {uploadedFiles && uploadedFiles[index] && uploadedFiles[index].length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {uploadedFiles[index].length} Bild(er) hochgeladen
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedFiles[index].map((fileItem, fileIndex) => (
                    <div key={fileIndex} className="relative">
                      {fileItem.file && (
                        <img
                          src={URL.createObjectURL(fileItem.file)}
                          alt={`Preview ${fileItem.file.name}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                      )}
                      <div className="absolute top-1 right-1">
                        <span className={`px-1 py-0.5 text-xs rounded-full ${
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCategoriesPreview;
