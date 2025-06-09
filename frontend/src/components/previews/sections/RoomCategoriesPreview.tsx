import { DoorOpen } from "lucide-react";
// import { RoomCategoryFormValues } from "@/components/forms/RoomCategoryForm"; // No longer needed
import { RoomCategoryInput } from "@/apiClient/roomsApi"; // Import the correct type

interface RoomCategoriesPreviewProps {
  // roomCategories: Partial<RoomCategoryFormValues>[]; // Old type
  roomCategories: Partial<RoomCategoryInput>[]; // Use the API input type
}

const RoomCategoriesPreview = ({ roomCategories }: RoomCategoriesPreviewProps) => {
  if (!roomCategories || roomCategories.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
          <DoorOpen className="h-4 w-4" /> Room Categories
        </h3>
        <p className="text-sm italic text-muted-foreground">No room categories added yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <DoorOpen className="h-4 w-4" /> Room Categories
      </h3>
      <div className="space-y-4">
        {roomCategories.map((category, index) => (
          <div key={index} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
            <p className="font-medium text-foreground">
              {/* RoomCategoryInput uses category_name */}
              {category.category_name || `Category ${index + 1}`}
            </p>
            <div className="space-y-0.5 mt-1">
              {category.pms_name && <p><span className="text-foreground">PMS Name:</span> {category.pms_name}</p>}
              {/* RoomCategoryInput uses num_rooms, size as numbers - they are displayed directly */}
              {category.num_rooms !== undefined && <p><span className="text-foreground">Number of Rooms:</span> {category.num_rooms}</p>}
              {category.size !== undefined && <p><span className="text-foreground">Size:</span> {category.size} sqm</p>}
              {category.bed_type && <p><span className="text-foreground">Bed Type:</span> {category.bed_type}</p>}
              {category.room_features && <p><span className="text-foreground">Features:</span> {category.room_features}</p>}
              {category.surcharges_upsell && <p><span className="text-foreground">Upsell Costs:</span> {category.surcharges_upsell}</p>}
              {category.second_person_surcharge !== undefined && <p><span className="text-foreground">2nd Person Surcharge:</span> €{category.second_person_surcharge}</p>}
              {category.extra_bed_available && (
                <p>
                  <span className="text-foreground">Extra Bed:</span> Available
                  {category.extra_bed_surcharge !== undefined && <span> (Surcharge: €{category.extra_bed_surcharge})</span>}
                </p>
              )}
              {category.baby_bed_available && <p><span className="text-foreground">Baby Bed:</span> Available</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCategoriesPreview;
