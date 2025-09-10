
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

// Define events info type
interface EventsInfo {
  totalEventSpaces: string;
  largestSpace: string;
  maxCapacity: string;
  eventCoordinator: boolean;
  coordinatorName: string;
  coordinatorContact: string;
  hasAudioVisual: boolean;
  audioVisualEquipment: string;
  cateringAvailable: boolean;
  cateringOptions: string;
  outdoorSpaceAvailable: boolean;
  outdoorSpaceDescription: string;
  eventRestrictions: string;
  eventPackages: string;
  uniqueSellingPoints: string;
}

// Props definition
interface EventsFormProps {
  initialData: Partial<EventsInfo>;
  selectedHotel: any;
  onNext: (data: EventsInfo) => void;
  onPrevious: (data: EventsInfo) => void;
  onChange?: (data: EventsInfo) => void; // New prop for live updates
}

const EventsForm = ({ initialData = {}, selectedHotel, onNext, onPrevious, onChange }: EventsFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EventsInfo>({
    totalEventSpaces: "",
    largestSpace: "",
    maxCapacity: "",
    eventCoordinator: false,
    coordinatorName: "",
    coordinatorContact: "",
    hasAudioVisual: false,
    audioVisualEquipment: "",
    cateringAvailable: false,
    cateringOptions: "",
    outdoorSpaceAvailable: false,
    outdoorSpaceDescription: "",
    eventRestrictions: "",
    eventPackages: "",
    uniqueSellingPoints: "",
    ...initialData
  });

  const updateField = (field: keyof EventsInfo, value: any) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedData);
    
    // Emit the change event for live preview if onChange handler exists
    if (onChange) {
      onChange(updatedData);
    }
  };

  const handleNext = () => {
    // Basic validation
    if (!formData.totalEventSpaces) {
      toast.error(t('forms.validation.requiredField'));
      return;
    }

    onNext(formData);
  };

  const handlePrevious = () => {
    onPrevious(formData);
  };

  useEffect(() => {
    // If the initial data changes, update the form data
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Call onChange with initial data on component mount
  useEffect(() => {
    if (onChange && Object.keys(formData).length > 0) {
      onChange(formData);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{t('events.generalInfo')}</h2>
        <p className="text-muted-foreground">
          {t('events.generalInfoSubtitle', { hotelName: selectedHotel?.name || t('common.thisHotel') })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t('events.overview')}</CardTitle>
              <CardDescription>{t('events.overviewDescription')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalEventSpaces">{t('events.totalSpaces')}*</Label>
              <Input 
                id="totalEventSpaces" 
                type="number" 
                min="0" 
                placeholder={t('events.placeholders.totalSpaces')}
                value={formData.totalEventSpaces}
                onChange={(e) => updateField("totalEventSpaces", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="largestSpace">{t('events.largestSpace')} (qm)</Label>
              <Input 
                id="largestSpace" 
                placeholder={t('events.placeholders.largestSpace')}
                value={formData.largestSpace}
                onChange={(e) => updateField("largestSpace", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">{t('events.maxCapacity')}</Label>
              <Input 
                id="maxCapacity" 
                placeholder={t('events.placeholders.maxCapacity')}
                value={formData.maxCapacity}
                onChange={(e) => updateField("maxCapacity", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="eventCoordinator">{t('events.eventCoordinator')}</Label>
                <Switch 
                  id="eventCoordinator" 
                  checked={formData.eventCoordinator}
                  onCheckedChange={(checked) => updateField("eventCoordinator", checked)}
                />
              </div>
              
              {formData.eventCoordinator && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label htmlFor="coordinatorName">{t('events.coordinatorName')}</Label>
                    <Input 
                      id="coordinatorName" 
                      placeholder={t('events.placeholders.coordinatorName')}
                      value={formData.coordinatorName}
                      onChange={(e) => updateField("coordinatorName", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coordinatorContact">{t('events.coordinatorContact')}</Label>
                    <Input 
                      id="coordinatorContact" 
                      placeholder={t('events.placeholders.coordinatorContact')}
                      value={formData.coordinatorContact}
                      onChange={(e) => updateField("coordinatorContact", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hasAudioVisual">{t('events.audioVisual')}</Label>
                <Switch 
                  id="hasAudioVisual" 
                  checked={formData.hasAudioVisual}
                  onCheckedChange={(checked) => updateField("hasAudioVisual", checked)}
                />
              </div>
              
              {formData.hasAudioVisual && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="audioVisualEquipment">{t('events.availableEquipment')}</Label>
                  <Textarea 
                    id="audioVisualEquipment" 
                    placeholder={t('events.placeholders.audioVisualEquipment')}
                    value={formData.audioVisualEquipment}
                    onChange={(e) => updateField("audioVisualEquipment", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cateringAvailable">{t('events.catering')}</Label>
                <Switch 
                  id="cateringAvailable" 
                  checked={formData.cateringAvailable}
                  onCheckedChange={(checked) => updateField("cateringAvailable", checked)}
                />
              </div>
              
              {formData.cateringAvailable && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="cateringOptions">{t('events.cateringOptions')}</Label>
                  <Textarea 
                    id="cateringOptions" 
                    placeholder={t('events.placeholders.cateringOptions')}
                    value={formData.cateringOptions}
                    onChange={(e) => updateField("cateringOptions", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="outdoorSpaceAvailable">{t('events.outdoorSpace')}</Label>
                <Switch 
                  id="outdoorSpaceAvailable" 
                  checked={formData.outdoorSpaceAvailable}
                  onCheckedChange={(checked) => updateField("outdoorSpaceAvailable", checked)}
                />
              </div>
              
              {formData.outdoorSpaceAvailable && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="outdoorSpaceDescription">{t('events.outdoorSpaceDescription')}</Label>
                  <Textarea 
                    id="outdoorSpaceDescription" 
                    placeholder={t('events.placeholders.outdoorSpaceDescription')}
                    value={formData.outdoorSpaceDescription}
                    onChange={(e) => updateField("outdoorSpaceDescription", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="eventRestrictions">{t('events.restrictions')}</Label>
              <Textarea 
                id="eventRestrictions" 
                placeholder={t('events.placeholders.eventRestrictions')}
                value={formData.eventRestrictions}
                onChange={(e) => updateField("eventRestrictions", e.target.value)}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="eventPackages">{t('events.packages')}</Label>
              <Textarea 
                id="eventPackages" 
                placeholder={t('events.placeholders.eventPackages')}
                value={formData.eventPackages}
                onChange={(e) => updateField("eventPackages", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="uniqueSellingPoints">{t('events.uniqueSellingPoints')}</Label>
              <Textarea 
                id="uniqueSellingPoints" 
                placeholder={t('events.placeholders.uniqueSellingPoints')}
                value={formData.uniqueSellingPoints}
                onChange={(e) => updateField("uniqueSellingPoints", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

export default EventsForm;
