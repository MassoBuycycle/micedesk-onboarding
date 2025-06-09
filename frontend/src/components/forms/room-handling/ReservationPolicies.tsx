import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SectionProps } from "./types";

const ReservationPolicies = ({ formData, updateField }: SectionProps) => {
  return (
    <Card className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0">
      <CardHeader>
        <CardTitle>Reservation Policies</CardTitle>
        <CardDescription>
          Set policies regarding guarantees, cancellations and no-shows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="guaranteePolicy">Guarantee Policy</Label>
            <Textarea 
              id="guaranteePolicy" 
              placeholder="Describe guarantee requirements (e.g., credit card, deposit)" 
              value={formData.guaranteePolicy}
              onChange={(e) => updateField("guaranteePolicy", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea 
              id="cancellationPolicy" 
              placeholder="Describe cancellation rules and deadlines" 
              value={formData.cancellationPolicy}
              onChange={(e) => updateField("cancellationPolicy", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="noShowPolicy">No-Show Policy</Label>
            <Textarea 
              id="noShowPolicy" 
              placeholder="Describe charges and procedures for no-shows" 
              value={formData.noShowPolicy}
              onChange={(e) => updateField("noShowPolicy", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationPolicies;
