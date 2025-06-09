import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SectionProps } from "./types";

const CheckInOutPolicies = ({ formData, updateField }: SectionProps) => {
  return (
    <Card className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Check-in & Check-out Policies</CardTitle>
        </div>
        <CardDescription>
          Set standard times and policies for arrivals and departures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Standard Check-in Time*</Label>
            <Input 
              id="checkInTime" 
              type="time" 
              value={formData.checkInTime}
              onChange={(e) => updateField("checkInTime", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Standard Check-out Time*</Label>
            <Input 
              id="checkOutTime" 
              type="time" 
              value={formData.checkOutTime}
              onChange={(e) => updateField("checkOutTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="earlyCheckInPolicy">Early Check-in Policy</Label>
            <Textarea 
              id="earlyCheckInPolicy" 
              placeholder="Describe early check-in availability and fees if applicable" 
              value={formData.earlyCheckInPolicy}
              onChange={(e) => updateField("earlyCheckInPolicy", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lateCheckOutPolicy">Late Check-out Policy</Label>
            <Textarea 
              id="lateCheckOutPolicy" 
              placeholder="Describe late check-out availability and fees if applicable" 
              value={formData.lateCheckOutPolicy}
              onChange={(e) => updateField("lateCheckOutPolicy", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckInOutPolicies;
