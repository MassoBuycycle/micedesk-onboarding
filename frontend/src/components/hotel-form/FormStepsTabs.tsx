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
        <span className="text-xs">{t("hotel.title")}</span>
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
        <span className="text-xs">{t("rooms.title")}</span>
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
        <span className="text-xs">{t("rooms.categories")}</span>
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
        <span className="text-xs">{t("rooms.operationalInfo")}</span>
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
        <span className="text-xs">{t("events.title")}</span>
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
        <span className="text-xs">{t("events.eventSpaces")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="foodBeverage" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
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
        value="informationPolicies" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-white"
      >
        <div className="relative">
          <Shield className="h-4 w-4" />
          {completedSteps.informationPolicies && (
            <span className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <Check className="h-2 w-2 text-white" />
            </span>
          )}
        </div>
        <span className="text-xs">{t("policies.title")}</span>
      </TabsTrigger>
      <TabsTrigger 
        value="contractOnboarding" 
        className="flex-1 flex flex-col items-center gap-1 p-2 h-auto rounded-r-lg data-[state=active]:bg-white"
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
