export interface Restaurant {
  id?: number | string;
  name: string;
  cuisine: string;
  seats_indoor: number;
  seats_outdoor: number;
  exclusive_booking: boolean;
  minimum_price: number;
  opening_hours: string;
}

export interface Bar {
  id?: number | string;
  name: string;
  seats_indoor: number;
  seats_outdoor: number;
  exclusive_booking: boolean;
  opening_hours: string;
  snacks_available: boolean;
}

export interface FoodBeverageDetails {
  id?: number;
  hotel_id: number;
  
  // Contact Details / Ansprechpartner
  fnb_contact_name: string;
  fnb_contact_position: string;
  fnb_contact_phone: string;
  fnb_contact_email: string;
  
  // Outlets 
  total_restaurants: number;
  restaurants: Restaurant[];
  bars: Bar[];
  
  // Room Service
  room_service_available: boolean;
  room_service_hours: string;
  
  // Breakfast / Frühstück
  breakfast_restaurant_name: string;
  breakfast_hours: string;
  breakfast_cost_per_person: number;
  breakfast_cost_per_child: number;
  breakfast_child_pricing_tiers: string; // Preisstaffelung
  breakfast_room_used_for_events: boolean;
  
  // Operational Handling
  staff_planning_lead_time: string; // Personalplanung Vorlaufzeit
  special_diet_allergy_deadline: string; // Spezielle Diäten/Allergien Deadline
  
  // F&B Packages
  conference_packages_offered: string; // Tagungspauschalen
  additional_packages_bookable: boolean; // Zusatzbausteine buchbar
  existing_packages_customizable: boolean; // Bestehende Pauschalen anpassbar
  coffee_break_inclusions: string; // Kaffeepausen Inklusivleistungen
  standard_lunch_offerings: string; // Standard Mittagessen
  buffet_minimum_persons: number; // Buffet ab X Personen
  additional_packages_available: string; // Weitere Pauschalen (z.B. Getränkepauschalen)
  
  // Functions
  functions_created_by: string; // Functions erstellt von
  functions_completion_deadline: string; // Functions Fertigstellung
  departments_requiring_functions: string; // Abteilungen die Functions benötigen
  function_meeting_schedule: string; // Function Meeting wann und wie
  function_meeting_participants: string; // Wer ist beim Function Meeting dabei
  mice_desk_involvement: string; // MICE DESK Beteiligung
  
  created_at?: Date;
  updated_at?: Date;
} 