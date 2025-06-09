import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HotelInfoPreview from "./sections/HotelInfoPreview";
import RoomInfoPreview from "./sections/RoomInfoPreview";
import RoomCategoriesPreview from "./sections/RoomCategoriesPreview";
import FoodBeveragePreview from "./sections/FoodBeveragePreview";
import EventsInfoPreview from "./sections/EventsInfoPreview";
import EventSpacesPreview from "./sections/EventSpacesPreview";
import UserAssignmentPreview from "./sections/UserAssignmentPreview";
import { FormStep, HotelFormData } from "@/hooks/useHotelFormState";
import { getRoomInfo, RoomInfo } from "@/apiClient/roomsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCog } from "lucide-react";

interface HotelPreviewProps {
  hotelId?: string;
  liveFormData?: HotelFormData;
  currentStep?: FormStep;
}

const HotelPreview: React.FC<HotelPreviewProps> = ({ 
  hotelId = "preview", 
  liveFormData,
  currentStep 
}) => {
  const [actualRoomInfo, setActualRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoadingRoomInfo, setIsLoadingRoomInfo] = useState(false);
  const [errorRoomInfo, setErrorRoomInfo] = useState<string | null>(null);
  const hasLoadedRoomInfo = useRef(false);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (hasLoadedRoomInfo.current) return;
      
      setIsLoadingRoomInfo(true);
      setErrorRoomInfo(null);
      try {
        const data = await getRoomInfo(); 
        setActualRoomInfo(data);
        hasLoadedRoomInfo.current = true;
      } catch (error: any) {
        console.error("Failed to fetch room info for preview:", error);
        setErrorRoomInfo(error.message || "Failed to load room details");
        setActualRoomInfo(null);
      } finally {
        setIsLoadingRoomInfo(false);
      }
    };

    fetchRoomInfo();
  }, []);

  const hotelData = liveFormData?.hotel || {};
  const roomCategoriesData = liveFormData?.roomCategories || [];
  const foodBeverageData = liveFormData?.foodBeverage || {};
  const eventsData = liveFormData?.eventsInfo || {};
  const eventSpacesData = liveFormData?.eventSpaces || [];
  
  const hotelName = hotelData.name || "New Hotel";
  
  const getActiveTab = (): string => {
    if (!currentStep) return "info";
    
    if (currentStep === "hotel") return "info";
    if (currentStep === "roomInfo" || currentStep === "roomCategories" || currentStep === "roomHandling") return "rooms";
    if (currentStep === "eventsInfo" || currentStep === "eventSpaces") return "events";
    if (currentStep === "foodBeverage") return "food";
    
    return "info";
  };

  const activeTabValue = getActiveTab();

  return (
    <div className="bg-gradient-to-br from-accent/5 via-accent/10 to-accent/20 rounded-lg border-0 shadow-[0_4px_15px_rgba(0,0,0,0.06)]">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Preview: {hotelName}</h3>
        <p className="text-xs text-muted-foreground">
          Real-time preview of your hotel information
        </p>
      </div>

      <Tabs value={activeTabValue} className="w-full">
        <TabsList className="w-full grid grid-cols-5 rounded-none">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="food">F&B</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="info" className="mt-0">
            <HotelInfoPreview hotel={hotelData} />
          </TabsContent>

          <TabsContent value="rooms" className="mt-0">
            {isLoadingRoomInfo && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
            {errorRoomInfo && <p className="text-xs text-destructive">Error: {errorRoomInfo}</p>}
            {!isLoadingRoomInfo && !errorRoomInfo && actualRoomInfo && (
              <RoomInfoPreview roomInfo={actualRoomInfo} />
            )}
            <RoomCategoriesPreview roomCategories={roomCategoriesData} />
          </TabsContent>

          <TabsContent value="food" className="mt-0">
            <FoodBeveragePreview foodBeverage={foodBeverageData} />
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <EventsInfoPreview eventsInfo={eventsData} />
            <div className="mt-6">
              <EventSpacesPreview eventSpaces={eventSpacesData} />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            {hotelId && hotelId !== "preview" ? (
              <UserAssignmentPreview hotelId={hotelId} hotelName={hotelName} />
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    User Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    User assignments will be available after the hotel is created.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HotelPreview;
