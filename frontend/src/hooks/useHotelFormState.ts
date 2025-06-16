import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { assignTemporaryFiles } from "@/apiClient/filesApi";

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
  const { permissions } = useAuth();
  const [activeStep, setActiveStep] = useState<FormStep>("hotel");
  const [createdHotelId, setCreatedHotelId] = useState<number | null>(null);
  const [createdRoomTypeId, setCreatedRoomTypeId] = useState<number | null>(null);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  
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

  const setHotelIdForEdit = (hotelId: number) => {
    setCreatedHotelId(hotelId);
    setMode('edit');
  };

  const fetchAndSetHotelData = async (hotelId: number) => {
    try {
      // Fetch core hotel data
      const hotelData = await getHotelById(hotelId);

      // Try to fetch any existing events for this hotel
      let events = [] as any[];
      let detailedEventData = null;
      
      try {
        const { getEventsByHotelId } = await import('@/apiClient/eventsApi');
        events = await getEventsByHotelId(hotelId);
        
        // If events exist, fetch detailed data for the first event
        if (events && events.length > 0) {
          const firstEventId = events[0].id;
          setCreatedEventId(firstEventId);
          
          console.log(`🔄 Fetching detailed event data for event ID: ${firstEventId}`);
          
          // Import all the GET functions we need
          const { 
            getEventById,
            getEventBooking, 
            getEventOperations, 
            getEventFinancials,
            getEventAvEquipment,
            getEventTechnicalInfo,
            getEventContractingInfo
          } = await import('@/apiClient/eventsApi');
          
          // Fetch all event data in parallel
          const [
            eventContact,
            bookingData,
            operationsData,
            financialsData,
            equipmentData,
            technicalData,
            contractingData
          ] = await Promise.allSettled([
            getEventById(firstEventId),
            getEventBooking(firstEventId),
            getEventOperations(firstEventId),
            getEventFinancials(firstEventId),
            getEventAvEquipment(firstEventId),
            getEventTechnicalInfo(firstEventId),
            getEventContractingInfo(firstEventId)
          ]);
          
          console.log("📊 Event data fetch results:");
          console.log("Contact:", eventContact.status === 'fulfilled' ? eventContact.value : "failed");
          console.log("Booking:", bookingData.status === 'fulfilled' ? bookingData.value : "failed");
          console.log("Operations:", operationsData.status === 'fulfilled' ? operationsData.value : "failed");
          console.log("Financials:", financialsData.status === 'fulfilled' ? financialsData.value : "failed");
          console.log("Equipment:", equipmentData.status === 'fulfilled' ? equipmentData.value : "failed");
          console.log("Technical:", technicalData.status === 'fulfilled' ? technicalData.value : "failed");
          console.log("Contracting:", contractingData.status === 'fulfilled' ? contractingData.value : "failed");
          
          // Structure the detailed event data
          detailedEventData = {
            contact: eventContact.status === 'fulfilled' ? eventContact.value : {},
            booking: bookingData.status === 'fulfilled' ? bookingData.value : {},
            operations: operationsData.status === 'fulfilled' ? operationsData.value : {},
            financials: financialsData.status === 'fulfilled' ? financialsData.value : {},
            equipment: equipmentData.status === 'fulfilled' ? (Array.isArray(equipmentData.value) ? equipmentData.value : []) : [],
            technical: technicalData.status === 'fulfilled' ? technicalData.value : {},
            contracting: contractingData.status === 'fulfilled' ? contractingData.value : {}
          };
          
          console.log("✅ Structured detailed event data:", detailedEventData);
        }
      } catch (err) {
        console.warn('Could not fetch events for hotel', hotelId, err);
      }

      const apiData: any = { hotel: hotelData };
      
      // Attach events array and detailed event data
      if (events && events.length) {
        apiData.events = events;
      }
      if (detailedEventData) {
        apiData.eventsInfo = detailedEventData;
      }

      setHotelDataFromApi(apiData);
    } catch (error) {
      console.error('fetchAndSetHotelData error', error);
      toast.error('Failed to fetch hotel data.');
    }
  };

  const setHotelDataFromApi = async (apiData: any) => {
    console.log("=== SETTING HOTEL DATA FROM API ===");
    console.log("Raw API data received:", apiData);
    
    // Transform hotel data from snake_case to camelCase for form compatibility
    const transformHotelData = (hotelData: any) => {
      if (!hotelData) return {};
      
      return {
        id: hotelData.id,
        systemHotelId: hotelData.system_hotel_id || hotelData.hotel_id,
        name: hotelData.name,
        street: hotelData.street,
        postalCode: hotelData.postal_code,
        city: hotelData.city,
        country: hotelData.country,
        phone: hotelData.phone,
        fax: hotelData.fax,
        email: hotelData.email,
        website: hotelData.website,
        description: hotelData.description,
        billingAddressName: hotelData.billing_address_name,
        billingAddressStreet: hotelData.billing_address_street,
        billingAddressZip: hotelData.billing_address_zip,
        billingAddressCity: hotelData.billing_address_city,
        billingAddressVat: hotelData.billing_address_vat,
        externalBillingId: hotelData.external_billing_id,
        starRating: hotelData.star_rating,
        category: hotelData.category,
        openingDate: hotelData.opening_year || hotelData.opening_date,
        latestRenovationDate: hotelData.latest_renovation_year || hotelData.latest_renovation_date,
        totalRooms: hotelData.total_rooms,
        conferenceRooms: hotelData.conference_rooms,
        pmsSystem: hotelData.pms_system,
        distanceToAirportKm: hotelData.distance_to_airport_km,
        distanceToHighwayKm: hotelData.distance_to_highway_km,
        distanceToFairKm: hotelData.distance_to_fair_km,
        distanceToTrainStation: hotelData.distance_to_train_station,
        distanceToPublicTransport: hotelData.distance_to_public_transport,
        noOfParkingSpaces: hotelData.no_of_parking_spaces,
        noOfParkingSpacesGarage: hotelData.no_of_parking_spaces_garage,
        noOfParkingSpacesElectric: hotelData.no_of_parking_spaces_electric,
        noOfParkingSpacesBus: hotelData.no_of_parking_spaces_bus,
        noOfParkingSpacesOutside: hotelData.no_of_parking_spaces_outside,
        noOfParkingSpacesDisabled: hotelData.no_of_parking_spaces_disabled,
        parkingCostPerHour: hotelData.parking_cost_per_hour,
        parkingCostPerDay: hotelData.parking_cost_per_day,
        openingTimePool: hotelData.opening_time_pool,
        openingTimeFitnessCenter: hotelData.opening_time_fitness_center,
        equipmentFitnessCenter: hotelData.equipment_fitness_center,
        openingTimeSpaArea: hotelData.opening_time_spa_area,
        equipmentSpaArea: hotelData.equipment_spa_area,
        attractionInTheArea: hotelData.attraction_in_the_area,
        plannedChanges: hotelData.planned_changes,
      };
    };
    
    const transformedHotel = transformHotelData(apiData.hotel);
    console.log("Transformed hotel data:", transformedHotel);
    
    // NEW helper to transform first room entry
    const transformRoomData = (roomAgg:any)=>{
      if(!roomAgg) return {};
      const out:any={};
      out.main_contact_name_room = roomAgg.main_contact_name;
      out.main_contact_position_room = roomAgg.main_contact_position;
      out.reception_hours = roomAgg.reception_hours;
      if(roomAgg.contacts){
        out.room_phone = roomAgg.contacts.phone;
        out.room_email = roomAgg.contacts.email;
      }
      if(roomAgg.policies){
        out.check_in_time = roomAgg.policies.check_in;
        out.check_out_time = roomAgg.policies.check_out;
        out.early_checkin_fee = roomAgg.policies.early_check_in_cost;
        out.late_checkout_fee = roomAgg.policies.late_check_out_cost;
        out.early_check_in_time_frame = roomAgg.policies.early_check_in_time_frame;
        out.late_check_out_tme = roomAgg.policies.late_check_out_time;
        out.payment_methods = roomAgg.policies.payment_methods || [];
      }
      if(roomAgg.inventory){
        out.single_rooms = roomAgg.inventory.amt_single_rooms;
        out.double_rooms = roomAgg.inventory.amt_double_rooms;
        out.connected_rooms = roomAgg.inventory.amt_connecting_rooms;
        out.accessible_rooms = roomAgg.inventory.amt_handicapped_accessible_rooms;
      }
      if(roomAgg.pet_policies){
        out.dogs_allowed = roomAgg.pet_policies.is_dogs_allowed;
        out.dog_fee = roomAgg.pet_policies.dog_fee;
        out.dog_fee_inclusions = roomAgg.pet_policies.dog_fee_inclusions;
      }
      if(Array.isArray(roomAgg.standard_features)){
        out.standard_features = roomAgg.standard_features;
      }
      return out;
    }

    // transform roomOperational to handling form
    const transformRoomHandling = (handling:any)=>{
      if(!handling) return {};
      const boolToState=(v:any)=>typeof v==='number'?Boolean(v):v;
      const out={...handling};
      // convert numeric bools
      Object.keys(out).forEach(k=>{ if(typeof out[k]==='number' && (out[k]===0||out[k]===1)) out[k]=Boolean(out[k]); });
      if(out.payment_methods_room_handling && typeof out.payment_methods_room_handling==='string'){
        try{ out.payment_methods_room_handling = JSON.parse(out.payment_methods_room_handling);}catch{}
      }
      return out;
    }

    const firstRoom = Array.isArray(apiData.rooms)? apiData.rooms[0]:undefined;
    const roomInfoForm = transformRoomData(firstRoom);
    const roomHandlingForm = transformRoomHandling(Array.isArray(apiData.roomOperational)?apiData.roomOperational[0]:apiData.roomHandling);

    const newFormData: HotelFormData = {
      hotel: transformedHotel,
      roomInfo: roomInfoForm,
      roomCategories: apiData.roomCategories || [],
      roomHandling: roomHandlingForm,
      eventsInfo: apiData.eventsInfo || {},
      eventSpaces: apiData.eventSpaces || [],
      foodBeverage: apiData.fnb || apiData.foodBeverage || {},
      informationPolicies: apiData.informationPolicies || [],
    };
    
    console.log("Final mapped form data:", newFormData);
    
    setFormData(newFormData);
    setTempFormData(newFormData);
      
    const newCompletedSteps: CompletedSteps = {
      hotel: !!apiData.hotel,
      // For edit mode, be more lenient about what constitutes "completed"
      roomInfo: !!(apiData.rooms || apiData.roomInfo || 
        (apiData.hotel && (apiData.hotel.total_rooms || apiData.hotel.conference_rooms))),
      roomCategories: !!(
        (apiData.roomCategories && apiData.roomCategories.length > 0) ||
        // Consider it completed if we have basic room data
        (apiData.hotel && apiData.hotel.total_rooms)
      ),
      roomHandling: !!(apiData.roomOperational || apiData.roomHandling ||
        // Consider completed if we have any room-related operational data
        (apiData.hotel && (apiData.hotel.check_in_time || apiData.hotel.check_out_time))),
      eventsInfo: !!(apiData.eventsInfo || 
        // Consider completed if we have conference rooms
        (apiData.hotel && apiData.hotel.conference_rooms)),
      eventSpaces: !!(apiData.eventSpaces && apiData.eventSpaces.length > 0),
      foodBeverage: !!(apiData.fnb || apiData.foodBeverage),
      informationPolicies: !!(
        apiData.informationPolicies && apiData.informationPolicies.length > 0
      ),
    };
    
    console.log("Completed steps:", newCompletedSteps);
    setCompletedSteps(newCompletedSteps);

    // If backend provided events, store first event ID for edit flow
    if (apiData.events && Array.isArray(apiData.events) && apiData.events.length > 0) {
      setCreatedEventId(apiData.events[0].id);
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
    console.log("=== handleNext called ===");
    console.log("currentStep:", currentStep);
    console.log("data:", data);
    console.log("typeof onNext:", typeof handleNext);
    
    // Safety check to ensure we have valid data
    if (!data) {
      console.error("No data provided to handleNext");
      toast.error("Invalid form data received");
      return;
    }

    const newFormData = { ...formData, [currentStep]: data };
    setFormData(newFormData);
    setTempFormData(newFormData);
    
    setCompletedSteps(prev => ({ ...prev, [currentStep]: true }));

    const currentIndex = FORM_STEPS.indexOf(currentStep);
    const isLastStep = currentIndex === FORM_STEPS.length - 1;
    let nextStepKey: FormStep | null = isLastStep ? null : FORM_STEPS[currentIndex + 1];

    // Store the hotel ID for immediate use
    let currentHotelId = createdHotelId;

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
            system_hotel_id: formHotelData.systemHotelId,
            name: formHotelData.name,
            street: formHotelData.street,
            postal_code: formHotelData.postalCode,
            city: formHotelData.city,
            country: formHotelData.country,
            phone: formHotelData.phone || undefined,
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
            try {
              // Safety check for createHotel function
              if (typeof createHotel !== 'function') {
                throw new Error('createHotel is not a function');
              }
              
              const hotelResponse = await createHotel(hotelInput);
              console.log("=== HOTEL CREATION RESPONSE ===");
              console.log("Full hotel response:", hotelResponse);
              console.log("hotelResponse.hotelId:", hotelResponse.hotelId);
              console.log("hotelResponse.name:", hotelResponse.name);
              console.log("hotelResponse.success:", hotelResponse.success);
              
              if (hotelResponse.hotelId) {
                // Update both state and local variable for immediate use
                currentHotelId = hotelResponse.hotelId;
                setCreatedHotelId(hotelResponse.hotelId);
                
                // IMPORTANT: Update formData.hotel.id so that selectedHotel has the correct ID
                const updatedFormData = {
                  ...newFormData,
                  hotel: {
                    ...newFormData.hotel,
                    id: hotelResponse.hotelId
                  }
                };
                setFormData(updatedFormData);
                setTempFormData(updatedFormData);
                
                console.log("=== HOTEL ID SET SUCCESSFULLY ===");
                console.log("createdHotelId set to:", hotelResponse.hotelId);
                console.log("currentHotelId set to:", currentHotelId);
                console.log("formData.hotel.id set to:", hotelResponse.hotelId);
                toast.success(`Hotel "${hotelResponse.name}" created (ID: ${hotelResponse.hotelId}).`);
                
                // Assign any temporary files to the new hotel
                try {
                  const assignResult = await assignTemporaryFiles('hotels', hotelResponse.hotelId);
                  if (assignResult.updatedCount > 0) {
                    toast.success(`Assigned ${assignResult.updatedCount} temporary files to hotel.`);
                  }
                } catch (fileError: any) {
                  console.error("Error assigning temporary files:", fileError);
                  // Don't fail the hotel creation process for file assignment errors
                  toast.warning("Hotel created successfully, but there was an issue with file assignment.");
                }
              } else {
                console.error("=== HOTEL ID NOT FOUND IN RESPONSE ===");
                console.error("Could not find hotel ID in response");
                toast.error("Hotel created but ID not found in response. Please check the backend.");
                setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
                return;
              }
            } catch (createError: any) {
              console.error("=== ERROR CREATING HOTEL ===");
              console.error("Hotel creation failed:", createError);
              toast.error(`Failed to create hotel: ${createError.message}`);
              setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
              return;
            }
          } else {
            currentHotelId = createdHotelId;
            // Determine if user requires approval
            const requiresApproval = permissions.includes('edit_with_approval') && !permissions.includes('edit_all');
            if (requiresApproval) {
              try {
                // Safety check for getHotelById function
                if (typeof getHotelById !== 'function') {
                  throw new Error('getHotelById is not a function');
                }
                // Safety check for submitChanges function
                if (typeof submitChanges !== 'function') {
                  throw new Error('submitChanges is not a function');
                }
                
                // Fetch original data for diff
                const originalHotel = await getHotelById(createdHotelId);
                await submitChanges(createdHotelId, 'hotel', hotelInput, originalHotel);
                toast.success('Update request submitted for approval.');
              } catch (approvalError: any) {
                console.error("Error in approval workflow:", approvalError);
                toast.error(`Failed to submit for approval: ${approvalError.message}`);
                setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
                return;
              }
            } else {
              try {
                // Safety check for updateHotel function
                if (typeof updateHotel !== 'function') {
                  throw new Error('updateHotel is not a function');
                }
                
                console.log(`Calling updateHotel for ID ${createdHotelId} with transformed data:`, hotelInput);
                await updateHotel(createdHotelId, hotelInput);
                toast.success(`Hotel "${hotelInput.name || 'Details'}" updated (ID: ${createdHotelId}).`);
                
                // Assign any temporary files to the updated hotel
                try {
                  const assignResult = await assignTemporaryFiles('hotels', createdHotelId);
                  if (assignResult.updatedCount > 0) {
                    toast.success(`Assigned ${assignResult.updatedCount} temporary files to hotel.`);
                  }
                } catch (fileError: any) {
                  console.error("Error assigning temporary files:", fileError);
                  // Don't fail the hotel update process for file assignment errors
                  toast.warning("Hotel updated successfully, but there was an issue with file assignment.");
                }
              } catch (updateError: any) {
                console.error("Error updating hotel:", updateError);
                toast.error(`Failed to update hotel: ${updateError.message}`);
                setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
                return;
              }
            }
          }
          break;

        case "roomInfo":
          console.log("=== ROOM INFO STEP STARTED ===");
          console.log("createdHotelId from state:", createdHotelId);
          console.log("currentHotelId (immediate):", currentHotelId);
          console.log("newFormData.roomInfo:", newFormData.roomInfo);
          
          if (!currentHotelId) {
            console.error("=== HOTEL ID MISSING ===");
            console.error("currentHotelId is null or undefined");
            console.error("This means hotel creation step failed or hotel ID wasn't set properly");
            toast.error("Hotel ID not found. Please complete the Hotel step first.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          
          console.log("=== HOTEL ID FOUND ===");
          console.log("Using hotel ID:", currentHotelId);
          
          if (newFormData.roomInfo && Object.keys(newFormData.roomInfo).length > 0) {
            const formValues = newFormData.roomInfo as any; 
            console.log("=== ROOM INFO FORM VALUES ===");
            console.log("Form values received:", formValues);

            const payload: MainRoomConfigInput = {
              hotel_id: currentHotelId,
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
              payment_methods: formValues.payment_methods || [],
              standard_features: formValues.standard_features || [],
              amt_single_rooms: formValues.single_rooms,
              amt_double_rooms: formValues.double_rooms,
              amt_connecting_rooms: formValues.connected_rooms, 
              amt_handicapped_accessible_rooms: formValues.accessible_rooms, 
              is_dogs_allowed: formValues.dogs_allowed || false,
              dog_fee: formValues.dog_fee || 0,
              dog_fee_inclusions: formValues.dog_fee_inclusions
            };

            console.log("=== ROOM CREATION PAYLOAD ===");
            console.log("Hotel ID being sent:", currentHotelId);
            console.log("Complete room creation payload:", payload);
            
            Object.keys(payload).forEach(key => {
              if (payload[key as keyof MainRoomConfigInput] === undefined) {
                delete payload[key as keyof MainRoomConfigInput];
              }
            });

            console.log("=== CLEANED PAYLOAD ===");
            console.log("Payload after removing undefined values:", payload);
            console.log("Calling createRoom (for MainRoomConfig) with data:", payload);
            
            try {
              const roomConfigResponse = await createRoom(payload);
              console.log("=== ROOM CREATION RESPONSE ===");
              console.log("Room creation response:", roomConfigResponse);
              
              if (roomConfigResponse.data && roomConfigResponse.data.roomId) {
                setCreatedRoomTypeId(roomConfigResponse.data.roomId);
                console.log("=== ROOM ID SET SUCCESSFULLY ===");
                console.log("Room ID set to:", roomConfigResponse.data.roomId);
                toast.success(`Main Room Configuration saved (ID: ${roomConfigResponse.data.roomId}).`);
                const mergedData = { ...newFormData, roomInfo: roomConfigResponse.data as Partial<MainRoomConfigInput> }; 
                setFormData(mergedData);
                setTempFormData(mergedData);
              } else {
                console.error("=== ROOM ID NOT FOUND IN RESPONSE ===");
                console.error("Room creation response structure:", roomConfigResponse);
                toast.error("Failed to save Main Room Configuration: No Room ID returned.");
                setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
                return;
              }
            } catch (error: any) {
              console.error("=== ERROR CREATING ROOM ===");
              console.error("Room creation failed:", error);
              console.error("Error details:", error.message);
              if (error.response) {
                console.error("Error response:", error.response.data);
              }
              toast.error(`Failed to save Main Room Configuration: ${error.message}`);
              setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
              return;
            }
          } else {
            console.log("=== NO ROOM INFO DATA ===");
            console.log("Skipping room creation - no data provided");
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
          if (!currentHotelId) {
            console.error("No hotel ID found! currentHotelId is null or undefined");
            toast.error("Hotel ID not found. Cannot create event.");
            setCompletedSteps(prev => ({ ...prev, [currentStep]: false }));
            return;
          }
          
          console.log("==== EVENT INFO STEP ====");
          console.log("currentHotelId:", currentHotelId);
          console.log("createdEventId:", createdEventId);
          console.log("newFormData.eventsInfo:", newFormData.eventsInfo);
          
          try {
            if (newFormData.eventsInfo && Object.keys(newFormData.eventsInfo).length > 0) {
              console.log("Processing eventsInfo data:", newFormData.eventsInfo);
              // Cast to EventInfoData to access nested properties
              const evData = newFormData.eventsInfo as EventInfoData;
              
              // Extract contact data from the nested structure
              const contactData = {
                hotel_id: currentHotelId,
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
              
              toast.success("F&B details saved successfully! Redirecting to hotel view...");
              
              // Redirect to hotel view after a short delay
              setTimeout(() => {
                window.location.href = `/view/hotel/${createdHotelId}`;
              }, 1500);
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
          if (!hotelData.systemHotelId) {
            toast.error("System Hotel ID not found. Please complete the Hotel step first.");
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
                    system_hotel_id: hotelData.systemHotelId,
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
    mode,
    handleStepChange,
    handleNext,
    handlePrevious,
    updateFormData,
    updateTempFormData,
    setHotelIdForEdit,
    fetchAndSetHotelData,
    setHotelDataFromApi,
    setCreatedHotelId,
  };
}


