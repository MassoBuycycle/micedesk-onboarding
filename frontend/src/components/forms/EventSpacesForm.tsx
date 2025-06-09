import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Save, X, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

interface EventSpace {
  id?: number | string;
  name: string;
  daily_rate: string | number;
  half_day_rate: string | number;
  size: string;
  dimensions: string;
  cap_rounds: string | number;
  cap_theatre: string | number;
  cap_classroom: string | number;
  cap_u_shape: string | number;
  cap_boardroom: string | number;
  cap_cabaret: string | number;
  cap_cocktail: string | number;
  features: string;
  is_soundproof: boolean;
  has_daylight: boolean;
  has_blackout: boolean;
  has_climate_control: boolean;
  wifi_speed: string;
  beamer_lumens: string | number;
  supports_hybrid: boolean;
  presentation_software: string;
  copy_fee: string | number;
  has_tech_support: boolean;
}

// Props definition
interface EventSpacesFormProps {
  initialData?: EventSpace[];
  selectedHotel: any;
  onNext: (data: EventSpace[]) => void;
  onPrevious: (data: EventSpace[]) => void;
  onChange?: (data: EventSpace[]) => void;
  mode?: 'add' | 'edit';
}

const initialSpaceState: EventSpace = {
  name: "",
  daily_rate: "",
  half_day_rate: "",
  size: "",
  dimensions: "",
  cap_rounds: 0,
  cap_theatre: 0,
  cap_classroom: 0,
  cap_u_shape: 0,
  cap_boardroom: 0,
  cap_cabaret: 0,
  cap_cocktail: 0,
  features: "",
  is_soundproof: false,
  has_daylight: false,
  has_blackout: false,
  has_climate_control: false,
  wifi_speed: "",
  beamer_lumens: "",
  supports_hybrid: false,
  presentation_software: "",
  copy_fee: "",
  has_tech_support: false
};

