import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ArrowLeft, ArrowRight, Save, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { upsertFoodBeverageDetails } from "@/apiClient/fbDetailsApi";

// Define F&B info type
interface FoodBeverageInfo {
  restaurants: string;
  bars: string;
  restaurantNames: string;
  barNames: string;
  cuisine: string;
  specialDiets: string;
  breakfastHours: string;
  lunchHours: string;
  dinnerHours: string;
  roomService: boolean;
  roomServiceHours: string;
  minibar: boolean;
  minibarItems: string;
  executiveLounge: boolean;
  executiveDetails: string;
  banquetCapacity: string;
  outdoorDining: boolean;
  outdoorDiningDetails: string;
  localPartners: string;
  alcoholServed: boolean;
  alcoholTypes: string;
  fnb_contact_name: string;
  fnb_contact_position: string;
  fnb_contact_phone: string;
  fnb_contact_email: string;
  restaurant_name: string;
  restaurant_cuisine: string;
  restaurant_seats: string;
  restaurant_opening_hours: string;
  restaurant_exclusive: boolean;
  restaurant_price_minimum: string;
  bar_name: string;
  bar_seats: string;
  bar_exclusive: boolean;
  bar_snacks_available: boolean;
  bar_opening_hours: string;
  service_times: string;
  breakfast_restaurant_name: string;
  breakfast_start_time: string;
  breakfast_cost_per_person: string;
  breakfast_cost_per_child: string;
  breakfast_event_available: boolean;
  operational_lead_time: string;
  allergy_diet_deadline: string;
  buffet_minimum_persons: string;
  fnb_packages_available: boolean;
  extra_packages_customized: boolean;
  coffee_break_items: string;
  lunch_standard_items: string;
  buffet_minimum_for_lunch: string;
  function_created_by: string;
  function_completion_time: string;
  function_required_depts: string;
  function_meeting_people: string;
  mice_desk_involvement: string;
}

