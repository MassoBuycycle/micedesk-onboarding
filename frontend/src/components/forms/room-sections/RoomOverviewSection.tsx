
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DoorOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export interface RoomOverviewData {
  totalRooms: string;
  singleRooms: string;
  doubleRooms: string;
  suites: string;
  connectingRooms: string;
  accessibleRooms: string;
  bedsPerRoom: string;
  roomSizeRange: string;
  standardFloor: string;
  nonSmokingRooms: string;
}

interface RoomOverviewSectionProps {
  data: RoomOverviewData;
  onDataChange: (data: Partial<RoomOverviewData>) => void;
}

const RoomOverviewSection = ({ data, onDataChange }: RoomOverviewSectionProps) => {
  const updateField = (field: keyof RoomOverviewData, value: string) => {
    onDataChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <DoorOpen className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Room Overview</CardTitle>
            <CardDescription>Basic information about the hotel's room inventory</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="totalRooms">Total Rooms*</Label>
            <Input 
              id="totalRooms" 
              type="number" 
              min="0" 
              placeholder="Total number of rooms" 
              value={data.totalRooms}
              onChange={(e) => updateField("totalRooms", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="singleRooms">Single Rooms</Label>
            <Input 
              id="singleRooms" 
              type="number" 
              min="0" 
              placeholder="Number of single rooms" 
              value={data.singleRooms}
              onChange={(e) => updateField("singleRooms", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doubleRooms">Double Rooms</Label>
            <Input 
              id="doubleRooms" 
              type="number" 
              min="0" 
              placeholder="Number of double rooms" 
              value={data.doubleRooms}
              onChange={(e) => updateField("doubleRooms", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="suites">Suites</Label>
            <Input 
              id="suites" 
              type="number" 
              min="0" 
              placeholder="Number of suites" 
              value={data.suites}
              onChange={(e) => updateField("suites", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="connectingRooms">Connecting Rooms</Label>
            <Input 
              id="connectingRooms" 
              type="number" 
              min="0" 
              placeholder="Number of connecting rooms" 
              value={data.connectingRooms}
              onChange={(e) => updateField("connectingRooms", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessibleRooms">Accessible Rooms</Label>
            <Input 
              id="accessibleRooms" 
              type="number" 
              min="0" 
              placeholder="Number of accessible rooms" 
              value={data.accessibleRooms}
              onChange={(e) => updateField("accessibleRooms", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bedsPerRoom">Beds Per Room</Label>
            <Input 
              id="bedsPerRoom" 
              placeholder="Average number of beds per room" 
              value={data.bedsPerRoom}
              onChange={(e) => updateField("bedsPerRoom", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roomSizeRange">Room Size Range (sqm)</Label>
            <Input 
              id="roomSizeRange" 
              placeholder="e.g., 20-45" 
              value={data.roomSizeRange}
              onChange={(e) => updateField("roomSizeRange", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nonSmokingRooms">Non-Smoking Rooms</Label>
            <Input 
              id="nonSmokingRooms" 
              placeholder="Number or percentage" 
              value={data.nonSmokingRooms}
              onChange={(e) => updateField("nonSmokingRooms", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomOverviewSection;