const EventSpacesForm = ({ initialData = [], selectedHotel, onNext, onPrevious, onChange, mode }: EventSpacesFormProps) => {
  const { toast: uiToast } = useToast();
  // Use initialData if provided, otherwise start with one empty space
  const [spaces, setSpaces] = useState<EventSpace[]>(
    initialData.length > 0 
      ? initialData 
      : [{
          id: crypto.randomUUID(),
          ...initialSpaceState
        }]
  );
  const [currentSpace, setCurrentSpace] = useState<EventSpace | null>(null);
  const [editingSpaceId, setEditingSpaceId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Function to add a new event space
  const addEventSpace = () => {
    const updatedSpaces = [
      ...spaces,
      {
        id: crypto.randomUUID(),
        ...initialSpaceState
      }
    ];
    
    setSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };
  
  // Function to remove an event space
  const removeEventSpace = (id: number | string) => {
    if (spaces.length === 1) {
      toast.error("You must have at least one event space");
      return;
    }
    
    const updatedSpaces = spaces.filter(space => space.id !== id);
    setSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };
  
  // Function to update an event space
  const updateEventSpace = (id: number | string, field: keyof EventSpace, value: any) => {
    const updatedSpaces = spaces.map(space => 
      space.id === id ? { ...space, [field]: value } : space
    );
    
    setSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };
  
  // Function to update features (checkboxes)
  const updateFeature = (id: number | string, field: string, checked: boolean) => {
    const updatedSpaces = spaces.map(space => 
      space.id === id ? { ...space, [field]: checked } : space
    );
    
    setSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };
  
  // Handle form submission to proceed to next step
  const handleNext = () => {
    // Basic validation
    const isValid = spaces.every(space => 
      space.name && space.name.trim() !== ""
    );

    if (!isValid) {
      toast.error("Please provide a name for all event spaces");
      return;
    }

    onNext(spaces);
  };

  const handlePrevious = () => {
    onPrevious(spaces);
  };

  // Call onChange with initial data on component mount
  useEffect(() => {
    if (onChange && spaces.length > 0) {
      onChange(spaces);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Spaces</h2>
          <p className="text-muted-foreground">
            Define event spaces and their characteristics for {selectedHotel?.name || "this hotel"}
          </p>
        </div>
        <Button onClick={addEventSpace} variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Event Space
        </Button>
      </div>

      {/* List of Event Spaces */}
      {spaces.map((space, index) => (
        <Card key={space.id} className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Event Space {index + 1}</CardTitle>
              </div>
              {spaces.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeEventSpace(space.id!)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription>
              Enter the details for this event space
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`name-${space.id}`}>Space Name*</Label>
                <Input 
                  id={`name-${space.id}`} 
                  placeholder="e.g., Grand Ballroom, Conference Room A" 
                  value={space.name}
                  onChange={(e) => updateEventSpace(space.id!, "name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`cap_cocktail-${space.id}`}>Maximum Capacity*</Label>
                <Input 
                  id={`cap_cocktail-${space.id}`} 
                  type="number" 
                  placeholder="Maximum number of attendees" 
                  value={space.cap_cocktail}
                  onChange={(e) => updateEventSpace(space.id!, "cap_cocktail", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`size-${space.id}`}>Size (sqm)</Label>
                <Input 
                  id={`size-${space.id}`} 
                  placeholder="Space size in square meters" 
                  value={space.size}
                  onChange={(e) => updateEventSpace(space.id!, "size", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`dimensions-${space.id}`}>Dimensions</Label>
                <Input 
                  id={`dimensions-${space.id}`} 
                  placeholder="Dimensions (e.g., 10m x 15m)" 
                  value={space.dimensions}
                  onChange={(e) => updateEventSpace(space.id!, "dimensions", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`daily_rate-${space.id}`}>Daily Rate (€)</Label>
                <div className="relative">
                  <Input 
                    id={`daily_rate-${space.id}`} 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Base rate per day"
                    value={space.daily_rate}
                    onChange={(e) => updateEventSpace(space.id!, "daily_rate", e.target.value)}
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    €
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`half_day_rate-${space.id}`}>Half-Day Rate (€)</Label>
                <div className="relative">
                  <Input 
                    id={`half_day_rate-${space.id}`} 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Base rate for half day"
                    value={space.half_day_rate}
                    onChange={(e) => updateEventSpace(space.id!, "half_day_rate", e.target.value)}
                    className="pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    €
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`features-${space.id}`}>Description</Label>
                <Textarea 
                  id={`features-${space.id}`} 
                  placeholder="Detailed description of this event space" 
                  value={space.features}
                  onChange={(e) => updateEventSpace(space.id!, "features", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Seating Capacities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cap_theatre-${space.id}`}>Theatre</Label>
                  <Input 
                    id={`cap_theatre-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_theatre}
                    onChange={(e) => updateEventSpace(space.id!, "cap_theatre", e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_classroom-${space.id}`}>Classroom</Label>
                  <Input 
                    id={`cap_classroom-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_classroom}
                    onChange={(e) => updateEventSpace(space.id!, "cap_classroom", e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_u_shape-${space.id}`}>U-Shape</Label>
                  <Input 
                    id={`cap_u_shape-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_u_shape}
                    onChange={(e) => updateEventSpace(space.id!, "cap_u_shape", e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_boardroom-${space.id}`}>Boardroom</Label>
                  <Input 
                    id={`cap_boardroom-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_boardroom}
                    onChange={(e) => updateEventSpace(space.id!, "cap_boardroom", e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_rounds-${space.id}`}>Rounds</Label>
                  <Input 
                    id={`cap_rounds-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_rounds}
                    onChange={(e) => updateEventSpace(space.id!, "cap_rounds", e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_cabaret-${space.id}`}>Cabaret</Label>
                  <Input 
                    id={`cap_cabaret-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_cabaret}
                    onChange={(e) => updateEventSpace(space.id!, "cap_cabaret", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-3">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`wifi_speed-${space.id}`}>WiFi Speed</Label>
                  <Input 
                    id={`wifi_speed-${space.id}`} 
                    placeholder="e.g., 100 Mbps, 1 Gbps" 
                    value={space.wifi_speed}
                    onChange={(e) => updateEventSpace(space.id!, "wifi_speed", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`beamer_lumens-${space.id}`}>Projector Brightness (Lumens)</Label>
                  <Input 
                    id={`beamer_lumens-${space.id}`} 
                    type="number"
                    min="0"
                    placeholder="e.g., 3000" 
                    value={space.beamer_lumens}
                    onChange={(e) => updateEventSpace(space.id!, "beamer_lumens", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`presentation_software-${space.id}`}>Presentation Software</Label>
                  <Input 
                    id={`presentation_software-${space.id}`} 
                    placeholder="e.g., PowerPoint, Keynote, Google Slides" 
                    value={space.presentation_software}
                    onChange={(e) => updateEventSpace(space.id!, "presentation_software", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`copy_fee-${space.id}`}>Copy Fee (€)</Label>
                  <div className="relative">
                    <Input 
                      id={`copy_fee-${space.id}`} 
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Fee per copy" 
                      value={space.copy_fee}
                      onChange={(e) => updateEventSpace(space.id!, "copy_fee", e.target.value)}
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      €
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`has_daylight-${space.id}`}
                    checked={space.has_daylight}
                    onCheckedChange={(checked) => updateFeature(space.id!, "has_daylight", !!checked)}
                  />
                  <Label htmlFor={`has_daylight-${space.id}`} className="text-sm font-normal">
                    Natural Light
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`has_blackout-${space.id}`}
                    checked={space.has_blackout}
                    onCheckedChange={(checked) => updateFeature(space.id!, "has_blackout", !!checked)}
                  />
                  <Label htmlFor={`has_blackout-${space.id}`} className="text-sm font-normal">
                    Blackout Capability
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`is_soundproof-${space.id}`}
                    checked={space.is_soundproof}
                    onCheckedChange={(checked) => updateFeature(space.id!, "is_soundproof", !!checked)}
                  />
                  <Label htmlFor={`is_soundproof-${space.id}`} className="text-sm font-normal">
                    Soundproof
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`has_climate_control-${space.id}`}
                    checked={space.has_climate_control}
                    onCheckedChange={(checked) => updateFeature(space.id!, "has_climate_control", !!checked)}
                  />
                  <Label htmlFor={`has_climate_control-${space.id}`} className="text-sm font-normal">
                    Climate Control
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`supports_hybrid-${space.id}`}
                    checked={space.supports_hybrid}
                    onCheckedChange={(checked) => updateFeature(space.id!, "supports_hybrid", !!checked)}
                  />
                  <Label htmlFor={`supports_hybrid-${space.id}`} className="text-sm font-normal">
                    Hybrid Capability
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`has_tech_support-${space.id}`}
                    checked={space.has_tech_support}
                    onCheckedChange={(checked) => updateFeature(space.id!, "has_tech_support", !!checked)}
                  />
                  <Label htmlFor={`has_tech_support-${space.id}`} className="text-sm font-normal">
                    Tech Support
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={handlePrevious} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        <Button type="button" onClick={handleNext} className="gap-1">
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Add Badge component 
const Badge = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      {children}
    </span>
  );
};

export default EventSpacesForm; 