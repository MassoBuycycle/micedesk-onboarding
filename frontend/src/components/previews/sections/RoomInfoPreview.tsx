import { DoorOpen } from "lucide-react";
import { RoomInfo } from "@/apiClient/roomsApi";
import { useTranslation } from "react-i18next";

interface RoomInfoPreviewProps {
  roomInfo: RoomInfo | null;
}

const RoomInfoPreview = ({ roomInfo }: RoomInfoPreviewProps) => {
  const { t } = useTranslation();

  // Helper function to handle boolean display
  const formatBooleanValue = (value: any): string => {
    // Handle numeric 1/0 as well as boolean true/false
    if (value === 1 || value === true || value === "1" || value === "true") {
      return t('common.yes');
    } else if (value === 0 || value === false || value === "0" || value === "false") {
      return t('common.no');
    }
    return String(value);
  };
  
  const notSet = t('common.notSet', 'Nicht gesetzt');
  const show = (value: any): string => {
    if (value === undefined || value === null) return notSet;
    if (typeof value === 'string' && value.trim() === '') return notSet;
    return String(value);
  };

  const totalRooms = roomInfo.room_counts ? 
    (roomInfo.room_counts.single || 0) + 
    (roomInfo.room_counts.double || 0) + 
    (roomInfo.room_counts.connecting || 0) + 
    (roomInfo.room_counts.accessible || 0)
    : null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <DoorOpen className="h-4 w-4" /> {t('rooms.preview.roomOverview')}
      </h3>
      <div className="text-sm text-muted-foreground space-y-1.5">
        <p><span className="text-foreground font-medium">{t('rooms.preview.totalRooms')}:</span> {totalRooms !== null ? totalRooms : notSet}</p>
        <p><span className="text-foreground font-medium">{t('rooms.preview.accessibleRooms')}:</span> {roomInfo?.room_counts?.accessible ?? 0}</p>
        <p><span className="text-foreground font-medium">{t('rooms.preview.petsAllowed')}:</span> {roomInfo?.pet_policy?.pets_allowed === undefined ? notSet : formatBooleanValue(roomInfo.pet_policy.pets_allowed)}</p>
        <p><span className="text-foreground font-medium">{t('rooms.preview.internetAvailable')}:</span> {roomInfo?.internetAvailable === undefined ? notSet : formatBooleanValue(roomInfo.internetAvailable)}</p>
        <p><span className="text-foreground font-medium">{t('rooms.preview.airConditioning')}:</span> {roomInfo?.airConditioning === undefined ? notSet : formatBooleanValue(roomInfo.airConditioning)}</p>
        <p><span className="text-foreground font-medium">{t('rooms.preview.checkIn')}:</span> {show(roomInfo?.check_in_out?.check_in_time)}</p>
        <p><span className="text-foreground font-medium">{t('rooms.preview.checkOut')}:</span> {show(roomInfo?.check_in_out?.check_out_time)}</p>
      </div>
    </div>
  );
};

export default RoomInfoPreview;
