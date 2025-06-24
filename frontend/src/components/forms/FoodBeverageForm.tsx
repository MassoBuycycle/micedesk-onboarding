import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { upsertFoodBeverageDetails } from "@/apiClient/fbDetailsApi";
import { Restaurant, Bar, FoodBeverageDetails } from "@/types/foodBeverage";
import PhoneInput from '@/components/shared/PhoneInput';
import SuccessDialog from '@/components/dialogs/SuccessDialog';

// Fallback UUID generator for environments where crypto.randomUUID() is not available
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Props definition
interface FoodBeverageFormProps {
  initialData?: Partial<FoodBeverageDetails & { restaurants: Restaurant[]; bars: Bar[] }>;
  selectedHotel: any;
  onNext: (data: FoodBeverageDetails & { restaurants: Restaurant[]; bars: Bar[] }) => void;
  onPrevious: (data: FoodBeverageDetails & { restaurants: Restaurant[]; bars: Bar[] }) => void;
  onChange?: (data: FoodBeverageDetails & { restaurants: Restaurant[]; bars: Bar[] }) => void;
  isLastStep?: boolean;
  mode?: 'add' | 'edit';
}

const initialRestaurantState: Restaurant = {
  name: "",
  cuisine: "",
  seats_indoor: 0,
  seats_outdoor: 0,
  exclusive_booking: false,
  minimum_price: 0,
  opening_hours: ""
};

const initialBarState: Bar = {
  name: "",
  seats_indoor: 0,
  seats_outdoor: 0,
  exclusive_booking: false,
  opening_hours: "",
  snacks_available: false
};

