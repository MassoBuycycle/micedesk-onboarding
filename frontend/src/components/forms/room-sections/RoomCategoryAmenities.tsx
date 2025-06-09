
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RoomCategory } from "./RoomCategoryCard";

interface RoomCategoryAmenitiesProps {
  category: RoomCategory;
  onUpdateAmenities: (id: string, amenity: string, isChecked: boolean) => void;
}

const AMENITIES = [
  "Air Conditioning", 
  "Bathtub", 
  "Minibar", 
  "WiFi", 
  "TV", 
  "Safe", 
  "Coffee Machine", 
  "Work Desk", 
  "Balcony", 
  "Iron/Ironing Board", 
  "Hairdryer", 
  "Refrigerator"
];

const RoomCategoryAmenities = ({ category, onUpdateAmenities }: RoomCategoryAmenitiesProps) => {
  return (
    <div className="space-y-2">
      <Label>Amenities</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {AMENITIES.map(amenity => (
          <div key={`${category.id}-${amenity}`} className="flex items-center space-x-2">
            <Checkbox 
              id={`${category.id}-${amenity}`}
              checked={category.amenities.includes(amenity)}
              onCheckedChange={(checked) => onUpdateAmenities(category.id, amenity, checked === true)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label htmlFor={`${category.id}-${amenity}`} className="text-sm font-normal cursor-pointer">
              {amenity}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCategoryAmenities;
