
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, Save, Trash, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

// Define the event space type
interface EventSpace {
  id: string;
  name: string;
  description: string;
  capacity: string;
  size: string;
  ceiling: string;
  layout: string;
  price: string;
  features: string[];
}

// Props definition
interface EventCategoryFormProps {
  initialData: EventSpace[];
  selectedHotel: any;
  onNext: (data: EventSpace[]) => void;
  onPrevious: (data: EventSpace[]) => void;
  onChange?: (data: EventSpace[]) => void; // New prop for live updates
}

const EventCategoryForm = ({ initialData = [], selectedHotel, onNext, onPrevious, onChange }: EventCategoryFormProps) => {
  const { t } = useTranslation();
  // Use initialData if provided, otherwise start with one empty category
  const [eventSpaces, setEventSpaces] = useState<EventSpace[]>(
    initialData.length > 0 
      ? initialData 
      : [{
          id: crypto.randomUUID(),
          name: "",
          description: "",
          capacity: "",
          size: "",
          ceiling: "",
          layout: "",
          price: "",
          features: []
        }]
  );

  const FEATURE_OPTIONS = [
    "Natural Light",
    "Blackout Capability",
    "Built-in AV",
    "Stage",
    "Dance Floor",
    "Podium",
    "WiFi",
    "Teleconferencing",
    "Breakout Rooms",
    "Private Entrance",
    "Outdoor Access",
    "Wheelchair Accessible"
  ];

  const getFeatureLabel = (feature: string) => {
    switch (feature) {
      case "Natural Light":
        return t('eventFeatures.naturalLight');
      case "Blackout Capability":
        return t('eventFeatures.blackoutCapability');
      case "Built-in AV":
        return t('eventFeatures.builtInAv');
      case "Stage":
        return t('eventFeatures.stage');
      case "Dance Floor":
        return t('eventFeatures.danceFloor');
      case "Podium":
        return t('eventFeatures.podium');
      case "WiFi":
        return t('eventFeatures.wifi');
      case "Teleconferencing":
        return t('eventFeatures.teleconferencing');
      case "Breakout Rooms":
        return t('eventFeatures.breakoutRooms');
      case "Private Entrance":
        return t('eventFeatures.privateEntrance');
      case "Outdoor Access":
        return t('eventFeatures.outdoorAccess');
      case "Wheelchair Accessible":
        return t('eventFeatures.wheelchairAccessible');
      default:
        return feature;
    }
  };

  // Function to add a new event space
  const addEventSpace = () => {
    const updatedSpaces = [
      ...eventSpaces,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        capacity: "",
        size: "",
        ceiling: "",
        layout: "",
        price: "",
        features: []
      }
    ];
    
    setEventSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };

  // Function to remove an event space
  const removeEventSpace = (id: string) => {
    if (eventSpaces.length === 1) {
      toast.error(t('events.eventForm.spaces.mustHaveOne'));
      return;
    }
    
    const updatedSpaces = eventSpaces.filter(space => space.id !== id);
    setEventSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };

  // Function to update an event space
  const updateEventSpace = (id: string, field: keyof EventSpace, value: any) => {
    const updatedSpaces = eventSpaces.map(space => 
      space.id === id ? { ...space, [field]: value } : space
    );
    
    setEventSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };

  // Handle form submission
  const handleNext = () => {
    // Basic validation
    const isValid = eventSpaces.every(space => 
      space.name.trim() !== "" && space.capacity.trim() !== ""
    );

    if (!isValid) {
      toast.error(t('events.eventForm.spaces.validationRequired'));
      return;
    }

    onNext(eventSpaces);
  };

  const handlePrevious = () => {
    onPrevious(eventSpaces);
  };

  // Function to update features
  const updateFeatures = (id: string, feature: string, isChecked: boolean) => {
    const updatedSpaces = eventSpaces.map(space => {
      if (space.id === id) {
        let updatedFeatures = [...space.features];
        if (isChecked) {
          updatedFeatures.push(feature);
        } else {
          updatedFeatures = updatedFeatures.filter(f => f !== feature);
        }
        return { ...space, features: updatedFeatures };
      }
      return space;
    });
    
    setEventSpaces(updatedSpaces);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedSpaces);
    }
  };

  // Call onChange with initial data on component mount
  useEffect(() => {
    if (onChange && eventSpaces.length > 0) {
      onChange(eventSpaces);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('events.eventForm.spaces.title')}</h2>
          <p className="text-muted-foreground">
            {t('events.eventForm.spaces.subtitle')} {selectedHotel.name || t('common.thisHotel')}
          </p>
        </div>
        <Button onClick={addEventSpace} variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> {t('events.eventForm.spaces.addSpace')}
        </Button>
      </div>

      {eventSpaces.map((space, index) => (
        <Card key={space.id} className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{t('events.eventForm.spaces.spaceNumber')} {index + 1}</CardTitle>
              </div>
              {eventSpaces.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeEventSpace(space.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription>
              {t('events.eventForm.spaces.enterDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`name-${space.id}`}>{t('events.eventForm.spaces.spaceName')}*</Label>
                <Input 
                  id={`name-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.spaceNamePlaceholder')} 
                  value={space.name}
                  onChange={(e) => updateEventSpace(space.id, "name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`capacity-${space.id}`}>{t('events.eventForm.spaces.maximumCapacity')}*</Label>
                <Input 
                  id={`capacity-${space.id}`} 
                  type="number" 
                  placeholder={t('events.eventForm.spaces.maximumCapacityPlaceholder')} 
                  value={space.capacity}
                  onChange={(e) => updateEventSpace(space.id, "capacity", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`size-${space.id}`}>{t('events.eventForm.spaces.sizeSquareMeters')}</Label>
                <Input 
                  id={`size-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.sizePlaceholder')} 
                  value={space.size}
                  onChange={(e) => updateEventSpace(space.id, "size", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`ceiling-${space.id}`}>{t('events.eventForm.spaces.ceilingHeight')} (m)</Label>
                <Input 
                  id={`ceiling-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.ceilingHeightPlaceholder')} 
                  value={space.ceiling}
                  onChange={(e) => updateEventSpace(space.id, "ceiling", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`layout-${space.id}`}>{t('events.eventForm.spaces.availableLayouts')}</Label>
                <Select 
                  value={space.layout} 
                  onValueChange={(value) => updateEventSpace(space.id, "layout", value)}
                >
                  <SelectTrigger id={`layout-${space.id}`}>
                    <SelectValue placeholder={t('events.eventForm.spaces.selectPrimaryLayout')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theater">{t('events.eventForm.spaces.theatre')}</SelectItem>
                    <SelectItem value="classroom">{t('events.eventForm.spaces.classroom')}</SelectItem>
                    <SelectItem value="boardroom">{t('events.eventForm.spaces.boardroom')}</SelectItem>
                    <SelectItem value="u-shape">{t('events.eventForm.spaces.uShape')}</SelectItem>
                    <SelectItem value="banquet">{t('events.eventForm.spaces.banquet')}</SelectItem>
                    <SelectItem value="reception">{t('events.eventForm.spaces.reception')}</SelectItem>
                    <SelectItem value="hollow-square">{t('events.eventForm.spaces.hollowSquare')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`price-${space.id}`}>{t('events.eventForm.spaces.basePrice')}</Label>
                <Input 
                  id={`price-${space.id}`} 
                  type="number" 
                  placeholder={t('events.eventForm.spaces.basePricePlaceholder')} 
                  value={space.price}
                  onChange={(e) => updateEventSpace(space.id, "price", e.target.value)}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`description-${space.id}`}>{t('events.eventForm.spaces.description')}</Label>
                <Textarea 
                  id={`description-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.descriptionPlaceholder')} 
                  value={space.description}
                  onChange={(e) => updateEventSpace(space.id, "description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('events.eventForm.spaces.availableFeatures')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {FEATURE_OPTIONS.map(feature => (
                  <div key={`${space.id}-${feature}`} className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id={`${space.id}-${feature}`}
                      checked={space.features.includes(feature)}
                      onChange={(e) => updateFeatures(space.id, feature, e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`${space.id}-${feature}`} className="text-sm font-normal">
                      {getFeatureLabel(feature)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={handlePrevious} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> {t('common.previous')}
        </Button>
        <Button type="button" onClick={handleNext} className="gap-1">
          {t('common.next')} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EventCategoryForm;
