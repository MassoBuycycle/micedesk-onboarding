import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { SectionProps } from "./types";

const GuestPolicies = ({ formData, updateField, updateAccessibilityFeatures }: SectionProps) => {
  return (
    <Card className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0">
      <CardHeader>
        <CardTitle>Guest Policies</CardTitle>
        <CardDescription>
          Set policies for children, pets, and other special requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="childrenPolicy">Children Policy</Label>
            <Textarea 
              id="childrenPolicy" 
              placeholder="Describe policy for children staying in rooms" 
              value={formData.childrenPolicy}
              onChange={(e) => updateField("childrenPolicy", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smokingPolicy">Smoking Policy</Label>
            <Select 
              value={formData.smokingPolicy} 
              onValueChange={(value) => updateField("smokingPolicy", value)}
            >
              <SelectTrigger id="smokingPolicy">
                <SelectValue placeholder="Select smoking policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non-smoking">Non-smoking property</SelectItem>
                <SelectItem value="designated-areas">Smoking in designated areas only</SelectItem>
                <SelectItem value="smoking-rooms">Smoking rooms available</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="petsAllowed">Pets Allowed</Label>
              <Switch 
                id="petsAllowed" 
                checked={formData.petsAllowed}
                onCheckedChange={(checked) => updateField("petsAllowed", checked)}
              />
            </div>
            {formData.petsAllowed && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="petFee">Pet Fee (€)</Label>
                  <Input 
                    id="petFee" 
                    placeholder="Enter fee amount" 
                    value={formData.petFee}
                    onChange={(e) => updateField("petFee", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petRestrictions">Pet Restrictions/Conditions</Label>
                  <Textarea 
                    id="petRestrictions" 
                    placeholder="Specify restrictions on size, breed, etc." 
                    value={formData.petRestrictions}
                    onChange={(e) => updateField("petRestrictions", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="extraBedAvailable">Extra Beds Available</Label>
              <Switch 
                id="extraBedAvailable" 
                checked={formData.extraBedAvailable}
                onCheckedChange={(checked) => updateField("extraBedAvailable", checked)}
              />
            </div>
            {formData.extraBedAvailable && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="extraBedFee">Extra Bed Fee (€)</Label>
                  <Input 
                    id="extraBedFee" 
                    placeholder="Enter fee amount" 
                    value={formData.extraBedFee}
                    onChange={(e) => updateField("extraBedFee", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraBedRestrictions">Extra Bed Restrictions</Label>
                  <Textarea 
                    id="extraBedRestrictions" 
                    placeholder="Specify any restrictions for extra beds" 
                    value={formData.extraBedRestrictions}
                    onChange={(e) => updateField("extraBedRestrictions", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Label>Accessibility Features</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Wheelchair Accessible", 
              "Accessible Bathroom", 
              "Roll-in Shower", 
              "Visual Alarms",
              "Hearing Accessible", 
              "Grab Bars", 
              "Elevator", 
              "Service Animals Welcome",
              "Braille Signage"
            ].map(feature => (
              <div key={feature} className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={formData.accessibilityFeatures.includes(feature)}
                  onChange={(e) => updateAccessibilityFeatures && updateAccessibilityFeatures(feature, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor={`feature-${feature}`} className="text-sm font-normal">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestPolicies;
