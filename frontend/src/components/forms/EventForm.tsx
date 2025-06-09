
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EventForm = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Add New Event</CardTitle>
            <CardDescription>Enter event details and specifications</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="hotel">Select Hotel</Label>
            <Select>
              <SelectTrigger id="hotel">
                <SelectValue placeholder="Choose a hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel1">Grand Hotel Berlin</SelectItem>
                <SelectItem value="hotel2">Luxury Resort Munich</SelectItem>
                <SelectItem value="hotel3">Business Hotel Frankfurt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input id="contactName" placeholder="Enter contact name" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPosition">Contact Position</Label>
            <Input id="contactPosition" placeholder="Enter position" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input id="contactPhone" type="tel" placeholder="Enter phone number" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input id="contactEmail" type="email" placeholder="Enter email address" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Event
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventForm;
