import { DoorOpen } from "lucide-react";
import { RoomInfo } from "@/apiClient/roomsApi";
import { useTranslation } from "react-i18next";

interface RoomInfoPreviewProps {
  roomInfo: RoomInfo | null;
}

const RoomInfoPreview = ({ roomInfo }: RoomInfoPreviewProps) => {
  const { t } = useTranslation();
  
  if (!roomInfo || Object.keys(roomInfo).length === 0) {
    return (
        <div className="text-sm italic text-muted-foreground">
            Loading room details or none available...
        </div>
    );
  }

  const totalRooms = roomInfo.room_counts ? 
    (roomInfo.room_counts.single || 0) + 
    (roomInfo.room_counts.double || 0) + 
    (roomInfo.room_counts.connecting || 0) + 
    (roomInfo.room_counts.accessible || 0)
    : null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <DoorOpen className="h-4 w-4" /> Room Overview
      </h3>
      <div className="text-sm text-muted-foreground space-y-1.5">
        {totalRooms !== null && totalRooms > 0 && <p><span className="text-foreground font-medium">Total Rooms:</span> {totalRooms}</p>}
        {roomInfo.room_counts?.accessible !== undefined && roomInfo.room_counts.accessible > 0 && 
          <p><span className="text-foreground font-medium">Accessible Rooms:</span> {roomInfo.room_counts.accessible}</p>}
        {roomInfo.pet_policy?.pets_allowed !== undefined && (
          <p><span className="text-foreground font-medium">Pets Allowed:</span> {roomInfo.pet_policy.pets_allowed ? t('common.yes') : t('common.no')}</p>
        )}
        {roomInfo?.internetAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Internet Available:</span> {roomInfo.internetAvailable ? t('common.yes') : t('common.no')}</p>
        )}
        {roomInfo?.airConditioning !== undefined && (
          <p><span className="text-foreground font-medium">Air Conditioning:</span> {roomInfo.airConditioning ? t('common.yes') : t('common.no')}</p>
        )}
        {roomInfo.check_in_out?.check_in_time && <p><span className="text-foreground font-medium">Check-in:</span> {roomInfo.check_in_out.check_in_time}</p>}
        {roomInfo.check_in_out?.check_out_time && <p><span className="text-foreground font-medium">Check-out:</span> {roomInfo.check_in_out.check_out_time}</p>}
      </div>
    </div>
  );
};

export default RoomInfoPreview;
