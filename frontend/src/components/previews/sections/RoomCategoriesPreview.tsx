import { DoorOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
// import { RoomCategoryFormValues } from "@/components/forms/RoomCategoryForm"; // No longer needed
import { RoomCategoryInput } from "@/apiClient/roomsApi"; // Import the correct type

interface RoomCategoriesPreviewProps {
  // roomCategories: Partial<RoomCategoryFormValues>[]; // Old type
  roomCategories: Partial<RoomCategoryInput>[]; // Use the API input type
}

const RoomCategoriesPreview = ({ roomCategories }: RoomCategoriesPreviewProps) => {
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
          <DoorOpen className="h-4 w-4" /> Zimmerkategorien
        </h3>
        <p className="text-sm italic text-muted-foreground">Noch keine Zimmerkategorien hinzugefügt.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <DoorOpen className="h-4 w-4" /> Zimmerkategorien
      </h3>
      <div className="space-y-4">
        {roomCategories.map((category, index) => (
          <div key={index} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
            <p className="font-medium text-foreground">
              {/* RoomCategoryInput uses category_name */}
              {category.category_name || `Category ${index + 1}`}
            </p>
            <div className="space-y-0.5 mt-1">
              {category.pms_name && <p><span className="text-foreground">PMS-Bezeichnung:</span> {category.pms_name}</p>}
              {/* RoomCategoryInput uses num_rooms, size as numbers - they are displayed directly */}
              {category.num_rooms !== undefined && <p><span className="text-foreground">Anzahl Zimmer:</span> {category.num_rooms}</p>}
              {category.size !== undefined && <p><span className="text-foreground">Größe:</span> {category.size} m²</p>}
              {category.bed_type && <p><span className="text-foreground">Bettentyp:</span> {category.bed_type}</p>}
              {category.room_features && <p><span className="text-foreground">Ausstattungsmerkmale:</span> {category.room_features}</p>}
              {category.surcharges_upsell && <p><span className="text-foreground">Upsell-Kosten:</span> {category.surcharges_upsell}</p>}
              {category.second_person_surcharge !== undefined && <p><span className="text-foreground">Aufpreis 2. Person:</span> €{category.second_person_surcharge}</p>}
              {category.extra_bed_available !== undefined && (
                <p>
                  <span className="text-foreground">Zustellbett:</span> {formatBooleanValue(category.extra_bed_available)}
                  {category.extra_bed_available && category.extra_bed_surcharge !== undefined && <span> (Aufpreis: €{category.extra_bed_surcharge})</span>}
                </p>
              )}
              {category.baby_bed_available !== undefined && <p><span className="text-foreground">Babybett:</span> {formatBooleanValue(category.baby_bed_available)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCategoriesPreview;
