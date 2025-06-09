import { useState } from "react";
import { toast } from "sonner";
import { createHotel, HotelInput, FoodBeverageOutletInput, createFoodBeverageOutlet, updateHotel, getHotelById, getFoodBeverageOutlets, updateFoodBeverageOutlet } from "@/apiClient/hotelsApi";
import { upsertFoodBeverageDetails, getFoodBeverageDetails } from "@/apiClient/fbDetailsApi";
import { createEvent, EventMainInput, EventCategoryInput, upsertBooking, upsertOperations, upsertFinancials, upsertSpaces, upsertEquipment, getEventsByHotelId, getEventById, updateEvent } from "@/apiClient/eventsApi";
import { 
  MainRoomConfigInput,
  RoomCategoryInput, 
  createOrUpdateRoomOperationalHandling,
  RoomOperationalHandlingInput,
  createRoom,
  addCategoriesToRoom,
  RoomInfo,
  getRoomTypeById,
  getRoomTypeHandling,
  getRoomInfo
} from "@/apiClient/roomsApi";
import { HotelFormValues } from "@/components/forms/HotelForm";
import { EventInfoData } from "@/components/forms/EventInfoForm";
import { EventInput } from "@/types/events";
import { submitChanges } from "@/apiClient/approvalApi";
import { useAuth } from "@/context/AuthContext";
import { getAuthToken } from "@/apiClient/authApi";

// Define the form data type
export interface HotelFormData {
  hotel: Partial<HotelFormValues>;
  roomInfo: Partial<MainRoomConfigInput>;
  roomCategories: Partial<RoomCategoryInput>[];
  roomHandling: Partial<RoomOperationalHandlingInput>;
  eventsInfo: Partial<EventInfoData>;
  eventSpaces: any[];
  foodBeverage: any; // Changed from array to single object
  informationPolicies: any[];
}

// Define the form steps
export const FORM_STEPS = [
  "hotel", 
  "roomInfo",
  "roomCategories", 
  "roomHandling",   
  "eventsInfo", 
  "eventSpaces", 
  "foodBeverage",
  "informationPolicies"
] as const;

export type FormStep = typeof FORM_STEPS[number];

export interface CompletedSteps {
  hotel: boolean;
  roomInfo: boolean;
  roomCategories: boolean;
  roomHandling: boolean;
  eventsInfo: boolean;
  eventSpaces: boolean;
  foodBeverage: boolean;
  informationPolicies: boolean;
}

