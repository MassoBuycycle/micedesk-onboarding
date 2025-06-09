import { Tabs } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Paperclip } from "lucide-react";
import HotelPreview from "@/components/previews/HotelPreview";
import FormStepsTabs from "@/components/hotel-form/FormStepsTabs";
import FormStepContent from "@/components/hotel-form/FormStepContent";
import { useHotelFormState } from "@/hooks/useHotelFormState";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { getFullHotelDetails } from "@/apiClient/hotelsApi";
import { getAuthToken } from "@/apiClient/authApi";
import HotelAnnouncementBanner from '@/components/HotelAnnouncementBanner';

interface AddProps {
  mode?: 'add' | 'edit';
}

const Add = ({ mode = 'add' }: AddProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const hasLoadedRef = useRef(false);
  const { 
    activeStep,
    formData,
    tempFormData,
    completedSteps,
    createdHotelId,
    createdEventId,
    handleStepChange,
    handleNext,
    handlePrevious,
    updateTempFormData,
    setHotelDataFromApi,
    setCreatedHotelId
  } = useHotelFormState();

  // Fallback hotel ID from route parameter (used in edit mode before data load finishes)
  const routeHotelId = id ? parseInt(id) : null;

  // Use the createdHotelId if available, otherwise fall back to the routeHotelId
  const effectiveHotelId = createdHotelId ?? routeHotelId;

  // Load hotel data when in edit mode
  useEffect(() => {
    const loadHotelData = async () => {
      // Only load data if we haven't loaded it before and we're in edit mode with an ID
      if (mode === 'edit' && id && !hasLoadedRef.current) {
        try {
          hasLoadedRef.current = true; // Mark as loaded to prevent duplicate loads
          
          // Check if user is authenticated
          const authToken = getAuthToken();
          if (!authToken) {
            console.log("No authentication token found - loading basic hotel data only");
            // You might want to load just basic hotel data here
            // For now, we'll just set the hotel ID
            setCreatedHotelId(parseInt(id));
            toast.info("Loading basic data only - login for full access");
            return;
          }
          
          const fullDetails = await getFullHotelDetails(parseInt(id));
          await setHotelDataFromApi(fullDetails);
          setCreatedHotelId(parseInt(id));
          toast.success(t("pages.add.loadedForEditing"));
        } catch (error: any) {
          console.error("Failed to load hotel data:", error);
          
          // Check if it's an authentication error
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            // Still allow editing but with limited data
            setCreatedHotelId(parseInt(id));
            toast.warning("Login required to load full hotel data");
          } else {
            toast.error(t("pages.add.failedToLoad"));
            navigate("/view");
          }
        }
      }
    };

    loadHotelData();
  }, [mode, id, setHotelDataFromApi, setCreatedHotelId, navigate, t]);
  
  // If we're on the events step, double-check we have a valid hotel ID
  useEffect(() => {
    if (activeStep === 'eventsInfo' && (!effectiveHotelId || effectiveHotelId === 0)) {
      console.error("⚠️ On events step but no valid hotel ID! effectiveHotelId:", effectiveHotelId);
      toast.error(t("pages.add.missingHotelId"));
    }
  }, [activeStep, effectiveHotelId, t]);

  return (
    <div className="space-y-4">
      {mode === 'edit' && (createdHotelId || id) && (
        <HotelAnnouncementBanner hotelId={createdHotelId ? createdHotelId : parseInt(id!)} />
      )}
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === 'edit' ? t("pages.add.editTitle") : t("pages.add.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {mode === 'edit' 
            ? t("pages.add.editSubtitle")
            : t("pages.add.subtitle")
          }
        </p>
        <div className="flex items-center gap-2 mt-2 p-2 bg-accent rounded-md text-xs">
          <Paperclip className="h-3 w-3 flex-shrink-0 text-primary" />
          <p>
            {t("pages.add.uploadInfo", { 
              mode: mode === 'edit' ? t("pages.add.editing") : t("pages.add.adding") 
            })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs value={activeStep} onValueChange={handleStepChange} className="w-full">
            <FormStepsTabs 
              activeStep={activeStep} 
              completedSteps={completedSteps} 
              onTabChange={handleStepChange} 
            />
            <FormStepContent 
              activeStep={activeStep}
              formData={formData}
              createdHotelId={effectiveHotelId}
              createdEventId={createdEventId}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onDataChange={updateTempFormData}
              mode={mode}
            />
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <HotelPreview 
            hotelId={effectiveHotelId ? effectiveHotelId.toString() : undefined} 
            liveFormData={tempFormData} 
            currentStep={activeStep} 
          />
        </div>
      </div>
    </div>
  );
};

export default Add;
