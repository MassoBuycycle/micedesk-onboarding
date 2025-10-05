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
import { useTranslation } from 'react-i18next';
import { deleteEventSpace } from '@/apiClient/eventsApi';

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
}

// Props definition
interface EventSpacesFormProps {
  initialData?: EventSpace[];
  selectedHotel: any;
  createdEventId?: number | null;
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
  cap_rounds: "",
  cap_theatre: "",
  cap_classroom: "",
  cap_u_shape: "",
  cap_boardroom: "",
  cap_cabaret: "",
  cap_cocktail: "",
  features: ""
};

const EventSpacesForm = ({ initialData = [], selectedHotel, createdEventId, onNext, onPrevious, onChange, mode }: EventSpacesFormProps) => {
  const { t } = useTranslation();
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
  const removeEventSpace = async (id: number | string) => {
    if (spaces.length === 1) {
      toast.error(t('events.eventForm.spaces.mustHaveOne'));
      return;
    }
    
    // If the space has a numeric ID, it exists in the database and needs to be deleted via API
    if (typeof id === 'number' && mode === 'edit' && createdEventId) {
      try {
        await deleteEventSpace(createdEventId, id);
        toast.success('Event space deleted successfully');
      } catch (error) {
        toast.error('Failed to delete event space. Please try again.');
        return; // Don't remove from local state if API call fails
      }
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
  

  
  // Handle form submission to proceed to next step
  const handleNext = () => {
    // Basic validation
    const isValid = spaces.every(space => 
      space.name && space.name.trim() !== ""
    );

    if (!isValid) {
      toast.error(t('events.eventForm.spaces.validationRequired'));
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('events.eventForm.spaces.title')}</h2>
        <p className="text-muted-foreground">
          {t('events.eventForm.spaces.subtitle')} {selectedHotel?.name || "this hotel"}
        </p>
      </div>

      {/* List of Event Spaces */}
      {spaces.map((space, index) => (
        <Card key={space.id} className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{t('events.eventForm.spaces.spaceNumber')} {index + 1}</CardTitle>
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
                  onChange={(e) => updateEventSpace(space.id!, "name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`cap_cocktail-${space.id}`}>{t('events.eventForm.spaces.maximumCapacity')}*</Label>
                <Input 
                  id={`cap_cocktail-${space.id}`} 
                  type="number" 
                  placeholder={t('events.eventForm.spaces.maximumCapacityPlaceholder')}
                  value={space.cap_cocktail}
                  onChange={(e) => updateEventSpace(space.id!, "cap_cocktail", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`size-${space.id}`}>{t('events.eventForm.spaces.sizeSquareMeters')}</Label>
                <Input 
                  id={`size-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.sizePlaceholder')}
                  value={space.size}
                  onChange={(e) => updateEventSpace(space.id!, "size", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`dimensions-${space.id}`}>{t('events.eventForm.spaces.dimensions')}</Label>
                <Input 
                  id={`dimensions-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.dimensionsPlaceholder')}
                  value={space.dimensions}
                  onChange={(e) => updateEventSpace(space.id!, "dimensions", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`daily_rate-${space.id}`}>{t('events.eventForm.spaces.dailyRate')}</Label>
                <div className="relative">
                  <Input 
                    id={`daily_rate-${space.id}`} 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('events.eventForm.spaces.dailyRatePlaceholder')}
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
                <Label htmlFor={`half_day_rate-${space.id}`}>{t('events.eventForm.spaces.halfDayRate')}</Label>
                <div className="relative">
                  <Input 
                    id={`half_day_rate-${space.id}`} 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('events.eventForm.spaces.halfDayRatePlaceholder')}
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
                <Label htmlFor={`features-${space.id}`}>{t('events.eventForm.spaces.description')}</Label>
                <Textarea 
                  id={`features-${space.id}`} 
                  placeholder={t('events.eventForm.spaces.descriptionPlaceholder')}
                  value={space.features}
                  onChange={(e) => updateEventSpace(space.id!, "features", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">{t('events.eventForm.spaces.seatingCapacities')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cap_theatre-${space.id}`}>{t('events.eventForm.spaces.theatre')}</Label>
                  <Input 
                    id={`cap_theatre-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_theatre || ''}
                    onChange={(e) => updateEventSpace(space.id!, "cap_theatre", e.target.value)}
                    placeholder={t('events.eventForm.spaces.theatre')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_classroom-${space.id}`}>{t('events.eventForm.spaces.parliamentary') || t('events.eventForm.spaces.classroom')}</Label>
                  <Input 
                    id={`cap_classroom-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_classroom || ''}
                    onChange={(e) => updateEventSpace(space.id!, "cap_classroom", e.target.value)}
                    placeholder={t('events.eventForm.spaces.parliamentary') || t('events.eventForm.spaces.classroom')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_u_shape-${space.id}`}>{t('events.eventForm.spaces.uShape')}</Label>
                  <Input 
                    id={`cap_u_shape-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_u_shape || ''}
                    onChange={(e) => updateEventSpace(space.id!, "cap_u_shape", e.target.value)}
                    placeholder={t('events.eventForm.spaces.uShape')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_boardroom-${space.id}`}>{t('events.eventForm.spaces.block') || t('events.eventForm.spaces.boardroom')}</Label>
                  <Input 
                    id={`cap_boardroom-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_boardroom || ''}
                    onChange={(e) => updateEventSpace(space.id!, "cap_boardroom", e.target.value)}
                    placeholder={t('events.eventForm.spaces.block') || t('events.eventForm.spaces.boardroom')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_rounds-${space.id}`}>{t('events.eventForm.spaces.roundTables') || t('events.eventForm.spaces.rounds')}</Label>
                  <Input 
                    id={`cap_rounds-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_rounds || ''}
                    onChange={(e) => updateEventSpace(space.id!, "cap_rounds", e.target.value)}
                    placeholder={t('events.eventForm.spaces.roundTables') || t('events.eventForm.spaces.rounds')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cap_cabaret-${space.id}`}>{t('events.eventForm.spaces.cabaret')}</Label>
                  <Input 
                    id={`cap_cabaret-${space.id}`} 
                    type="number"
                    min="0"
                    value={space.cap_cabaret || ''}
                    onChange={(e) => updateEventSpace(space.id!, "cap_cabaret", e.target.value)}
                    placeholder={t('events.eventForm.spaces.cabaret')}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
              </div>
            </div>


          </CardContent>
        </Card>
      ))}

      {/* Add Event Space Button */}
      <div className="flex justify-center">
        <Button onClick={addEventSpace} variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> {t('events.eventForm.spaces.addSpace')}
        </Button>
      </div>

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

// Add Badge component 
const Badge = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      {children}
    </span>
  );
};

export default EventSpacesForm; 