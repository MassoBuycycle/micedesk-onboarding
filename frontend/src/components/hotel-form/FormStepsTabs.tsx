import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DoorOpen, Clock, CalendarCheck, CalendarRange, UtensilsCrossed, Shield, FileText, Check } from "lucide-react";
import { CompletedSteps, FormStep } from "@/hooks/useHotelFormState";
import { useTranslation } from "react-i18next";

interface FormStepsTabsProps {
  activeStep: FormStep;
  completedSteps: CompletedSteps;
  onTabChange: (step: FormStep) => boolean;
}

const FormStepsTabs = ({ activeStep, completedSteps, onTabChange }: FormStepsTabsProps) => {
  const { t } = useTranslation();
  
  const tabClass = "min-w-[100px] flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white whitespace-nowrap";
  
  return (
    <TabsList className="w-full h-auto p-0 bg-accent/50 rounded-lg overflow-x-auto flex justify-start">
      <TabsTrigger 
        value="hotel" 
        className={`${tabClass} rounded-l-lg`}
      >
        <div className="relative">
          <Building className="h-4 w-4" />
          {completedSteps.hotel && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("hotel.title")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="roomInfo" 
        className={tabClass}
      >
        <div className="relative">
          <DoorOpen className="h-4 w-4" />
          {completedSteps.roomInfo && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("rooms.title")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="roomCategories" 
        className={tabClass}
      >
        <div className="relative">
          <DoorOpen className="h-4 w-4" />
          {completedSteps.roomCategories && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("rooms.categories")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="roomHandling" 
        className={tabClass}
      >
        <div className="relative">
          <Clock className="h-4 w-4" />
          {completedSteps.roomHandling && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("rooms.operationalInfo")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="eventsInfo" 
        className={tabClass}
      >
        <div className="relative">
          <CalendarCheck className="h-4 w-4" />
          {completedSteps.eventsInfo && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("events.title")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="eventSpaces" 
        className={tabClass}
      >
        <div className="relative">
          <CalendarRange className="h-4 w-4" />
          {completedSteps.eventSpaces && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("events.eventSpaces")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="foodBeverage" 
        className={tabClass}
      >
        <div className="relative">
          <UtensilsCrossed className="h-4 w-4" />
          {completedSteps.foodBeverage && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("hotels.foodBeverage")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="contractOnboarding" 
        className={`${tabClass} rounded-r-lg`}
      >
        <div className="relative">
          <FileText className="h-4 w-4" />
          {completedSteps.contractOnboarding && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("contract.title")}</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default FormStepsTabs;