export function useHotelFormState() {
  const [activeStep, setActiveStep] = useState<FormStep>("hotel");
  const [createdHotelId, setCreatedHotelId] = useState<number | null>(null);
  const [createdRoomTypeId, setCreatedRoomTypeId] = useState<number | null>(null);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const { permissions } = useAuth();
  
  const initialFormData: HotelFormData = {
    hotel: {},
    roomInfo: {},
    roomCategories: [],
    roomHandling: {},
    eventsInfo: {},
    eventSpaces: [],
    foodBeverage: {},
    informationPolicies: []
  };

  const initialCompletedSteps: CompletedSteps = {
    hotel: false,
    roomInfo: false,
    roomCategories: false,
    roomHandling: false,
    eventsInfo: false,
    eventSpaces: false,
    foodBeverage: false,
    informationPolicies: false
  };

  const [formData, setFormData] = useState<HotelFormData>({...initialFormData});
  
  // For live preview - store temporary form data
  const [tempFormData, setTempFormData] = useState<HotelFormData>({...initialFormData});
  
  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({...initialCompletedSteps});

  // Function to load hotel data from API for editing
  const setHotelDataFromApi = async (apiData: any) => {
    if (!apiData) return;

    // Detect if we received aggregated full details (contains .hotel)
    const isAggregated = !!apiData.hotel;
    const hotelData = isAggregated ? apiData.hotel : apiData;

    try {
      // 1. Convert API hotel data to form data format
      const hotelFormData: Partial<HotelFormValues> = {
        id: hotelData.id,
        hotelId: hotelData.hotel_id || '', // Map hotel_id to hotelId for form
        name: hotelData.name || '',
        street: hotelData.street || '',
        postalCode: hotelData.postal_code || '',
        city: hotelData.city || '',
        country: hotelData.country || '',
        phone: hotelData.phone || '',
        fax: hotelData.fax || '',
        email: hotelData.email || '',
        website: hotelData.website || '',
        description: hotelData.description || '',
        billingAddressName: hotelData.billing_address_name || '',
        billingAddressStreet: hotelData.billing_address_street || '',
        billingAddressZip: hotelData.billing_address_zip || '',
        billingAddressCity: hotelData.billing_address_city || '',
        billingAddressVat: hotelData.billing_address_vat || '',
        externalBillingId: hotelData.external_billing_id || '',
        starRating: hotelData.star_rating ? hotelData.star_rating.toString() : '',
        category: hotelData.category || '',
        openingDate: hotelData.opening_year ? hotelData.opening_year.toString() : '',
        latestRenovationDate: hotelData.latest_renovation_year ? hotelData.latest_renovation_year.toString() : '',
        totalRooms: hotelData.total_rooms ? hotelData.total_rooms.toString() : '',
        conferenceRooms: hotelData.conference_rooms ? hotelData.conference_rooms.toString() : '',
        pmsSystem: hotelData.pms_system || '',
        distanceToAirportKm: hotelData.distance_to_airport_km ? hotelData.distance_to_airport_km.toString() : '',
        distanceToHighwayKm: hotelData.distance_to_highway_km ? hotelData.distance_to_highway_km.toString() : '',
        distanceToFairKm: hotelData.distance_to_fair_km ? hotelData.distance_to_fair_km.toString() : '',
        distanceToTrainStation: hotelData.distance_to_train_station ? hotelData.distance_to_train_station.toString() : '',
        distanceToPublicTransport: hotelData.distance_to_public_transport ? hotelData.distance_to_public_transport.toString() : '',
        noOfParkingSpaces: hotelData.no_of_parking_spaces ? hotelData.no_of_parking_spaces.toString() : '',
        noOfParkingSpacesGarage: hotelData.no_of_parking_spaces_garage ? hotelData.no_of_parking_spaces_garage.toString() : '',
        noOfParkingSpacesElectric: hotelData.no_of_parking_spaces_electric ? hotelData.no_of_parking_spaces_electric.toString() : '',
        noOfParkingSpacesBus: hotelData.no_of_parking_spaces_bus ? hotelData.no_of_parking_spaces_bus.toString() : '',
        noOfParkingSpacesOutside: hotelData.no_of_parking_spaces_outside ? hotelData.no_of_parking_spaces_outside.toString() : '',
        noOfParkingSpacesDisabled: hotelData.no_of_parking_spaces_disabled ? hotelData.no_of_parking_spaces_disabled.toString() : '',
        parkingCostPerHour: hotelData.parking_cost_per_hour ? hotelData.parking_cost_per_hour.toString() : '',
        parkingCostPerDay: hotelData.parking_cost_per_day ? hotelData.parking_cost_per_day.toString() : '',
        openingTimePool: hotelData.opening_time_pool || '',
        openingTimeFitnessCenter: hotelData.opening_time_fitness_center || '',
        equipmentFitnessCenter: hotelData.equipment_fitness_center || '',
        openingTimeSpaArea: hotelData.opening_time_spa_area || '',
        equipmentSpaArea: hotelData.equipment_spa_area || '',
        attractionInTheArea: hotelData.attraction_in_the_area || '',
        plannedChanges: hotelData.planned_changes || '',
      };
      
      // Set hotel ID for future API calls
      const hotelId = hotelData.id;
      
      // Build the newFormData object to store all data
      let newFormData: HotelFormData = {
        ...formData,
        hotel: hotelFormData
      };
            
      // === NEW: If we have aggregated data, map nested sections directly ===
      if (isAggregated) {
        // Check if user is authenticated before loading protected data
        const authToken = getAuthToken();
        
        // 2a. Rooms (main config)
        if (apiData.rooms && apiData.rooms.length > 0) {
          const roomMain = apiData.rooms[0];
          const roomFormData: any = {
            hotel_id: hotelId,
            main_contact_name_room: roomMain.main_contact_name || '',
            main_contact_position_room: roomMain.main_contact_position || '',
            room_phone: roomMain.phone || roomMain.contact_phone || '',
            room_email: roomMain.email || roomMain.contact_email || '',
            check_in_time: roomMain.check_in || '',
            check_out_time: roomMain.check_out || '',
            early_checkin_fee: roomMain.early_check_in_cost || 0,
            late_checkout_fee: roomMain.late_check_out_cost || 0,
            early_check_in_time_frame: roomMain.early_check_in_time_frame || '',
            late_check_out_tme: roomMain.late_check_out_time || '',
            reception_hours: roomMain.reception_hours || '',
            payment_methods: roomMain.payment_methods || [],
            single_rooms: roomMain.amt_single_rooms || 0,
            double_rooms: roomMain.amt_double_rooms || 0,
            connected_rooms: roomMain.amt_connecting_rooms || 0,
            accessible_rooms: roomMain.amt_handicapped_accessible_rooms || 0,
            dogs_allowed: roomMain.is_dogs_allowed || false,
            dog_fee: roomMain.dog_fee || 0,
            dog_fee_inclusions: roomMain.dog_fee_inclusions || '',
          };
          newFormData.roomInfo = roomFormData;
          setCompletedSteps(prev => ({ ...prev, roomInfo: true }));

          // 2b. Room categories
          if (apiData.roomCategories && apiData.roomCategories.length > 0) {
            const categoryData = apiData.roomCategories.map((cat: any) => ({
              category_name: cat.category_name || '',
              pms_name: cat.pms_name || '',
              num_rooms: cat.num_rooms || 0,
              size: cat.size || 0,
              bed_type: cat.bed_type || '',
              surcharges_upsell: cat.surcharges_upsell || '',
              room_features: cat.room_features || '',
              second_person_surcharge: cat.second_person_surcharge || 0,
              extra_bed_surcharge: cat.extra_bed_surcharge || 0,
              baby_bed_available: cat.baby_bed_available || false,
              extra_bed_available: cat.extra_bed_available || false,
            }));
            newFormData.roomCategories = categoryData;
            setCompletedSteps(prev => ({ ...prev, roomCategories: true }));
          }

          // 2c. Room operational handling
          if (apiData.roomOperational && apiData.roomOperational.length > 0) {
            const handling = apiData.roomOperational[0];
            const handlingData: Partial<RoomOperationalHandlingInput> = {
              revenue_manager_name: handling.revenue_manager_name || '',
              revenue_contact_details: handling.revenue_contact_details || '',
              demand_calendar: handling.demand_calendar || false,
              demand_calendar_infos: handling.demand_calendar_infos || '',
              revenue_call: handling.revenue_call || false,
              revenue_calls_infos: handling.revenue_calls_infos || '',
              group_request_min_rooms: handling.group_request_min_rooms || 0,
              group_reservation_category: handling.group_reservation_category || '',
              group_rates_check: handling.group_rates_check || false,
              group_rates: handling.group_rates || '',
              breakfast_share: handling.breakfast_share || 0,
              first_second_option: handling.first_second_option || false,
              shared_options: handling.shared_options || false,
              first_option_hold_duration: handling.first_option_hold_duration || '',
              overbooking: handling.overbooking || false,
              overbooking_info: handling.overbooking_info || '',
              min_stay_weekends: handling.min_stay_weekends || false,
              min_stay_weekends_infos: handling.min_stay_weekends_infos || '',
              call_off_quota: handling.call_off_quota || false,
              call_off_method: handling.call_off_method || '',
              call_off_deadlines: handling.call_off_deadlines || '',
              commission_rules: handling.commission_rules || '',
              free_spot_policy_leisure_groups: handling.free_spot_policy_leisure_groups || '',
              restricted_dates: handling.restricted_dates || '',
              handled_by_mice_desk: handling.handled_by_mice_desk || false,
              requires_deposit: handling.requires_deposit || false,
              deposit_rules: handling.deposit_rules || '',
              payment_methods_room_handling: handling.payment_methods_room_handling || '',
              final_invoice_handling: handling.final_invoice_handling || '',
              deposit_invoice_responsible: handling.deposit_invoice_responsible || '',
              info_invoice_created: handling.info_invoice_created || false,
            };
            newFormData.roomHandling = handlingData;
            setCompletedSteps(prev => ({ ...prev, roomHandling: true }));
          }
        }

        // 3. Event spaces (and basic events info if possible)
        if (apiData.eventSpaces && apiData.eventSpaces.length > 0) {
          newFormData.eventSpaces = apiData.eventSpaces;
          setCompletedSteps(prev => ({ ...prev, eventSpaces: true }));
        }
        
        // 3b. Events info - properly structure the data
        if (apiData.events && apiData.events.length > 0) {
          const event = apiData.events[0];
          setCreatedEventId(event.id);
          
          // Only load event equipment if authenticated
          if (!authToken) {
            console.log("No authentication token found - skipping event equipment loading in aggregated data");
            // Structure event data WITHOUT equipment that requires authentication
            const eventFormData: any = {
              contact: {
                hotel_id: hotelId,
                contact_name: event.contact_name || '',
                contact_phone: event.contact_phone || '',
                contact_email: event.contact_email || '',
                contact_position: event.contact_position || '',
              },
              booking: event.booking || {},
              operations: event.operations || {},
              financials: event.financials || {},
              equipment: [], // Empty array when not authenticated
              technical: event.technical || {},
              contracting: event.contracting || {},
            };
            
            newFormData.eventsInfo = eventFormData;
            setCompletedSteps(prev => ({ ...prev, eventsInfo: true }));
          } else {
            // Structure event data in the format expected by EventInfoForm
            const eventFormData: any = {
              contact: {
                hotel_id: hotelId,
                contact_name: event.contact_name || '',
                contact_phone: event.contact_phone || '',
                contact_email: event.contact_email || '',
                contact_position: event.contact_position || '',
              },
              booking: event.booking || {},
              operations: event.operations || {},
              financials: event.financials || {},
              equipment: event.equipment || [],
              technical: event.technical || {},
              contracting: event.contracting || {},
            };
            
            newFormData.eventsInfo = eventFormData;
            setCompletedSteps(prev => ({ ...prev, eventsInfo: true }));
          }
        } else {
          // Set default structure even if no event exists
          newFormData.eventsInfo = {
            contact: { hotel_id: hotelId }
          };
        }

        // 4. Food & Beverage - only load if authenticated
        if (apiData.fnb) {
          if (!authToken) {
            console.log("No authentication token found - skipping F&B data loading in aggregated data");
          } else {
            newFormData.foodBeverage = apiData.fnb;
            setCompletedSteps(prev => ({ ...prev, foodBeverage: true }));
          }
        }

        // Update states and exit early (skip legacy fetch logic)
        setFormData(newFormData);
        setTempFormData(newFormData);
        setCompletedSteps(prev => ({ ...prev, hotel: true }));

        toast.success("Successfully loaded hotel details (aggregated)");
        return; // Skip legacy loading
      }

      // 2. Load room info
      try {
        const authToken = getAuthToken();
        if (!authToken) {
          console.log("No authentication token found - skipping room data loading");
        } else {
          // Try to get room by ID - this approach depends on your API structure
          // Using a direct approach since getRoomsByHotelId doesn't seem to exist
          const roomTypeData = await getRoomTypeById(hotelId);
          
          if (roomTypeData && roomTypeData.id) {
            const roomId = roomTypeData.id;
            setCreatedRoomTypeId(roomId);
            
            console.log("Found room ID:", roomId);
            
            // Transform room data to form format - using only fields that exist in RoomType
            const roomFormData: Partial<MainRoomConfigInput> = {
              hotel_id: hotelId,
              main_contact_name: roomTypeData.main_contact_name || '',
              reception_hours: roomTypeData.reception_hours || '',
              // Other fields would need to be fetched from a different API if available
            };
            
            newFormData = {
              ...newFormData,
              roomInfo: roomFormData
            };
            
            // Mark room info as completed
            setCompletedSteps(prev => ({ ...prev, roomInfo: true }));
            
            // 3. Load room categories if the API exists
            try {
              if (roomTypeData.categories && roomTypeData.categories.length > 0) {
                const categoryData = (roomTypeData.categories as any).map((cat: any) => ({
                  category_name: cat.category_name || '',
                  pms_name: cat.pms_name || '',
                  num_rooms: cat.num_rooms || 0,
                  size: cat.size || 0,
                  bed_type: cat.bed_type || '',
                  surcharges_upsell: cat.surcharges_upsell || '',
                  room_features: cat.room_features || '',
                  second_person_surcharge: cat.second_person_surcharge || 0,
                  extra_bed_surcharge: cat.extra_bed_surcharge || 0,
                  baby_bed_available: cat.baby_bed_available || false,
                  extra_bed_available: cat.extra_bed_available || false,
                }));
                
                newFormData = {
                  ...newFormData,
                  roomCategories: categoryData
                };
                
                // Mark room categories as completed
                setCompletedSteps(prev => ({ ...prev, roomCategories: true }));
              }
            } catch (err) {
              console.error("Error loading room categories:", err);
            }
            
            // 4. Load room handling
            try {
              const handling: any = await getRoomTypeHandling(roomId);
              if (handling) {
                const handlingData: Partial<RoomOperationalHandlingInput> = {
                  revenue_manager_name: handling.revenue_manager_name || '',
                  revenue_contact_details: handling.revenue_contact_details || '',
                  demand_calendar: handling.demand_calendar || false,
                  demand_calendar_infos: handling.demand_calendar_infos || '',
                  revenue_call: handling.revenue_call || false,
                  revenue_calls_infos: handling.revenue_calls_infos || '',
                  group_request_min_rooms: handling.group_request_min_rooms || 0,
                  group_reservation_category: handling.group_reservation_category || '',
                  group_rates_check: handling.group_rates_check || false,
                  group_rates: handling.group_rates || '',
                  breakfast_share: handling.breakfast_share || 0,
                  first_second_option: handling.first_second_option || false,
                  shared_options: handling.shared_options || false,
                  first_option_hold_duration: handling.first_option_hold_duration || '',
                  overbooking: handling.overbooking || false,
                  overbooking_info: handling.overbooking_info || '',
                  min_stay_weekends: handling.min_stay_weekends || false,
                  min_stay_weekends_infos: handling.min_stay_weekends_infos || '',
                  call_off_quota: handling.call_off_quota || false,
                  call_off_method: handling.call_off_method || '',
                  call_off_deadlines: handling.call_off_deadlines || '',
                  commission_rules: handling.commission_rules || '',
                  free_spot_policy_leisure_groups: handling.free_spot_policy_leisure_groups || '',
                  restricted_dates: handling.restricted_dates || '',
                  handled_by_mice_desk: handling.handled_by_mice_desk || false,
                  requires_deposit: handling.requires_deposit || false,
                  deposit_rules: handling.deposit_rules || '',
                  payment_methods_room_handling: handling.payment_methods_room_handling || '',
                  final_invoice_handling: handling.final_invoice_handling || '',
                  deposit_invoice_responsible: handling.deposit_invoice_responsible || '',
                  info_invoice_created: handling.info_invoice_created || false,
                };
                
                newFormData = {
                  ...newFormData,
                  roomHandling: handlingData
                };
                
                // Mark room handling as completed
                setCompletedSteps(prev => ({ ...prev, roomHandling: true }));
              }
            } catch (err) {
              console.error("Error loading room handling:", err);
            }
          }
        }
      } catch (err: any) {
        // Check if it's an authentication error
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          console.log("Authentication required to fetch room data - skipping");
        } else {
          console.error("Error loading room data:", err);
        }
      }
      
      // 5. Load events info
      try {
        // Check if user is authenticated before making protected API calls
        const authToken = getAuthToken();
        if (!authToken) {
          console.log("No authentication token found - skipping event data loading");
          newFormData.eventsInfo = { 
            contact: { hotel_id: hotelId } 
          };
        } else {
          const events = await getEventsByHotelId(hotelId);
          if (events && events.length > 0) {
            const eventId = events[0].id;
            setCreatedEventId(eventId);
            
            console.log("Found event ID:", eventId);
            
            // Get complete event details
            const eventDetails = await getEventById(eventId);
            
            if (eventDetails) {
              // Import additional event APIs
              const { 
                getEventAvEquipment, 
                getEventContractingInfo, 
                getEventTechnicalInfo,
                getEventHandlingInfo 
              } = await import('@/apiClient/eventsApi');
              
              // Fetch all event-related data
              let bookingData = {};
              let operationsData = {};
              let financialsData = {};
              let equipmentData: any[] = [];
              let technicalData = {};
              let contractingData = {};
              
              try {
                // Note: These endpoints might not have GET methods implemented yet
                // We'll fetch what we can and handle errors gracefully
                
                // Try to get equipment data
                try {
                  const equipment = await getEventAvEquipment(eventId);
                  equipmentData = equipment.map(item => ({
                    name: item.equipment_name || '',
                    quantity: item.quantity || 0,
                    price: item.price_per_unit || 0
                  }));
                } catch (err: any) {
                  // Check if it's an authentication error
                  if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                    console.log("Authentication required to fetch equipment data - skipping");
                  } else {
                    console.log("Could not fetch equipment data:", err);
                  }
                }
                
                // Try to get technical data
                // TODO: Uncomment when backend endpoint is implemented
                /*
                try {
                  const technical = await getEventTechnicalInfo(eventId);
                  technicalData = {
                    beamer_lumens: technical.beamer_lumens || '',
                    copy_cost: technical.copy_cost || 0,
                    wifi_data_rate: technical.wifi_data_rate || '',
                    software_presentation: technical.software_presentation || '',
                    has_ac_or_ventilation: technical.has_ac_or_ventilation || false,
                    has_blackout_curtains: technical.has_blackout_curtains || false,
                    is_soundproof: technical.is_soundproof || false,
                    has_daylight: technical.has_daylight || false,
                    is_hybrid_meeting_possible: technical.is_hybrid_meeting_possible || false,
                    technical_support_available: technical.technical_support_available || false,
                  };
                } catch (err) {
                  console.log("Could not fetch technical data:", err);
                }
                */
                console.log("Technical endpoint not yet implemented in backend - skipping");
                
                // Try to get contracting data
                // TODO: Uncomment when backend endpoint is implemented
                /*
                try {
                  const contracting = await getEventContractingInfo(eventId);
                  contractingData = {
                    contracted_companies: contracting.contracted_companies || '',
                    refused_requests: contracting.refused_requests || '',
                    unwanted_marketing_tools: contracting.unwanted_marketing_tools || '',
                    first_second_option: contracting.first_second_option || false,
                    split_options: contracting.split_options || false,
                    option_hold_duration: contracting.option_hold_duration || '',
                    overbooking_policy: contracting.overbooking_policy || false,
                    deposit_required: contracting.deposit_required || false,
                    accepted_payment_methods: contracting.accepted_payment_methods || '',
                    commission_rules: contracting.commission_rules || '',
                    second_signature_required: contracting.second_signature_required || false,
                  };
                } catch (err) {
                  console.log("Could not fetch contracting data:", err);
                }
                */
                console.log("Contracting endpoint not yet implemented in backend - skipping");
                
                // Try to get handling/operations data
                try {
                  const handling = await getEventHandlingInfo(eventId);
                  operationsData = {
                    has_overtime_material: handling.sent_over_time_material || false,
                    lunch_location: handling.lunch_location || '',
                    min_participants: handling.min_participants_package || 0,
                    coffee_location: handling.coffee_break_location || '',
                    material_advance_days: handling.advance_days_for_material || 0,
                    room_drop_fee: handling.room_drop_cost || 0,
                    has_storage: handling.storage_room || false,
                    has_minimum_spent: handling.minimum_spent || false,
                    sold_with_rooms_only: handling.sold_with_rooms_only || false,
                    last_minute_lead_time: handling.last_minute_lead_time || '',
                    sent_over_time_material: handling.sent_over_time_material || false,
                    min_participants_package: handling.min_participants_package || 0,
                    coffee_break_location: handling.coffee_break_location || '',
                    advance_days_for_material: handling.advance_days_for_material || 0,
                    room_drop_cost: handling.room_drop_cost || 0,
                    hotel_exclusive_clients: handling.hotel_exclusive_clients || false,
                    minimum_spent: handling.minimum_spent || false,
                    storage_room: handling.storage_room || false,
                    deposit_needed_event: handling.deposit_needed_event || false,
                    deposit_rules_event: handling.deposit_rules_event || '',
                    deposit_invoice_creator: handling.deposit_invoice_creator || '',
                    informational_invoice_created: handling.informational_invoice_created || false,
                    payment_methods_events: handling.payment_methods_events || [],
                    final_invoice_handling_event: handling.final_invoice_handling_event || '',
                  };
                } catch (err) {
                  console.log("Could not fetch handling/operations data:", err);
                }
                
              } catch (err) {
                console.error("Error fetching additional event data:", err);
              }
              
              // Transform event data to form format with nested structure
              const eventFormData: any = {
                contact: {
                  hotel_id: hotelId,
                  contact_name: eventDetails.contact_name || '',
                  contact_phone: eventDetails.contact_phone || '',
                  contact_email: eventDetails.contact_email || '',
                  contact_position: eventDetails.contact_position || '',
                },
                booking: bookingData,
                operations: operationsData,
                financials: financialsData,
                equipment: equipmentData,
                technical: technicalData,
                contracting: contractingData,
              };
              
              newFormData = {
                ...newFormData,
                eventsInfo: eventFormData
              };
              
              // Mark events info as completed
              setCompletedSteps(prev => ({ ...prev, eventsInfo: true }));
              
              // 6. Load event spaces - since there's no direct API, we'll need to create a workaround
              try {
                // If there's no direct API for event spaces, we might have to fetch through a different means
                // This is a placeholder - the actual implementation depends on your API structure
                
                // Example workaround using mock data if event exists:
                if (eventId) {
                  const mockSpaces = [
                    {
                      id: "1",
                      name: "Main Conference Room",
                      description: "Large conference space",
                      capacity: "200",
                      size: "300",
                      ceiling: "3.5",
                      layout: "Various",
                      price: "1000",
                      features: ["Projector", "Sound System"]
                    }
                  ];
                  
                  newFormData = {
                    ...newFormData,
                    eventSpaces: mockSpaces
                  };
                  
                  // Mark event spaces as completed
                  setCompletedSteps(prev => ({ ...prev, eventSpaces: true }));
                }
              } catch (err) {
                console.error("Error loading event spaces:", err);
              }
            } else {
              console.log("No events found for hotel ID:", hotelId);
              // Set empty event data structure to avoid undefined errors
              newFormData = {
                ...newFormData,
                eventsInfo: { 
                  contact: { hotel_id: hotelId } 
                }
              };
              // Don't mark events step as completed since there's no data
            }
          } else {
            console.log("No events found for hotel ID:", hotelId);
            // Set empty event data structure to avoid undefined errors
            newFormData = {
              ...newFormData,
              eventsInfo: { 
                contact: { hotel_id: hotelId } 
              }
            };
            // Don't mark events step as completed since there's no data
          }
        }
      } catch (err) {
        console.error("Error loading events data:", err);
        // Set empty event data structure to avoid undefined errors
        newFormData = {
          ...newFormData,
          eventsInfo: { 
            contact: { hotel_id: hotelId } 
          }
        };
        // Don't mark events step as completed since there's no data
      }
      
      // 7. Load food & beverage details
      try {
        const authToken = getAuthToken();
        if (!authToken) {
          console.log("No authentication token found - skipping F&B data loading");
        } else {
          const fnbDetails = await getFoodBeverageDetails(hotelId);
          if (fnbDetails) {
            newFormData = {
              ...newFormData,
              foodBeverage: fnbDetails
            };
            
            // Mark food & beverage as completed
            setCompletedSteps(prev => ({ ...prev, foodBeverage: true }));
          }
        }
      } catch (err: any) {
        // Check if it's an authentication error
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          console.log("Authentication required to fetch F&B details - skipping");
        } else {
          console.error("Error loading food & beverage details:", err);
        }
      }
      
      // Update form data with all loaded sections
      setFormData(newFormData);
      setTempFormData(newFormData);
      
      // Mark hotel section as completed
      setCompletedSteps(prev => ({ ...prev, hotel: true }));
      
      toast.success("Successfully loaded all hotel details");
    } catch (error) {
      toast.error("Error loading complete hotel data. Basic information loaded.");
      
      // Fallback: Update form data with just hotel information
      const basicFormData = {
        ...formData,
        hotel: {} // Use empty object as fallback since hotelFormData is not accessible here
      };
      
      setFormData(basicFormData);
      setTempFormData(basicFormData);
      
      // Don't mark as completed since we couldn't load the data
      setCompletedSteps(prev => ({ ...prev, hotel: false }));
    }
  };

  const updateFormData = (step: FormStep, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
    
    // Also update the temporary form data for live preview
    setTempFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  // Method to update temp form data for live preview
  const updateTempFormData = (step: FormStep, data: any) => {
    setTempFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const handleStepChange = (step: FormStep) => {
    // Allow navigation to any step without restrictions
    setActiveStep(step);
    return true;
  };

  const handleNext = async (currentStep: FormStep, data: any) => {
    const newFormData = { ...formData, [currentStep]: data };
    setFormData(newFormData);
    setTempFormData(newFormData);
    
    setCompletedSteps(prev => ({ ...prev, [currentStep]: true }));

    const currentIndex = FORM_STEPS.indexOf(currentStep);
    const isLastStep = currentIndex === FORM_STEPS.length - 1;
    let nextStepKey: FormStep | null = isLastStep ? null : FORM_STEPS[currentIndex + 1];

    try {
      toast.info(`Processing ${currentStep}...`);
      
      switch (currentStep) {
        case "hotel":
          const formHotelData = newFormData.hotel as HotelFormValues;
          if (!formHotelData.name) {
            toast.error("Hotel name is required.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false })); // Revert completion
            return;
          }
          const hotelInput: HotelInput = {
            hotel_id: formHotelData.hotelId,
            name: formHotelData.name,
            street: formHotelData.street,
            postal_code: formHotelData.postalCode,
            city: formHotelData.city,
            country: formHotelData.country,
            phone: formHotelData.phone || undefined,
            fax: formHotelData.fax || undefined,
            email: formHotelData.email,
            website: formHotelData.website || undefined,
            description: formHotelData.description || undefined,
            billing_address_name: formHotelData.billingAddressName,
            billing_address_street: formHotelData.billingAddressStreet,
            billing_address_zip: formHotelData.billingAddressZip,
            billing_address_city: formHotelData.billingAddressCity,
            billing_address_vat: formHotelData.billingAddressVat || undefined,
            external_billing_id: formHotelData.externalBillingId || undefined,
            star_rating: formHotelData.starRating || undefined,
            category: formHotelData.category,
            opening_year: formHotelData.openingDate || undefined,
            latest_renovation_year: formHotelData.latestRenovationDate || undefined,
            total_rooms: formHotelData.totalRooms || undefined,
            conference_rooms: formHotelData.conferenceRooms || undefined,
            pms_system: formHotelData.pmsSystem || undefined,
            distance_to_airport_km: formHotelData.distanceToAirportKm || undefined,
            distance_to_highway_km: formHotelData.distanceToHighwayKm || undefined,
            distance_to_fair_km: formHotelData.distanceToFairKm || undefined,
            distance_to_train_station: formHotelData.distanceToTrainStation || undefined,
            distance_to_public_transport: formHotelData.distanceToPublicTransport || undefined,
            no_of_parking_spaces: formHotelData.noOfParkingSpaces || undefined,
            no_of_parking_spaces_garage: formHotelData.noOfParkingSpacesGarage || undefined,
            no_of_parking_spaces_electric: formHotelData.noOfParkingSpacesElectric || undefined,
            no_of_parking_spaces_bus: formHotelData.noOfParkingSpacesBus || undefined,
            no_of_parking_spaces_outside: formHotelData.noOfParkingSpacesOutside || undefined,
            no_of_parking_spaces_disabled: formHotelData.noOfParkingSpacesDisabled || undefined,
            parking_cost_per_hour: formHotelData.parkingCostPerHour || undefined,
            parking_cost_per_day: formHotelData.parkingCostPerDay || undefined,
            opening_time_pool: formHotelData.openingTimePool || undefined,
            opening_time_fitness_center: formHotelData.openingTimeFitnessCenter || undefined,
            equipment_fitness_center: formHotelData.equipmentFitnessCenter || undefined,
            opening_time_spa_area: formHotelData.openingTimeSpaArea || undefined,
            equipment_spa_area: formHotelData.equipmentSpaArea || undefined,
            attraction_in_the_area: formHotelData.attractionInTheArea || undefined,
            planned_changes: formHotelData.plannedChanges || undefined,
          };
          Object.keys(hotelInput).forEach(key => hotelInput[key as keyof HotelInput] === undefined && delete hotelInput[key as keyof HotelInput]);

          if (createdHotelId === null) {
            console.log("Calling createHotel with transformed data:", hotelInput);
            const hotelResponse = await createHotel(hotelInput);
            setCreatedHotelId(hotelResponse.hotelId);
            toast.success(`Hotel "${hotelResponse.name}" created (ID: ${hotelResponse.hotelId}).`);
          } else {
            // Determine if user requires approval
            const requiresApproval = permissions.includes('edit_with_approval') && !permissions.includes('edit_all');
            if (requiresApproval) {
              // Fetch original data for diff
              const originalHotel = await getHotelById(createdHotelId);
              await submitChanges(createdHotelId, 'hotel', hotelInput, originalHotel);
              toast.success('Update request submitted for approval.');
            } else {
              console.log(`Calling updateHotel for ID ${createdHotelId} with transformed data:`, hotelInput);
              await updateHotel(createdHotelId, hotelInput);
              toast.success(`Hotel "${hotelInput.name || 'Details'}" updated (ID: ${createdHotelId}).`);
            }
          }
          break;

        case "roomInfo":
          if (!createdHotelId) {
            toast.error("Hotel ID not found. Please complete the Hotel step first.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          if (newFormData.roomInfo && Object.keys(newFormData.roomInfo).length > 0) {
            const formValues = newFormData.roomInfo as any; 

            const payload: MainRoomConfigInput = {
              hotel_id: createdHotelId,
              main_contact_name: formValues.main_contact_name_room, 
              reception_hours: formValues.reception_hours,
              phone: formValues.room_phone, 
              email: formValues.room_email, 
              check_in: formValues.check_in_time, 
              check_out: formValues.check_out_time, 
              early_check_in_cost: formValues.early_checkin_fee, 
              late_check_out_cost: formValues.late_checkout_fee, 
              early_check_in_time_frame: formValues.early_check_in_time_frame,
              late_check_out_time: formValues.late_check_out_tme, 
              payment_methods: formValues.payment_methods, 
              amt_single_rooms: formValues.single_rooms,
              amt_double_rooms: formValues.double_rooms,
              amt_connecting_rooms: formValues.connected_rooms, 
              amt_handicapped_accessible_rooms: formValues.accessible_rooms, 
              is_dogs_allowed: formValues.dogs_allowed,
              dog_fee: formValues.dog_fee,
              dog_fee_inclusions: formValues.dog_fee_inclusions,
            };
            
            Object.keys(payload).forEach(key => {
              if (payload[key as keyof MainRoomConfigInput] === undefined) {
                delete payload[key as keyof MainRoomConfigInput];
              }
            });

            console.log("Calling createRoom (for MainRoomConfig) with data:", payload);
            try {
              const roomConfigResponse = await createRoom(payload);
              if (roomConfigResponse.data && roomConfigResponse.data.roomId) {
                setCreatedRoomTypeId(roomConfigResponse.data.roomId);
                toast.success(`Main Room Configuration saved (ID: ${roomConfigResponse.data.roomId}).`);
                const mergedData = { ...newFormData, roomInfo: roomConfigResponse.data as Partial<MainRoomConfigInput> }; 
                setFormData(mergedData);
                setTempFormData(mergedData);
              } else {
                toast.error("Failed to save Main Room Configuration: No Room ID returned.");
                setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
                return;
              }
            } catch (error: any) {
              toast.error(`Failed to save Main Room Configuration: ${error.message}`);
              setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
              return;
            }
          } else {
            toast.info("Skipping Main Room Configuration save (no data provided).");
          }
          break;

        case "roomCategories":
          if (!createdRoomTypeId) {
            toast.error("Main Room Configuration ID not found. Please complete the Room Info step.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          } else if (newFormData.roomCategories && newFormData.roomCategories.length > 0) {
            const categoriesToSubmit: RoomCategoryInput[] = newFormData.roomCategories.map(catFromFormAny => {
              const catFromForm = catFromFormAny as any; // Data from new RoomCategoryForm.tsx
              
              const safeParseInt = (val: any): number | undefined => {
                if (val === null || val === undefined || String(val).trim() === '') return undefined;
                const num = parseInt(String(val), 10);
                return isNaN(num) ? undefined : num;
              };
              const safeParseFloat = (val: any): number | undefined => {
                if (val === null || val === undefined || String(val).trim() === '') return undefined;
                const num = parseFloat(String(val));
                return isNaN(num) ? undefined : num;
              };

              // Directly use field names from the new RoomCategoryForm, which should align with RoomCategoryInput
              const roomCategoryPayload: RoomCategoryInput = {
                category_name: catFromForm.category_name, // Already correct name from new form
                pms_name: catFromForm.pms_name,
                num_rooms: safeParseInt(catFromForm.num_rooms),
                size: safeParseInt(catFromForm.size), // Form now uses `size` directly (string)
                bed_type: catFromForm.bed_type, // Form now uses `bed_type` directly
                surcharges_upsell: catFromForm.surcharges_upsell, // Assuming form provides string
                room_features: catFromForm.room_features, // Assuming form provides string
                second_person_surcharge: safeParseFloat(catFromForm.second_person_surcharge),
                extra_bed_surcharge: safeParseFloat(catFromForm.extra_bed_surcharge),
                baby_bed_available: typeof catFromForm.baby_bed_available === 'boolean' ? catFromForm.baby_bed_available : undefined,
                extra_bed_available: typeof catFromForm.extra_bed_available === 'boolean' ? catFromForm.extra_bed_available : undefined,
              };

              Object.keys(roomCategoryPayload).forEach(key => {
                if (roomCategoryPayload[key as keyof RoomCategoryInput] === undefined) {
                  delete roomCategoryPayload[key as keyof RoomCategoryInput];
                }
              });
              return roomCategoryPayload;
            });

            console.log(`Calling addCategoriesToRoom for Room ID ${createdRoomTypeId} with mapped data:`, categoriesToSubmit);
            try {
                 const categoriesResponse = await addCategoriesToRoom(createdRoomTypeId, categoriesToSubmit);
                 toast.success(`${categoriesResponse.createdCategories.length} categories added to Room ID ${createdRoomTypeId}.`);
             } catch (catError: any) {
                 console.error("Error adding Room Categories:", catError);
                 toast.error(`Failed to add Room Categories: ${catError.message}`);
                 setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
                 return;
             }
          } else {
              toast.info("Skipping category addition (no categories provided).");
          }
          break;

        case "roomHandling":
          if (!createdRoomTypeId) {
            toast.error("Main Room Configuration ID not found. Please complete the Room Info step.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          if (createdRoomTypeId && newFormData.roomHandling && Object.keys(newFormData.roomHandling).length > 0) {
            console.log("Calling createOrUpdateRoomOperationalHandling with data:", newFormData.roomHandling);
            await createOrUpdateRoomOperationalHandling(createdRoomTypeId, newFormData.roomHandling as RoomOperationalHandlingInput);
            toast.success(`Handling info for Room ID ${createdRoomTypeId} saved.`);
          } else { toast.info("Skipping room handling (no room type ID or handling data)."); }
          break;

        case "eventsInfo":
          if (!createdHotelId) {
            console.error("No hotel ID found! createdHotelId is null or undefined");
            toast.error("Hotel ID not found. Cannot create event.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          
          console.log("==== EVENT INFO STEP ====");
          console.log("createdHotelId:", createdHotelId);
          console.log("createdEventId:", createdEventId);
          console.log("newFormData.eventsInfo:", newFormData.eventsInfo);
          
          try {
            if (newFormData.eventsInfo && Object.keys(newFormData.eventsInfo).length > 0) {
              console.log("Processing eventsInfo data:", newFormData.eventsInfo);
              // Cast to EventInfoData to access nested properties
              const evData = newFormData.eventsInfo as EventInfoData;
              
              // Extract contact data from the nested structure
              const contactData = {
                hotel_id: createdHotelId,
                contact_name: evData.contact?.contact_name || '',
                contact_phone: evData.contact?.contact_phone || '',
                contact_email: evData.contact?.contact_email || '',
                contact_position: evData.contact?.contact_position || ''
              };
              
              let eventId = createdEventId;
              
              // Check if we need to create or update
              if (!eventId) {
                console.log("Creating new event with contact data:", contactData);
                const createRes = await createEvent(contactData);
                console.log("createEvent response:", createRes);
                eventId = createRes.eventId;
                setCreatedEventId(eventId);
                toast.success(`Event created (ID: ${eventId}).`);
              } else {
                console.log("Updating existing event with ID:", eventId);
                await updateEvent(eventId, contactData);
                toast.success(`Event updated (ID: ${eventId}).`);
              }

              // Now make direct API calls for each piece of data
              
              // Booking data
              if (evData.booking && Object.keys(evData.booking).length > 0) {
                console.log("API call: upsertBooking with data:", evData.booking);
                try {
                  const bookingRes = await upsertBooking(eventId, evData.booking);
                  console.log("upsertBooking response:", bookingRes);
                } catch (err) {
                  console.error("Error in upsertBooking:", err);
                  toast.error("Failed to save booking data but proceeding");
                }
              }
              
              // Operations data
              if (evData.operations && Object.keys(evData.operations).length > 0) {
                console.log("API call: upsertOperations with data:", evData.operations);
                try {
                  const opsRes = await upsertOperations(eventId, evData.operations);
                  console.log("upsertOperations response:", opsRes);
                } catch (err) {
                  console.error("Error in upsertOperations:", err);
                  toast.error("Failed to save operations data but proceeding");
                }
              }
              
              // Financials data
              if (evData.financials && Object.keys(evData.financials).length > 0) {
                console.log("API call: upsertFinancials with data:", evData.financials);
                try {
                  const finRes = await upsertFinancials(eventId, evData.financials);
                  console.log("upsertFinancials response:", finRes);
                } catch (err) {
                  console.error("Error in upsertFinancials:", err);
                  toast.error("Failed to save financials data but proceeding");
                }
              }
              
              // Equipment data
              if (evData.equipment && evData.equipment.length > 0) {
                try {
                  const mappedEquipment = evData.equipment.map((item: any) => ({
                    equipment_name: item.name || "",
                    quantity: item.quantity || 0,
                    price: item.price || 0
                  }));
                  console.log("API call: upsertEquipment with data:", mappedEquipment);
                  const equipRes = await upsertEquipment(eventId, mappedEquipment);
                  console.log("upsertEquipment response:", equipRes);
                } catch (err) {
                  console.error("Error in upsertEquipment:", err);
                  toast.error("Failed to save equipment data but proceeding");
                }
              }
              
              // Technical data
              if (evData.technical && Object.keys(evData.technical).length > 0) {
                console.log("API call: upsertTechnical with data:", evData.technical);
                // TODO: Uncomment when backend endpoint is implemented
                /*
                try {
                  // Import the technical API if available
                  const { createOrUpdateEventTechnicalInfo } = await import('@/apiClient/eventsApi');
                  const techRes = await createOrUpdateEventTechnicalInfo(eventId, evData.technical);
                  console.log("upsertTechnical response:", techRes);
                } catch (err) {
                  console.error("Error in upsertTechnical:", err);
                  toast.error("Failed to save technical data but proceeding");
                }
                */
                console.log("Technical endpoint not yet implemented in backend - skipping");
              }
              
              // Contracting data
              if (evData.contracting && Object.keys(evData.contracting).length > 0) {
                console.log("API call: upsertContracting with data:", evData.contracting);
                // TODO: Uncomment when backend endpoint is implemented
                /*
                try {
                  // Import the contracting API if available
                  const { createOrUpdateEventContractingInfo } = await import('@/apiClient/eventsApi');
                  const contractRes = await createOrUpdateEventContractingInfo(eventId, evData.contracting);
                  console.log("upsertContracting response:", contractRes);
                } catch (err) {
                  console.error("Error in upsertContracting:", err);
                  toast.error("Failed to save contracting data but proceeding");
                }
                */
                console.log("Contracting endpoint not yet implemented in backend - skipping");
              }
              
              toast.success("Event data saved successfully, proceeding to next step");
            } else {
              toast.info("Skipping events info (no data).");
            }
            
            // Proceed to next step regardless of API success/failure
            if (nextStepKey) {
              console.log("Proceeding to next step:", nextStepKey);
              setActiveStep(nextStepKey);
            }
            return;
          } catch (eventError: any) {
            console.error("Error in events info step:", eventError);
            toast.error(`Error in events step: ${eventError.message || 'Unknown error'}`);
            // Still proceed to next step
            if (nextStepKey) {
              setActiveStep(nextStepKey);
            }
            return;
          }

        case "eventSpaces":
          if (!createdEventId) {
            toast.error("Event ID not found. Please complete the Event Info step first.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          
          try {
            // Handle event spaces data
            if (newFormData.eventSpaces && newFormData.eventSpaces.length > 0) {
              toast.info(`Saving ${newFormData.eventSpaces.length} event spaces...`);
              try {
                await upsertSpaces(createdEventId, newFormData.eventSpaces);
                toast.success("Event spaces saved successfully");
              } catch (err) {
                console.error("Error saving event spaces:", err);
                toast.error("Failed to save event spaces but proceeding");
              }
            } else {
              toast.info("No event spaces to save");
            }
            
            // Proceed to next step
            if (nextStepKey) {
              setActiveStep(nextStepKey);
            }
          } catch (error: any) {
            console.error("Error in event spaces step:", error);
            toast.error(`Error in event spaces step: ${error.message || 'Unknown error'}`);
            // Still proceed to next step
            if (nextStepKey) {
              setActiveStep(nextStepKey);
            }
          }
          break;

        case "foodBeverage":
          if (!createdHotelId) {
            toast.error("Hotel ID not found. Cannot save F&B details.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          
          // F&B form returns a single object with detailed info, not an array
          if (newFormData.foodBeverage && Object.keys(newFormData.foodBeverage).length > 0) {
            try {
              console.log("Saving F&B details for hotel:", createdHotelId);
              console.log("F&B data:", newFormData.foodBeverage);
              
              // Use the details API to save all F&B information
              await upsertFoodBeverageDetails(createdHotelId, newFormData.foodBeverage);
              
              toast.success("F&B details saved successfully!");
            } catch (error: any) {
              console.error("Error saving F&B details:", error);
              toast.error(`Failed to save F&B details: ${error.message}`);
              setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
              return;
            }
          } else {
            toast.info("Skipping F&B (no data).");
          }
          
          // Check if this is the last step
          if (isLastStep) {
            toast.success("Hotel onboarding process completed!");
            // Don't reset form data in edit mode
            if (createdHotelId === null) {
              setActiveStep(FORM_STEPS[0]);
              setFormData({...initialFormData});
              setTempFormData({...initialFormData});
              setCompletedSteps({...initialCompletedSteps});
              setCreatedHotelId(null);
              setCreatedRoomTypeId(null);
              setCreatedEventId(null);
            }
          }
          return;

        case "informationPolicies":
          const hotelData = newFormData.hotel as HotelFormValues;
          if (!hotelData.hotelId) {
            toast.error("Hotel ID not found. Please complete the Hotel step first.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          
          if (newFormData.informationPolicies && Array.isArray(newFormData.informationPolicies) && newFormData.informationPolicies.length > 0) {
            try {
              // Import the API function
              const { createInformationPolicy } = await import('@/apiClient/informationPoliciesApi');
              
              for (const policy of newFormData.informationPolicies) {
                if (policy.type && policy.items && policy.items.length > 0) {
                  const policyData = {
                    hotel_id: hotelData.hotelId,
                    type: policy.type,
                    items: policy.items
                  };
                  
                  console.log("Creating information policy:", policyData);
                  await createInformationPolicy(policyData);
                  toast.success(`Information policy "${policy.type}" created successfully.`);
                }
              }
              
              toast.success("All information policies created successfully!");
            } catch (error: any) {
              console.error("Error creating information policies:", error);
              toast.error(`Failed to create information policies: ${error.message}`);
              setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
              return;
            }
          } else {
            toast.info("No information policies to save.");
          }
          
          // This is the final step, so reset the form
          toast.success("Hotel onboarding process completed successfully!");
          setActiveStep(FORM_STEPS[0]);
          setFormData({...initialFormData});
          setTempFormData({...initialFormData});
          setCompletedSteps({...initialCompletedSteps});
          setCreatedHotelId(null);
          setCreatedRoomTypeId(null);
          setCreatedEventId(null);
          return;

        // Default for steps like "roomInfo", "eventsInfo" that just collect data
        default:
          break; 
      }

      // If execution reaches here, it means the API call (if any) for the current step was successful
      // and it was not the final step (or the final step logic returned early).
      if (nextStepKey) {
        console.log("Proceeding to next step:", nextStepKey, "from current step:", currentStep);
        setActiveStep(nextStepKey);
      } else if (!isLastStep) {
        console.error("Error: In a non-final step but nextStepKey is null.", currentStep);
      }
    } catch (error: any) {
      console.error(`Error processing step ${currentStep}:`, error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      setCompletedSteps(prev => ({ ...prev, [currentStep]: false })); // Mark step as incomplete
      return; // Don't proceed to next step on error
    }
  };

  const handlePrevious = (currentStep: FormStep, data: any) => {
    // Simply save the data and go to previous step without triggering API calls
    setFormData(prev => ({
      ...prev,
      [currentStep]: data
    }));
    
    setTempFormData(prev => ({
      ...prev,
      [currentStep]: data
    }));

    const currentIndex = FORM_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setActiveStep(FORM_STEPS[currentIndex - 1]);
    }
  };
  
  return {
    activeStep,
    formData,
    tempFormData,
    completedSteps,
    createdHotelId,
    createdRoomTypeId,
    createdEventId,
    handleStepChange,
    handleNext,
    handlePrevious,
    updateFormData,
    updateTempFormData,
    setHotelDataFromApi,
    setCreatedHotelId
  };
}


