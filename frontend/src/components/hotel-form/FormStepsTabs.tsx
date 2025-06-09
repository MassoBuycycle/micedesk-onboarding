import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DoorOpen, Clock, CalendarCheck, CalendarRange, UtensilsCrossed, Check } from "lucide-react";
import { CompletedSteps, FormStep } from "@/hooks/useHotelFormState";

interface FormStepsTabsProps {
  activeStep: FormStep;
  completedSteps: CompletedSteps;
  onTabChange: (step: FormStep) => boolean;
}

const FormStepsTabs = ({ activeStep, completedSteps, onTabChange }: FormStepsTabsProps) => {
  return (
    <TabsList className="w-full h-auto p-0 bg-accent/50 rounded-lg mb-4 overflow-x-auto flex-nowrap">
      <TabsTrigger 
        value="hotel" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto rounded-l-lg data-[state=active]:bg-white"
      >
        <div className="relative">
          <Building className="h-4 w-4" />
          {completedSteps.hotel && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">Hotel Info</span>
      </TabsTrigger>
      <TabsTrigger 
        value="roomInfo" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
      >
        <div className="relative">
          <DoorOpen className="h-4 w-4" />
          {completedSteps.roomInfo && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">Room Info</span>
      </TabsTrigger>
      <TabsTrigger 
        value="roomCategories" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
      >
        <div className="relative">
          <DoorOpen className="h-4 w-4" />
          {completedSteps.roomCategories && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">Room Types</span>
      </TabsTrigger>
      <TabsTrigger 
        value="roomHandling" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
      >
        <div className="relative">
          <Clock className="h-4 w-4" />
          {completedSteps.roomHandling && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">Room Handling</span>
      </TabsTrigger>
      <TabsTrigger 
        value="eventsInfo" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
      >
        <div className="relative">
          <CalendarCheck className="h-4 w-4" />
          {completedSteps.eventsInfo && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">Events Info</span>
      </TabsTrigger>
      <TabsTrigger 
        value="eventSpaces" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
      >
        <div className="relative">
          <CalendarRange className="h-4 w-4" />
          {completedSteps.eventSpaces && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">Event Spaces</span>
      </TabsTrigger>
      <TabsTrigger 
        value="foodBeverage" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto rounded-r-lg data-[state=active]:bg-white"
      >
        <div className="relative">
          <UtensilsCrossed className="h-4 w-4" />
          {completedSteps.foodBeverage && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">F&B</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default FormStepsTabs;