// Props definition
interface FoodBeverageFormProps {
  initialData?: Partial<FoodBeverageInfo>;
  selectedHotel: any;
  onNext: (data: FoodBeverageInfo) => void;
  onPrevious: (data: FoodBeverageInfo) => void;
  onChange?: (data: FoodBeverageInfo) => void;
  isLastStep?: boolean;
  mode?: 'add' | 'edit';
}

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
  
  const [formData, setFormData] = useState<FoodBeverageInfo>({
    restaurants: "",
    bars: "",
    restaurantNames: "",
    barNames: "",
    cuisine: "",
    specialDiets: "",
    breakfastHours: "",
    lunchHours: "",
    dinnerHours: "",
    roomService: false,
    roomServiceHours: "",
    minibar: false,
    minibarItems: "",
    executiveLounge: false,
    executiveDetails: "",
    banquetCapacity: "",
    outdoorDining: false,
    outdoorDiningDetails: "",
    localPartners: "",
    alcoholServed: true,
    alcoholTypes: "",
    fnb_contact_name: "",
    fnb_contact_position: "",
    fnb_contact_phone: "",
    fnb_contact_email: "",
    restaurant_name: "",
    restaurant_cuisine: "",
    restaurant_seats: "",
    restaurant_opening_hours: "",
    restaurant_exclusive: false,
    restaurant_price_minimum: "",
    bar_name: "",
    bar_seats: "",
    bar_exclusive: false,
    bar_snacks_available: false,
    bar_opening_hours: "",
    service_times: "",
    breakfast_restaurant_name: "",
    breakfast_start_time: "",
    breakfast_cost_per_person: "",
    breakfast_cost_per_child: "",
    breakfast_event_available: false,
    operational_lead_time: "",
    allergy_diet_deadline: "",
    buffet_minimum_persons: "",
    fnb_packages_available: false,
    extra_packages_customized: false,
    coffee_break_items: "",
    lunch_standard_items: "",
    buffet_minimum_for_lunch: "",
    function_created_by: "",
    function_completion_time: "",
    function_required_depts: "",
    function_meeting_people: "",
    mice_desk_involvement: "",
    ...initialData
  });

  const updateField = (field: keyof FoodBeverageInfo, value: any) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedData);
    
    // Emit the change event for live preview
    if (onChange) {
      onChange(updatedData);
    }
  };

  const handleNext = () => {
    // Basic validation
    if (!formData.restaurants) {
      toast.error("Number of restaurants is required");
      return;
    }

    onNext(formData);
  };

  const handlePrevious = () => {
    onPrevious(formData);
  };

  const handleSubmit = async () => {
    // Validate first
    if (!formData.restaurants) {
      toast.error("Number of restaurants is required");
      return;
    }

    // Update the formData for the parent component
    onNext(formData);
    
    // Submit the form data
    setIsSubmitting(true);
    
    try {
      // Persist Food & Beverage details to backend
      const payload = {
        // Map form data directly; backend will ignore unknown fields
        ...formData
      };
      const hotelId = selectedHotel?.id;
      if (!hotelId) {
        throw new Error("Hotel ID is missing for F&B submission");
      }
      await upsertFoodBeverageDetails(hotelId, payload);
      console.log("✅ F&B details saved for hotel", hotelId);
      
      toast.success("Hotel successfully added", {
        description: `${selectedHotel.name || "New hotel"} has been added to the database.`
      });
      
      // Navigate to the hotels list page
      navigate("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add hotel", {
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <h2 className="text-2xl font-bold">Food & Beverage Information</h2>
        <p className="text-muted-foreground">
          Enter F&B information for {selectedHotel.name || "this hotel"}
        </p>
      </div>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>F&B Contact</CardTitle>
          <CardDescription>Contact responsible for F&B</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_name">Contact Name</Label>
            <Input id="fnb_contact_name" value={formData.fnb_contact_name} onChange={(e)=>updateField("fnb_contact_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_position">Position</Label>
            <Input id="fnb_contact_position" value={formData.fnb_contact_position} onChange={(e)=>updateField("fnb_contact_position", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_phone">Phone</Label>
            <Input id="fnb_contact_phone" value={formData.fnb_contact_phone} onChange={(e)=>updateField("fnb_contact_phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fnb_contact_email">Email</Label>
            <Input id="fnb_contact_email" type="email" value={formData.fnb_contact_email} onChange={(e)=>updateField("fnb_contact_email", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Details */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="restaurant_name">Name</Label>
            <Input id="restaurant_name" value={formData.restaurant_name} onChange={(e)=>updateField("restaurant_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurant_cuisine">Cuisine</Label>
            <Input id="restaurant_cuisine" value={formData.restaurant_cuisine} onChange={(e)=>updateField("restaurant_cuisine", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurant_seats">Seats</Label>
            <Input id="restaurant_seats" type="number" min="0" value={formData.restaurant_seats} onChange={(e)=>updateField("restaurant_seats", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurant_opening_hours">Opening Hours</Label>
            <Input id="restaurant_opening_hours" value={formData.restaurant_opening_hours} onChange={(e)=>updateField("restaurant_opening_hours", e.target.value)} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="restaurant_exclusive">Exclusive Hire</Label>
              <Switch id="restaurant_exclusive" checked={formData.restaurant_exclusive} onCheckedChange={(val)=>updateField("restaurant_exclusive", val)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurant_price_minimum">Minimum Revenue (€)</Label>
            <Input id="restaurant_price_minimum" type="number" min="0" value={formData.restaurant_price_minimum} onChange={(e)=>updateField("restaurant_price_minimum", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Bar Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bar Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bar_name">Name</Label>
            <Input id="bar_name" value={formData.bar_name} onChange={(e)=>updateField("bar_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bar_seats">Seats</Label>
            <Input id="bar_seats" type="number" min="0" value={formData.bar_seats} onChange={(e)=>updateField("bar_seats", e.target.value)} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bar_exclusive">Exclusive Hire</Label>
              <Switch id="bar_exclusive" checked={formData.bar_exclusive} onCheckedChange={(val)=>updateField("bar_exclusive", val)} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bar_snacks_available">Snacks Available</Label>
              <Switch id="bar_snacks_available" checked={formData.bar_snacks_available} onCheckedChange={(val)=>updateField("bar_snacks_available", val)} />
            </div>
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="bar_opening_hours">Opening Hours</Label>
            <Input id="bar_opening_hours" value={formData.bar_opening_hours} onChange={(e)=>updateField("bar_opening_hours", e.target.value)} />
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="service_times">Roomservice Service Times</Label>
            <Input id="service_times" value={formData.service_times} onChange={(e)=>updateField("service_times", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Breakfast Details */}
      <Card>
        <CardHeader>
          <CardTitle>Breakfast</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="breakfast_restaurant_name">Restaurant Name</Label>
            <Input id="breakfast_restaurant_name" value={formData.breakfast_restaurant_name} onChange={(e)=>updateField("breakfast_restaurant_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakfast_start_time">Breakfast Times</Label>
            <Input id="breakfast_start_time" value={formData.breakfast_start_time} onChange={(e)=>updateField("breakfast_start_time", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakfast_cost_per_person">Price per Adult (€)</Label>
            <Input id="breakfast_cost_per_person" type="number" min="0" value={formData.breakfast_cost_per_person} onChange={(e)=>updateField("breakfast_cost_per_person", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breakfast_cost_per_child">Price per Child (€)</Label>
            <Input id="breakfast_cost_per_child" type="number" min="0" value={formData.breakfast_cost_per_child} onChange={(e)=>updateField("breakfast_cost_per_child", e.target.value)} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="breakfast_event_available">Room usable for Events?</Label>
              <Switch id="breakfast_event_available" checked={formData.breakfast_event_available} onCheckedChange={(val)=>updateField("breakfast_event_available", val)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Handling</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="operational_lead_time">Staff Planning Lead Time</Label>
            <Input id="operational_lead_time" value={formData.operational_lead_time} onChange={(e)=>updateField("operational_lead_time", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergy_diet_deadline">Special Diets/Allergies Deadline</Label>
            <Input id="allergy_diet_deadline" value={formData.allergy_diet_deadline} onChange={(e)=>updateField("allergy_diet_deadline", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buffet_minimum_persons">Buffet offered from X persons</Label>
            <Input id="buffet_minimum_persons" type="number" min="0" value={formData.buffet_minimum_persons} onChange={(e)=>updateField("buffet_minimum_persons", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* F&B Packages */}
      <Card>
        <CardHeader>
          <CardTitle>F&B Packages</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="fnb_packages_available">Packages Bookable?</Label>
              <Switch id="fnb_packages_available" checked={formData.fnb_packages_available} onCheckedChange={(val)=>updateField("fnb_packages_available", val)} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="extra_packages_customized">Packages customizable?</Label>
              <Switch id="extra_packages_customized" checked={formData.extra_packages_customized} onCheckedChange={(val)=>updateField("extra_packages_customized", val)} />
            </div>
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="coffee_break_items">Coffee Break Inclusions</Label>
            <Textarea id="coffee_break_items" value={formData.coffee_break_items} onChange={(e)=>updateField("coffee_break_items", e.target.value)} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="lunch_standard_items">Standard Lunch Items</Label>
            <Textarea id="lunch_standard_items" value={formData.lunch_standard_items} onChange={(e)=>updateField("lunch_standard_items", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buffet_minimum_for_lunch">Buffet Lunch from X persons</Label>
            <Input id="buffet_minimum_for_lunch" type="number" min="0" value={formData.buffet_minimum_for_lunch} onChange={(e)=>updateField("buffet_minimum_for_lunch", e.target.value)} />
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
            <Label htmlFor="function_created_by">Functions created by</Label>
            <Input id="function_created_by" value={formData.function_created_by} onChange={(e)=>updateField("function_created_by", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="function_completion_time">Functions ready by (lead time)</Label>
            <Input id="function_completion_time" value={formData.function_completion_time} onChange={(e)=>updateField("function_completion_time", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="function_meeting_people">Who attends Function Meeting?</Label>
            <Input id="function_meeting_people" value={formData.function_meeting_people} onChange={(e)=>updateField("function_meeting_people", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="function_required_depts">Departments needing Functions</Label>
            <Input id="function_required_depts" value={formData.function_required_depts} onChange={(e)=>updateField("function_required_depts", e.target.value)} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="mice_desk_involvement">MICE Desk involvement</Label>
            <Textarea id="mice_desk_involvement" value={formData.mice_desk_involvement} onChange={(e)=>updateField("mice_desk_involvement", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Restaurant & Bar Information</CardTitle>
              <CardDescription>Enter details about the dining options</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="restaurants">Number of Restaurants*</Label>
              <Input 
                id="restaurants" 
                type="number" 
                min="0" 
                placeholder="Number of restaurants" 
                value={formData.restaurants}
                onChange={(e) => updateField("restaurants", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bars">Number of Bars</Label>
              <Input 
                id="bars" 
                type="number" 
                min="0" 
                placeholder="Number of bars/lounges" 
                value={formData.bars}
                onChange={(e) => updateField("bars", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurantNames">Restaurant Names</Label>
              <Textarea 
                id="restaurantNames" 
                placeholder="List restaurant names" 
                value={formData.restaurantNames}
                onChange={(e) => updateField("restaurantNames", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="barNames">Bar Names</Label>
              <Textarea 
                id="barNames" 
                placeholder="List bar/lounge names" 
                value={formData.barNames}
                onChange={(e) => updateField("barNames", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Types</Label>
              <Textarea 
                id="cuisine" 
                placeholder="Describe cuisine types offered" 
                value={formData.cuisine}
                onChange={(e) => updateField("cuisine", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialDiets">Special Dietary Options</Label>
              <Textarea 
                id="specialDiets" 
                placeholder="List available dietary options (vegetarian, vegan, gluten-free, etc.)" 
                value={formData.specialDiets}
                onChange={(e) => updateField("specialDiets", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="breakfastHours">Breakfast Hours</Label>
              <Input 
                id="breakfastHours" 
                placeholder="e.g., 6:30-10:30" 
                value={formData.breakfastHours}
                onChange={(e) => updateField("breakfastHours", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lunchHours">Lunch Hours</Label>
              <Input 
                id="lunchHours" 
                placeholder="e.g., 12:00-14:30" 
                value={formData.lunchHours}
                onChange={(e) => updateField("lunchHours", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dinnerHours">Dinner Hours</Label>
              <Input 
                id="dinnerHours" 
                placeholder="e.g., 18:00-22:00" 
                value={formData.dinnerHours}
                onChange={(e) => updateField("dinnerHours", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="roomService">Room Service Available</Label>
                <Switch 
                  id="roomService" 
                  checked={formData.roomService}
                  onCheckedChange={(checked) => updateField("roomService", checked)}
                />
              </div>
              
              {formData.roomService && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="roomServiceHours">Room Service Hours</Label>
                  <Input 
                    id="roomServiceHours" 
                    placeholder="e.g., 6:00-23:00 or 24 hours" 
                    value={formData.roomServiceHours}
                    onChange={(e) => updateField("roomServiceHours", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="minibar">Minibar Available</Label>
                <Switch 
                  id="minibar" 
                  checked={formData.minibar}
                  onCheckedChange={(checked) => updateField("minibar", checked)}
                />
              </div>
              
              {formData.minibar && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="minibarItems">Minibar Items</Label>
                  <Textarea 
                    id="minibarItems" 
                    placeholder="List standard minibar items" 
                    value={formData.minibarItems}
                    onChange={(e) => updateField("minibarItems", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="executiveLounge">Executive Lounge</Label>
                <Switch 
                  id="executiveLounge" 
                  checked={formData.executiveLounge}
                  onCheckedChange={(checked) => updateField("executiveLounge", checked)}
                />
              </div>
              
              {formData.executiveLounge && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="executiveDetails">Executive Lounge Details</Label>
                  <Textarea 
                    id="executiveDetails" 
                    placeholder="Describe executive lounge offerings and hours" 
                    value={formData.executiveDetails}
                    onChange={(e) => updateField("executiveDetails", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="banquetCapacity">Banquet Capacity</Label>
              <Input 
                id="banquetCapacity" 
                placeholder="Maximum banquet capacity" 
                value={formData.banquetCapacity}
                onChange={(e) => updateField("banquetCapacity", e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="outdoorDining">Outdoor Dining</Label>
                <Switch 
                  id="outdoorDining" 
                  checked={formData.outdoorDining}
                  onCheckedChange={(checked) => updateField("outdoorDining", checked)}
                />
              </div>
              
              {formData.outdoorDining && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="outdoorDiningDetails">Outdoor Dining Details</Label>
                  <Textarea 
                    id="outdoorDiningDetails" 
                    placeholder="Describe outdoor dining options" 
                    value={formData.outdoorDiningDetails}
                    onChange={(e) => updateField("outdoorDiningDetails", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="alcoholServed">Alcohol Served</Label>
                <Switch 
                  id="alcoholServed" 
                  checked={formData.alcoholServed}
                  onCheckedChange={(checked) => updateField("alcoholServed", checked)}
                />
              </div>
              
              {formData.alcoholServed && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="alcoholTypes">Alcohol Types</Label>
                  <Textarea 
                    id="alcoholTypes" 
                    placeholder="Describe alcohol selection (beer, wine, spirits, etc.)" 
                    value={formData.alcoholTypes}
                    onChange={(e) => updateField("alcoholTypes", e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="localPartners">Local Partners</Label>
              <Textarea 
                id="localPartners" 
                placeholder="List any local food suppliers or partners" 
                value={formData.localPartners}
                onChange={(e) => updateField("localPartners", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

export default FoodBeverageForm;
