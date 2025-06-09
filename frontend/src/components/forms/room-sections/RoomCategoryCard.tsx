
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DoorOpen, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RoomCategoryAmenities from "./RoomCategoryAmenities";

// Define the room category type
export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  maxOccupancy: string;
  basePrice: string;
  roomSize: string;
  roomView: string;
  bedType: string;
  amenities: string[];
}

interface RoomCategoryCardProps {
  category: RoomCategory;
  index: number;
  onUpdate: (id: string, field: keyof RoomCategory, value: any) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  onUpdateAmenities: (id: string, amenity: string, isChecked: boolean) => void;
}

const RoomCategoryCard = ({ 
  category, 
  index, 
  onUpdate, 
  onDelete, 
  canDelete,
  onUpdateAmenities 
}: RoomCategoryCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DoorOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Room Category {index + 1}</CardTitle>
          </div>
          {canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(category.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Enter the details for this room category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor={`name-${category.id}`}>Room Type Name*</Label>
            <Input 
              id={`name-${category.id}`} 
              placeholder="e.g., Deluxe Double, Executive Suite" 
              value={category.name}
              onChange={(e) => onUpdate(category.id, "name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`maxOccupancy-${category.id}`}>Maximum Occupancy*</Label>
            <Input 
              id={`maxOccupancy-${category.id}`} 
              type="number" 
              placeholder="Number of guests" 
              value={category.maxOccupancy}
              onChange={(e) => onUpdate(category.id, "maxOccupancy", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`basePrice-${category.id}`}>Base Price (€)</Label>
            <Input 
              id={`basePrice-${category.id}`} 
              type="number" 
              placeholder="Base rate per night" 
              value={category.basePrice}
              onChange={(e) => onUpdate(category.id, "basePrice", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`roomSize-${category.id}`}>Room Size (sqm)</Label>
            <Input 
              id={`roomSize-${category.id}`} 
              placeholder="Room size in square meters" 
              value={category.roomSize}
              onChange={(e) => onUpdate(category.id, "roomSize", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`roomView-${category.id}`}>Room View</Label>
            <Select 
              value={category.roomView} 
              onValueChange={(value) => onUpdate(category.id, "roomView", value)}
            >
              <SelectTrigger id={`roomView-${category.id}`}>
                <SelectValue placeholder="Select room view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City View</SelectItem>
                <SelectItem value="garden">Garden View</SelectItem>
                <SelectItem value="park">Park View</SelectItem>
                <SelectItem value="sea">Sea View</SelectItem>
                <SelectItem value="mountain">Mountain View</SelectItem>
                <SelectItem value="pool">Pool View</SelectItem>
                <SelectItem value="courtyard">Courtyard View</SelectItem>
                <SelectItem value="none">No Specific View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`bedType-${category.id}`}>Bed Type</Label>
            <Select 
              value={category.bedType} 
              onValueChange={(value) => onUpdate(category.id, "bedType", value)}
            >
              <SelectTrigger id={`bedType-${category.id}`}>
                <SelectValue placeholder="Select bed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Bed</SelectItem>
                <SelectItem value="double">Double Bed</SelectItem>
                <SelectItem value="queen">Queen Bed</SelectItem>
                <SelectItem value="king">King Bed</SelectItem>
                <SelectItem value="twin">Twin Beds</SelectItem>
                <SelectItem value="sofa">Sofa Bed</SelectItem>
                <SelectItem value="multiple">Multiple Beds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 col-span-2">
            <Label htmlFor={`description-${category.id}`}>Description</Label>
            <Textarea 
              id={`description-${category.id}`} 
              placeholder="Detailed description of this room type" 
              value={category.description}
              onChange={(e) => onUpdate(category.id, "description", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <RoomCategoryAmenities 
          category={category}
          onUpdateAmenities={onUpdateAmenities}
        />
      </CardContent>
    </Card>
  );
};

export default RoomCategoryCard;
