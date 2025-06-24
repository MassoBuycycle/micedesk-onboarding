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
    setCreatedHotelId,
    setHotelIdForEdit
  } = useHotelFormState();

  // Fallback hotel ID from route parameter (used in edit mode before data load finishes)
  const routeHotelId = id ? parseInt(id) : null;

  // Use the createdHotelId if available, otherwise fall back to the routeHotelId
  const effectiveHotelId = createdHotelId ?? routeHotelId;

  // Load hotel data when in edit mode
  useEffect(() => {
    const loadHotelData = async () => {
      if (mode === 'edit' && id && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        
        try {
          console.log("Loading hotel data for edit mode, ID:", id);
          
          // Safety check for getFullHotelDetails function
          if (typeof getFullHotelDetails !== 'function') {
            throw new Error('getFullHotelDetails is not a function');
          }
          
          const hotelId = parseInt(id);
          if (isNaN(hotelId)) {
            throw new Error('Invalid hotel ID');
          }
          
          const hotelData = await getFullHotelDetails(hotelId);
          console.log("Hotel data loaded:", hotelData);
          
          if (!hotelData || !hotelData.hotel) {
            throw new Error('Hotel data not found');
          }
          
          // Safety check for setHotelDataFromApi function
          if (typeof setHotelDataFromApi !== 'function') {
            throw new Error('setHotelDataFromApi is not a function');
          }
          
          // Safety check for setCreatedHotelId function
          if (typeof setCreatedHotelId !== 'function') {
            throw new Error('setCreatedHotelId is not a function');
          }
          
          // Safety check for setHotelIdForEdit function
          if (typeof setHotelIdForEdit !== 'function') {
            throw new Error('setHotelIdForEdit is not a function');
          }
          
          await setHotelDataFromApi(hotelData);
          setHotelIdForEdit(hotelId);
          
          console.log("Hotel data set successfully for edit mode");
          toast.success(t("pages.add.loadedForEditing"));
        } catch (error: any) {
          console.error("Error loading hotel data:", error);
          toast.error(t("pages.add.failedToLoad") + ": " + error.message);
          // Navigate back to hotel list on error
          navigate('/view');
        }
      }
    };

    loadHotelData();
  }, [mode, id, setHotelDataFromApi, setHotelIdForEdit, t, navigate]);

  // Log the effective hotel ID for debugging
  useEffect(() => {
    console.log("Effective hotel ID changed:", effectiveHotelId);
    console.log("createdHotelId:", createdHotelId);
    console.log("routeHotelId:", routeHotelId);
  }, [effectiveHotelId, createdHotelId, routeHotelId]);

  // If we're on the events step, double-check we have a valid hotel ID
  useEffect(() => {
    if (activeStep === 'eventsInfo' && (!effectiveHotelId || effectiveHotelId === 0)) {
      console.error("⚠️ On events step but no valid hotel ID! effectiveHotelId:", effectiveHotelId);
      toast.error(t("pages.add.missingHotelId"));
    }
  }, [activeStep, effectiveHotelId, t]);

  return (
    <div className="flex flex-col h-full">
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

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b pb-4 -mx-4 px-4 mb-4">
        <Tabs value={activeStep} onValueChange={handleStepChange} className="w-full">
          <FormStepsTabs 
            activeStep={activeStep} 
            completedSteps={completedSteps} 
            onTabChange={handleStepChange} 
          />
        </Tabs>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2">
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
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <HotelPreview 
              hotelId={effectiveHotelId ? effectiveHotelId.toString() : undefined} 
              liveFormData={tempFormData} 
              currentStep={activeStep} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;
