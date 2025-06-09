import HotelForm from "@/components/forms/HotelForm";
import RoomForm from "@/components/forms/RoomForm";
import RoomCategoryForm from "@/components/forms/RoomCategoryForm";
import RoomHandlingForm from "@/components/forms/RoomHandlingForm";
import EventInfoForm from "@/components/forms/EventInfoForm";
import EventSpacesForm from "@/components/forms/EventSpacesForm";
import FoodBeverageForm from "@/components/forms/FoodBeverageForm";
import InformationPoliciesForm from "@/components/forms/InformationPoliciesForm";
import { FormStep } from "@/hooks/useHotelFormState";
import SectionFileUpload from "@/components/files/SectionFileUpload";

interface FormStepContentProps {
  activeStep: FormStep;
  formData: {
    hotel: any;
    roomInfo: any;
    roomCategories: any[];
    roomHandling: any;
    eventsInfo: any;
    eventSpaces: any[];
    foodBeverage: any;
    informationPolicies: any[];
  };
  createdHotelId: number | null;
  createdEventId?: number | null;
  onNext: (step: FormStep, data: any) => void;
  onPrevious: (step: FormStep, data: any) => void;
  onDataChange: (step: FormStep, data: any) => void;
  mode?: 'add' | 'edit';
}

const FormStepContent = ({ 
  activeStep, 
  formData, 
  createdHotelId,
  createdEventId,
  onNext, 
  onPrevious, 
  onDataChange,
  mode = 'add'
}: FormStepContentProps) => {
  return (
    <div className="bg-gradient-to-br from-accent/5 via-accent/10 to-accent/15 p-3 rounded-lg">
      {activeStep === 'hotel' && (
        <>
          <HotelForm 
            initialData={formData.hotel} 
            onNext={(data) => onNext("hotel", data)} 
            onChange={(data) => onDataChange("hotel", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="hotel"
          />
        </>
      )}
      
      {activeStep === 'roomInfo' && (
        <>
          <RoomForm 
            initialData={formData.roomInfo}
            selectedHotel={formData.hotel}
            onNext={(data) => onNext("roomInfo", data)}
            onPrevious={(data) => onPrevious("roomInfo", data)}
            onChange={(data) => onDataChange("roomInfo", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="roomInfo"
          />
        </>
      )}

      {activeStep === 'roomCategories' && (
        <>
          <RoomCategoryForm 
            initialData={formData.roomCategories}
            selectedHotel={formData.hotel}
            onNext={(data) => onNext("roomCategories", data)}
            onPrevious={(data) => onPrevious("roomCategories", data)}
            onChange={(data) => onDataChange("roomCategories", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="roomCategories"
          />
        </>
      )}
      
      {activeStep === 'roomHandling' && (
        <>
          <RoomHandlingForm 
            initialData={formData.roomHandling}
            selectedHotel={formData.hotel}
            onNext={(data) => onNext("roomHandling", data)}
            onPrevious={(data) => onPrevious("roomHandling", data)}
            onChange={(data) => onDataChange("roomHandling", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="roomHandling"
          />
        </>
      )}
      
      {activeStep === 'eventsInfo' && (
        <>
          <EventInfoForm 
            initialData={formData.eventsInfo}
            selectedHotel={{
              id: createdHotelId, // Use the dynamic hotel ID from props
              ...formData.hotel
            }}
            createdEventId={createdEventId}
            onNext={(data) => {
              console.log("===== EventInfoForm onNext called =====");
              console.log("Selected hotel in FormStepContent:", formData.hotel);
              console.log("Event data:", data);
              console.log("Contact in data:", data.contact);
              console.log("hotel_id in contact:", data.contact?.hotel_id);
              onNext("eventsInfo", data);
            }}
            onPrevious={(data) => onPrevious("eventsInfo", data)}
            onChange={(data) => onDataChange("eventsInfo", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="eventsInfo"
          />
        </>
      )}
      
      {activeStep === 'eventSpaces' && (
        <>
          <EventSpacesForm 
            initialData={formData.eventSpaces}
            selectedHotel={formData.hotel}
            onNext={(data) => onNext("eventSpaces", data)}
            onPrevious={(data) => onPrevious("eventSpaces", data)}
            onChange={(data) => onDataChange("eventSpaces", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="eventSpaces"
          />
        </>
      )}
      
      {activeStep === 'foodBeverage' && (
        <>
          <FoodBeverageForm 
            initialData={formData.foodBeverage}
            selectedHotel={formData.hotel}
            onNext={(data) => onNext("foodBeverage", data)}
            onPrevious={(data) => onPrevious("foodBeverage", data)}
            onChange={(data) => onDataChange("foodBeverage", data)}
            isLastStep={false}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="foodBeverage"
          />
        </>
      )}
      
      {activeStep === 'informationPolicies' && (
        <>
          <InformationPoliciesForm 
            initialData={Array.isArray(formData.informationPolicies) && formData.informationPolicies.length > 0 ? formData.informationPolicies[0] : {}}
            hotelId={formData.hotel?.hotelId}
            onNext={(data) => onNext("informationPolicies", data)}
            onPrevious={(data) => onPrevious("informationPolicies", data)}
            onChange={(data) => onDataChange("informationPolicies", data)}
            mode={mode}
          />
          <SectionFileUpload
            entityId={createdHotelId} 
            entityType="hotels"
            section="informationPolicies"
          />
        </>
      )}
    </div>
  );
};

export default FormStepContent;
