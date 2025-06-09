
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Bookmark } from "lucide-react";

export interface RoomFeaturesData {
  standardFloor: string;
  executiveFloor: boolean;
  executiveFloorInfo: string;
  roomFeatures: string;
  inRoomFacilities: string;
}

interface RoomFeaturesSectionProps {
  data: RoomFeaturesData;
  onDataChange: (data: Partial<RoomFeaturesData>) => void;
}

const RoomFeaturesSection = ({ data, onDataChange }: RoomFeaturesSectionProps) => {
  const updateField = (field: keyof RoomFeaturesData, value: any) => {
    onDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Bookmark className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Room Features</CardTitle>
            <CardDescription>Detailed features and facilities available in rooms</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="standardFloor">Standard Floor Numbers</Label>
            <Input 
              id="standardFloor" 
              placeholder="e.g., 1-5" 
              value={data.standardFloor}
              onChange={(e) => updateField("standardFloor", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="executiveFloor">Executive Floor</Label>
              <input 
                type="checkbox"
                id="executiveFloor"
                checked={data.executiveFloor}
                onChange={(e) => updateField("executiveFloor", e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
            </div>
            {data.executiveFloor && (
              <Textarea 
                id="executiveFloorInfo" 
                placeholder="Information about executive floor(s)" 
                value={data.executiveFloorInfo}
                onChange={(e) => updateField("executiveFloorInfo", e.target.value)}
              />
            )}
          </div>
          
          <div className="space-y-2 col-span-2">
            <Label htmlFor="roomFeatures">Standard Room Features</Label>
            <Textarea 
              id="roomFeatures" 
              placeholder="List standard features available in all rooms" 
              value={data.roomFeatures}
              onChange={(e) => updateField("roomFeatures", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2 col-span-2">
            <Label htmlFor="inRoomFacilities">In-Room Facilities</Label>
            <Textarea 
              id="inRoomFacilities" 
              placeholder="List in-room facilities (TV, WiFi, etc.)" 
              value={data.inRoomFacilities}
              onChange={(e) => updateField("inRoomFacilities", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomFeaturesSection;