const FoodBeverageForm = ({ 
  initialData = {}, 
  selectedHotel, 
  onNext, 
  onPrevious, 
  onChange,
  isLastStep = false,
  mode = 'add'
}: FoodBeverageFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Early return with error handling if selectedHotel is not provided
  if (!selectedHotel) {
    console.error("❌ FoodBeverageForm: selectedHotel is required but not provided");
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Missing Hotel Information</h3>
        <p className="text-red-700">
          Hotel information is required to display the Food & Beverage form. Please ensure a hotel is selected.
        </p>
      </div>
    );
  }
  
  // Helper function to ensure values are primitive and not objects
  const ensurePrimitiveValue = (value: any, defaultValue: any, type: 'string' | 'number' | 'boolean') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'object') return defaultValue;
    
    switch (type) {
      case 'string':
        return typeof value === 'string' ? value : String(value);
      case 'number':
        return typeof value === 'number' ? value : (isNaN(Number(value)) ? defaultValue : Number(value));
      case 'boolean':
        return typeof value === 'boolean' ? value : Boolean(value);
      default:
        return defaultValue;
    }
  };
  
  // Helper function to sanitize restaurant data
  const sanitizeRestaurant = (restaurant: any): Restaurant => ({
    id: restaurant?.id || generateId(),
    name: ensurePrimitiveValue(restaurant?.name, "", 'string'),
    cuisine: ensurePrimitiveValue(restaurant?.cuisine, "", 'string'),
    seats_indoor: ensurePrimitiveValue(restaurant?.seats_indoor, 0, 'number'),
    seats_outdoor: ensurePrimitiveValue(restaurant?.seats_outdoor, 0, 'number'),
    exclusive_booking: ensurePrimitiveValue(restaurant?.exclusive_booking, false, 'boolean'),
    minimum_price: ensurePrimitiveValue(restaurant?.minimum_price, 0, 'number'),
    opening_hours: ensurePrimitiveValue(restaurant?.opening_hours, "", 'string'),
  });
  
  // Helper function to sanitize bar data
  const sanitizeBar = (bar: any): Bar => ({
    id: bar?.id || generateId(),
    name: ensurePrimitiveValue(bar?.name, "", 'string'),
    seats_indoor: ensurePrimitiveValue(bar?.seats_indoor, 0, 'number'),
    seats_outdoor: ensurePrimitiveValue(bar?.seats_outdoor, 0, 'number'),
    exclusive_booking: ensurePrimitiveValue(bar?.exclusive_booking, false, 'boolean'),
    opening_hours: ensurePrimitiveValue(bar?.opening_hours, "", 'string'),
    snacks_available: ensurePrimitiveValue(bar?.snacks_available, false, 'boolean'),
  });
  
  // Debug the initial data
  console.log("🔍 FoodBeverageForm initialData received:", initialData);
  console.log("🔍 Restaurants in initialData:", initialData.restaurants);
  console.log("🔍 Bars in initialData:", initialData.bars);
  
  const [formData, setFormData] = useState<FoodBeverageDetails>({
    hotel_id: selectedHotel?.id || 0,
    fnb_contact_name: ensurePrimitiveValue(initialData?.fnb_contact_name, "", 'string'),
    fnb_contact_position: ensurePrimitiveValue(initialData?.fnb_contact_position, "", 'string'),
    fnb_contact_phone: ensurePrimitiveValue(initialData?.fnb_contact_phone, "", 'string'),
    fnb_contact_email: ensurePrimitiveValue(initialData?.fnb_contact_email, "", 'string'),
    total_restaurants: ensurePrimitiveValue(initialData?.total_restaurants, 0, 'number'),
    restaurants: [],
    bars: [],
    room_service_available: ensurePrimitiveValue(initialData?.room_service_available, false, 'boolean'),
    room_service_hours: ensurePrimitiveValue(initialData?.room_service_hours, "", 'string'),
    breakfast_restaurant_name: ensurePrimitiveValue(initialData?.breakfast_restaurant_name, "", 'string'),
    breakfast_hours: ensurePrimitiveValue(initialData?.breakfast_hours, "", 'string'),
    breakfast_cost_per_person: ensurePrimitiveValue(initialData?.breakfast_cost_per_person, 0, 'number'),
    breakfast_cost_per_child: ensurePrimitiveValue(initialData?.breakfast_cost_per_child, 0, 'number'),
    breakfast_child_pricing_tiers: ensurePrimitiveValue(initialData?.breakfast_child_pricing_tiers, "", 'string'),
    breakfast_room_used_for_events: ensurePrimitiveValue(initialData?.breakfast_room_used_for_events, false, 'boolean'),
    staff_planning_lead_time: ensurePrimitiveValue(initialData?.staff_planning_lead_time, "", 'string'),
    special_diet_allergy_deadline: ensurePrimitiveValue(initialData?.special_diet_allergy_deadline, "", 'string'),
    conference_packages_offered: ensurePrimitiveValue(initialData?.conference_packages_offered, "", 'string'),
    additional_packages_bookable: ensurePrimitiveValue(initialData?.additional_packages_bookable, false, 'boolean'),
    existing_packages_customizable: ensurePrimitiveValue(initialData?.existing_packages_customizable, false, 'boolean'),
    coffee_break_inclusions: ensurePrimitiveValue(initialData?.coffee_break_inclusions, "", 'string'),
    standard_lunch_offerings: ensurePrimitiveValue(initialData?.standard_lunch_offerings, "", 'string'),
    buffet_minimum_persons: ensurePrimitiveValue(initialData?.buffet_minimum_persons, 0, 'number'),
    additional_packages_available: ensurePrimitiveValue(initialData?.additional_packages_available, "", 'string'),
    functions_created_by: ensurePrimitiveValue(initialData?.functions_created_by, "", 'string'),
    functions_completion_deadline: ensurePrimitiveValue(initialData?.functions_completion_deadline, "", 'string'),
    departments_requiring_functions: ensurePrimitiveValue(initialData?.departments_requiring_functions, "", 'string'),
    function_meeting_schedule: ensurePrimitiveValue(initialData?.function_meeting_schedule, "", 'string'),
    function_meeting_participants: ensurePrimitiveValue(initialData?.function_meeting_participants, "", 'string'),
    mice_desk_involvement: ensurePrimitiveValue(initialData?.mice_desk_involvement, "", 'string')
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const sanitizedRestaurants = initialData.restaurants && Array.isArray(initialData.restaurants) && initialData.restaurants.length > 0 
      ? initialData.restaurants.map(sanitizeRestaurant)
      : [{ id: generateId(), ...initialRestaurantState }];
    console.log("🔍 Sanitized restaurants:", sanitizedRestaurants);
    return sanitizedRestaurants;
  });

  const [bars, setBars] = useState<Bar[]>(() => {
    const sanitizedBars = initialData.bars && Array.isArray(initialData.bars) && initialData.bars.length > 0 
      ? initialData.bars.map(sanitizeBar) 
      : [{ id: generateId(), ...initialBarState }];
    console.log("🔍 Sanitized bars:", sanitizedBars);
    return sanitizedBars;
  });

  const updateField = (field: keyof FoodBeverageDetails, value: any) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedData);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange({ ...updatedData, restaurants, bars });
    }
  };

  // Restaurant management functions
  const addRestaurant = () => {
    const updatedRestaurants = [
      ...restaurants,
      { id: generateId(), ...initialRestaurantState }
    ];
    
    setRestaurants(updatedRestaurants);
    updateField('total_restaurants', updatedRestaurants.length);
    
    if (onChange) {
      onChange({ ...formData, restaurants: updatedRestaurants, bars });
    }
  };

  const removeRestaurant = (id: number | string) => {
    if (restaurants.length === 1) {
      toast.error("Es muss mindestens ein Restaurant vorhanden sein");
      return;
    }
    
    const updatedRestaurants = restaurants.filter(restaurant => restaurant.id !== id);
    setRestaurants(updatedRestaurants);
    updateField('total_restaurants', updatedRestaurants.length);
    
    if (onChange) {
      onChange({ ...formData, restaurants: updatedRestaurants, bars });
    }
  };

  const updateRestaurant = (id: number | string, field: keyof Restaurant, value: any) => {
    const updatedRestaurants = restaurants.map(restaurant => 
      restaurant.id === id ? { ...restaurant, [field]: value } : restaurant
    );
    
    setRestaurants(updatedRestaurants);
    
    if (onChange) {
      onChange({ ...formData, restaurants: updatedRestaurants, bars });
    }
  };

  // Bar management functions
  const addBar = () => {
    const updatedBars = [
      ...bars,
      { id: generateId(), ...initialBarState }
    ];
    
    setBars(updatedBars);
    
    if (onChange) {
      onChange({ ...formData, restaurants, bars: updatedBars });
    }
  };

  const removeBar = (id: number | string) => {
    if (bars.length === 1) {
      toast.error("Es muss mindestens eine Bar vorhanden sein");
      return;
    }
    
    const updatedBars = bars.filter(bar => bar.id !== id);
    setBars(updatedBars);
    
    if (onChange) {
      onChange({ ...formData, restaurants, bars: updatedBars });
    }
  };

  const updateBar = (id: number | string, field: keyof Bar, value: any) => {
    const updatedBars = bars.map(bar => 
      bar.id === id ? { ...bar, [field]: value } : bar
    );
    
    setBars(updatedBars);
    
    if (onChange) {
      onChange({ ...formData, restaurants, bars: updatedBars });
    }
  };

  const handleNext = () => {
    // Basic validation
    const isValidRestaurants = restaurants.every(restaurant => 
      restaurant.name && restaurant.name.trim() !== ""
    );
    const isValidBars = bars.every(bar => 
      bar.name && bar.name.trim() !== ""
    );

    if (!isValidRestaurants) {
      toast.error("Alle Restaurants müssen einen Namen haben");
      return;
    }
    
    if (!isValidBars) {
      toast.error("Alle Bars müssen einen Namen haben");
      return;
    }

    onNext({ ...formData, restaurants, bars });
  };

  const handlePrevious = () => {
    onPrevious({ ...formData, restaurants, bars });
  };

  const handleSubmit = async () => {
    // Validate first
    const isValidRestaurants = restaurants.every(restaurant => 
      restaurant.name && restaurant.name.trim() !== ""
    );
    const isValidBars = bars.every(bar => 
      bar.name && bar.name.trim() !== ""
    );

    if (!isValidRestaurants || !isValidBars) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus");
      return;
    }

    // Update the formData for the parent component
    onNext({ ...formData, restaurants, bars });
    
    // Submit the form data
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        restaurants,
        bars
      };
      const hotelId = selectedHotel?.id;
      if (!hotelId) {
        throw new Error("Hotel ID is missing for F&B submission");
      }
      await upsertFoodBeverageDetails(hotelId, payload);
      console.log("✅ F&B details saved for hotel", hotelId);
      
      // Show success dialog instead of immediate navigation
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Fehler beim Hinzufügen des Hotels", {
        description: "Bitte versuchen Sie es später erneut."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
      if (initialData.restaurants) {
        setRestaurants(initialData.restaurants);
      }
      if (initialData.bars) {
        setBars(initialData.bars);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (onChange && Object.keys(formData).length > 0) {
      onChange({ ...formData, restaurants, bars });
    }
  }, []);

  useEffect(() => {
    // Fetch F&B details in edit mode if we didn't receive them via props
    const loadFnbDetails = async () => {
      if (mode !== 'edit') return;
      if (!selectedHotel?.id) return;
      const hasInitialRestaurants = Array.isArray(initialData.restaurants) && initialData.restaurants.length > 0;
      const hasInitialBars = Array.isArray(initialData.bars) && initialData.bars.length > 0;
      if (hasInitialRestaurants || hasInitialBars) return; // already have data
      try {
        const { getFoodBeverageDetails } = await import('@/apiClient/fbDetailsApi');
        const details = await getFoodBeverageDetails(selectedHotel.id);
        if (details) {
          console.log('✅ Loaded F&B details from API:', details);
          // Sanitize restaurants & bars
          const sanitizedRestaurants = Array.isArray(details.restaurants) ? details.restaurants.map(sanitizeRestaurant) : [];
          const sanitizedBars = Array.isArray(details.bars) ? details.bars.map(sanitizeBar) : [];
          if (sanitizedRestaurants.length > 0) setRestaurants(sanitizedRestaurants);
          if (sanitizedBars.length > 0) setBars(sanitizedBars);
          // Merge other scalar fields into formData
          setFormData(prev => ({
            ...prev,
            ...details,
            restaurants: sanitizedRestaurants,
            bars: sanitizedBars,
          }));
        }
      } catch (err) {
        console.error('Failed to load F&B details:', err);
      }
    };
    loadFnbDetails();
  }, [mode, selectedHotel?.id]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Food & Beverage Informationen</h2>
        <p className="text-muted-foreground">
          Geben Sie F&B-Informationen für {selectedHotel.name || "dieses Hotel"} ein
        </p>
      </div>

      {/* Contact Details - Ansprechpartner */}
      <Card>
        <CardHeader>
          <CardTitle>Ansprechpartner</CardTitle>
          <CardDescription>Kontaktdaten der verantwortlichen Person</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_name">Name Ansprechpartner</Label>
            <Input 
              id="fnb_contact_name" 
              value={typeof formData.fnb_contact_name === 'object' ? '' : formData.fnb_contact_name} 
              onChange={(e) => updateField("fnb_contact_name", e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_position">Position</Label>
            <Input 
              id="fnb_contact_position" 
              value={typeof formData.fnb_contact_position === 'object' ? '' : formData.fnb_contact_position} 
              onChange={(e) => updateField("fnb_contact_position", e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_email">E-Mail</Label>
            <Input 
              id="fnb_contact_email" 
              type="email" 
              value={typeof formData.fnb_contact_email === 'object' ? '' : formData.fnb_contact_email} 
              onChange={(e) => updateField("fnb_contact_email", e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_phone">Telefon</Label>
            <PhoneInput
              value={typeof formData.fnb_contact_phone === 'object' ? '' : (formData.fnb_contact_phone as string)}
              onChange={(val) => updateField('fnb_contact_phone', val)}
              placeholder="+49 123 456789"
            />
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Restaurants</h3>
            <p className="text-muted-foreground">Gesamtzahl der Restaurants: {restaurants.length}</p>
          </div>
          <Button onClick={addRestaurant} variant="outline" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Restaurant hinzufügen
          </Button>
        </div>

        {restaurants.map((restaurant, index) => (
          <Card key={restaurant.id} className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Restaurant {index + 1}</CardTitle>
                </div>
                {restaurants.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeRestaurant(restaurant.id!)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`restaurant-name-${restaurant.id}`}>Name Restaurant*</Label>
                <Input 
                  id={`restaurant-name-${restaurant.id}`}
                  value={typeof restaurant.name === 'object' ? '' : restaurant.name}
                  onChange={(e) => updateRestaurant(restaurant.id!, "name", e.target.value)}
                  placeholder="Name des Restaurants"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`restaurant-cuisine-${restaurant.id}`}>Küche</Label>
                <Input 
                  id={`restaurant-cuisine-${restaurant.id}`}
                  value={typeof restaurant.cuisine === 'object' ? '' : restaurant.cuisine}
                  onChange={(e) => updateRestaurant(restaurant.id!, "cuisine", e.target.value)}
                  placeholder="Art der Küche"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`restaurant-seats-indoor-${restaurant.id}`}>Sitzplätze innen</Label>
                <Input 
                  id={`restaurant-seats-indoor-${restaurant.id}`}
                  type="number" 
                  min="0"
                  value={typeof restaurant.seats_indoor === 'object' ? '0' : restaurant.seats_indoor}
                  onChange={(e) => updateRestaurant(restaurant.id!, "seats_indoor", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`restaurant-seats-outdoor-${restaurant.id}`}>Sitzplätze außen</Label>
                <Input 
                  id={`restaurant-seats-outdoor-${restaurant.id}`}
                  type="number" 
                  min="0"
                  value={typeof restaurant.seats_outdoor === 'object' ? '0' : restaurant.seats_outdoor}
                  onChange={(e) => updateRestaurant(restaurant.id!, "seats_outdoor", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`restaurant-exclusive-${restaurant.id}`}>Kann das Restaurant exklusiv gemietet werden?</Label>
                  <Switch 
                    id={`restaurant-exclusive-${restaurant.id}`}
                    checked={typeof restaurant.exclusive_booking === 'object' ? false : restaurant.exclusive_booking}
                    onCheckedChange={(val) => updateRestaurant(restaurant.id!, "exclusive_booking", val)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`restaurant-minimum-${restaurant.id}`}>Mindestumsatz (€)</Label>
                <Input 
                  id={`restaurant-minimum-${restaurant.id}`}
                  type="number" 
                  min="0"
                  value={typeof restaurant.minimum_price === 'object' ? '0' : restaurant.minimum_price}
                  onChange={(e) => updateRestaurant(restaurant.id!, "minimum_price", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`restaurant-hours-${restaurant.id}`}>Öffnungszeiten</Label>
                <Input 
                  id={`restaurant-hours-${restaurant.id}`}
                  value={typeof restaurant.opening_hours === 'object' ? '' : restaurant.opening_hours}
                  onChange={(e) => updateRestaurant(restaurant.id!, "opening_hours", e.target.value)}
                  placeholder="z.B. 12:00-22:00"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bars Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Bars</h3>
            <p className="text-muted-foreground">Anzahl Bars: {bars.length}</p>
          </div>
          <Button onClick={addBar} variant="outline" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Bar hinzufügen
          </Button>
        </div>

        {bars.map((bar, index) => (
          <Card key={bar.id} className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Bar {index + 1}</CardTitle>
                </div>
                {bars.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeBar(bar.id!)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`bar-name-${bar.id}`}>Name der Bar*</Label>
                <Input 
                  id={`bar-name-${bar.id}`}
                  value={typeof bar.name === 'object' ? '' : bar.name}
                  onChange={(e) => updateBar(bar.id!, "name", e.target.value)}
                  placeholder="Name der Bar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`bar-seats-${bar.id}`}>Sitzplätze innen</Label>
                <Input 
                  id={`bar-seats-${bar.id}`}
                  type="number" 
                  min="0"
                  value={typeof bar.seats_indoor === 'object' ? '0' : bar.seats_indoor}
                  onChange={(e) => updateBar(bar.id!, "seats_indoor", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`bar-seats-outdoor-${bar.id}`}>Sitzplätze außen</Label>
                <Input 
                  id={`bar-seats-outdoor-${bar.id}`}
                  type="number" 
                  min="0"
                  value={typeof bar.seats_outdoor === 'object' ? '0' : bar.seats_outdoor}
                  onChange={(e) => updateBar(bar.id!, "seats_outdoor", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`bar-exclusive-${bar.id}`}>Kann die Bar exklusiv gemietet werden?</Label>
                  <Switch 
                    id={`bar-exclusive-${bar.id}`}
                    checked={typeof bar.exclusive_booking === 'object' ? false : bar.exclusive_booking}
                    onCheckedChange={(val) => updateBar(bar.id!, "exclusive_booking", val)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`bar-snacks-${bar.id}`}>Bietet ihr Snacks an der Bar an?</Label>
                  <Switch 
                    id={`bar-snacks-${bar.id}`}
                    checked={typeof bar.snacks_available === 'object' ? false : bar.snacks_available}
                    onCheckedChange={(val) => updateBar(bar.id!, "snacks_available", val)}
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor={`bar-hours-${bar.id}`}>Öffnungszeiten</Label>
                <Input 
                  id={`bar-hours-${bar.id}`}
                  value={typeof bar.opening_hours === 'object' ? '' : bar.opening_hours}
                  onChange={(e) => updateBar(bar.id!, "opening_hours", e.target.value)}
                  placeholder="z.B. 18:00-02:00"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Room Service */}
      <Card>
        <CardHeader>
          <CardTitle>Room Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="room_service_available">Room Service verfügbar</Label>
              <Switch 
                id="room_service_available"
                checked={formData.room_service_available}
                onCheckedChange={(val) => updateField("room_service_available", val)}
              />
            </div>
            {formData.room_service_available && (
              <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                <Label htmlFor="room_service_hours">Servicezeiten</Label>
                <Input 
                  id="room_service_hours"
                  value={typeof formData.room_service_hours === 'object' ? '' : formData.room_service_hours}
                  onChange={(e) => updateField("room_service_hours", e.target.value)}
                  placeholder="z.B. 06:00-23:00 oder 24h"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Breakfast - Frühstück */}
      <Card>
        <CardHeader>
          <CardTitle>Frühstück</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="breakfast_restaurant_name">Name des Restaurants</Label>
            <Input 
              id="breakfast_restaurant_name"
              value={typeof formData.breakfast_restaurant_name === 'object' ? '' : formData.breakfast_restaurant_name}
              onChange={(e) => updateField("breakfast_restaurant_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakfast_hours">Frühstückszeiten</Label>
            <Input 
              id="breakfast_hours"
              value={typeof formData.breakfast_hours === 'object' ? '' : formData.breakfast_hours}
              onChange={(e) => updateField("breakfast_hours", e.target.value)}
              placeholder="z.B. 06:30-10:30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakfast_cost_per_person">Kosten pro Person (€)</Label>
            <Input 
              id="breakfast_cost_per_person"
              type="number" 
              min="0"
              value={typeof formData.breakfast_cost_per_person === 'object' ? '0' : formData.breakfast_cost_per_person}
              onChange={(e) => updateField("breakfast_cost_per_person", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakfast_cost_per_child">Kosten pro Kind (€)</Label>
            <Input 
              id="breakfast_cost_per_child"
              type="number" 
              min="0"
              value={typeof formData.breakfast_cost_per_child === 'object' ? '0' : formData.breakfast_cost_per_child}
              onChange={(e) => updateField("breakfast_cost_per_child", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="breakfast_child_pricing_tiers">Kosten pro Kind (Preisstaffelung)</Label>
            <Textarea 
              id="breakfast_child_pricing_tiers"
              value={typeof formData.breakfast_child_pricing_tiers === 'object' ? '' : formData.breakfast_child_pricing_tiers}
              onChange={(e) => updateField("breakfast_child_pricing_tiers", e.target.value)}
              placeholder="z.B. 0-3 Jahre kostenlos, 4-12 Jahre 50% Rabatt"
            />
          </div>
          <div className="space-y-4 col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="breakfast_room_used_for_events">Wird das Frühstücksraum auch für Events genutzt?</Label>
              <Switch 
                id="breakfast_room_used_for_events"
                checked={formData.breakfast_room_used_for_events}
                onCheckedChange={(val) => updateField("breakfast_room_used_for_events", val)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Handling</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="staff_planning_lead_time">Wie lange im Voraus findet die Personalplanung statt?</Label>
            <Input 
              id="staff_planning_lead_time"
              value={typeof formData.staff_planning_lead_time === 'object' ? '' : formData.staff_planning_lead_time}
              onChange={(e) => updateField("staff_planning_lead_time", e.target.value)}
              placeholder="z.B. 2 Wochen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="special_diet_allergy_deadline">Wie lange im Voraus müssen spezielle Diäten oder Allergien bekannt sein?</Label>
            <Input 
              id="special_diet_allergy_deadline"
              value={typeof formData.special_diet_allergy_deadline === 'object' ? '' : formData.special_diet_allergy_deadline}
              onChange={(e) => updateField("special_diet_allergy_deadline", e.target.value)}
              placeholder="z.B. 48 Stunden"
            />
          </div>
        </CardContent>
      </Card>

      {/* F&B Packages */}
      <Card>
        <CardHeader>
          <CardTitle>F&B Packages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="conference_packages_offered">Welche Tagungspauschalen werden angeboten?</Label>
            <Textarea 
              id="conference_packages_offered"
              value={typeof formData.conference_packages_offered === 'object' ? '' : formData.conference_packages_offered}
              onChange={(e) => updateField("conference_packages_offered", e.target.value)}
              placeholder="Beschreiben Sie die verfügbaren Tagungspauschalen"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="additional_packages_bookable">Können Zusatzbausteine zu den Pauschalen dazugebucht werden?</Label>
                <Switch 
                  id="additional_packages_bookable"
                  checked={formData.additional_packages_bookable}
                  onCheckedChange={(val) => updateField("additional_packages_bookable", val)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="existing_packages_customizable">Können die bestehenden Pauschalen individuell vom Kunden angepasst werden?</Label>
                <Switch 
                  id="existing_packages_customizable"
                  checked={formData.existing_packages_customizable}
                  onCheckedChange={(val) => updateField("existing_packages_customizable", val)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee_break_inclusions">Was ist in den Kaffeepausen enthalten?</Label>
            <Textarea 
              id="coffee_break_inclusions"
              value={typeof formData.coffee_break_inclusions === 'object' ? '' : formData.coffee_break_inclusions}
              onChange={(e) => updateField("coffee_break_inclusions", e.target.value)}
              placeholder="Beschreiben Sie die Inklusivleistungen der Kaffeepausen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="standard_lunch_offerings">Was wird standardmäßig zum Mittagessen angeboten?</Label>
            <Textarea 
              id="standard_lunch_offerings"
              value={typeof formData.standard_lunch_offerings === 'object' ? '' : formData.standard_lunch_offerings}
              onChange={(e) => updateField("standard_lunch_offerings", e.target.value)}
              placeholder="Beschreiben Sie das Standard-Mittagsangebot"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buffet_minimum_persons">Ab wievielen Personen wird ein Buffet angeboten?</Label>
            <Input 
              id="buffet_minimum_persons"
              type="number" 
              min="0"
              value={typeof formData.buffet_minimum_persons === 'object' ? '0' : formData.buffet_minimum_persons}
              onChange={(e) => updateField("buffet_minimum_persons", parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_packages_available">Gibt es weitere Pauschalen, z.B. Getränkepauschalen?</Label>
            <Textarea 
              id="additional_packages_available"
              value={typeof formData.additional_packages_available === 'object' ? '' : formData.additional_packages_available}
              onChange={(e) => updateField("additional_packages_available", e.target.value)}
              placeholder="Beschreiben Sie weitere verfügbare Pakete"
            />
          </div>
        </CardContent>
      </Card>

      {/* Functions */}
      <Card>
        <CardHeader>
          <CardTitle>Functions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="functions_created_by">Wie werden die Functions erstellt?</Label>
            <Input 
              id="functions_created_by"
              value={typeof formData.functions_created_by === 'object' ? '' : formData.functions_created_by}
              onChange={(e) => updateField("functions_created_by", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="functions_completion_deadline">Wann müssen die Functions fertig sein?</Label>
            <Input 
              id="functions_completion_deadline"
              value={typeof formData.functions_completion_deadline === 'object' ? '' : formData.functions_completion_deadline}
              onChange={(e) => updateField("functions_completion_deadline", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departments_requiring_functions">Welche Abteilungen benötigen Functions?</Label>
            <Input 
              id="departments_requiring_functions"
              value={typeof formData.departments_requiring_functions === 'object' ? '' : formData.departments_requiring_functions}
              onChange={(e) => updateField("departments_requiring_functions", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="function_meeting_schedule">Wann findet das Functionsmeeting statt und wie?</Label>
            <Input 
              id="function_meeting_schedule"
              value={typeof formData.function_meeting_schedule === 'object' ? '' : formData.function_meeting_schedule}
              onChange={(e) => updateField("function_meeting_schedule", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="function_meeting_participants">Wer ist beim Functionmeeting dabei?</Label>
            <Input 
              id="function_meeting_participants"
              value={typeof formData.function_meeting_participants === 'object' ? '' : formData.function_meeting_participants}
              onChange={(e) => updateField("function_meeting_participants", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mice_desk_involvement">In welcher Form sollte MICE DESK anwesend sein?</Label>
            <Textarea 
              id="mice_desk_involvement"
              value={typeof formData.mice_desk_involvement === 'object' ? '' : formData.mice_desk_involvement}
              onChange={(e) => updateField("mice_desk_involvement", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={handlePrevious} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Button>
        
        {isLastStep ? (
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-1"
          >
            {isSubmitting ? "Speichere..." : "Hotel hinzufügen"}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} className="gap-1">
            Weiter <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Success Dialog */}
      <SuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="F&B Details Successfully Saved!"
        description="All Food & Beverage information has been saved successfully."
        hotelId={selectedHotel?.id}
        hotelName={selectedHotel?.name}
        redirectDelay={3}
      />
    </div>
  );
};

export default FoodBeverageForm;
