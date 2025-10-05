import { DoorOpen, User, Phone, Mail, Clock, CreditCard, Home, Dog } from "lucide-react";
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
    if (typeof value === 'number') return String(value);
    return String(value);
  };

  // Calculate total from individual room types
  const singleRooms = roomInfo?.single_rooms ?? roomInfo?.room_counts?.single ?? 0;
  const doubleRooms = roomInfo?.double_rooms ?? roomInfo?.room_counts?.double ?? 0;
  const connectedRooms = roomInfo?.connected_rooms ?? roomInfo?.room_counts?.connecting ?? 0;
  const accessibleRooms = roomInfo?.accessible_rooms ?? roomInfo?.room_counts?.accessible ?? 0;
  const totalRooms = singleRooms + doubleRooms + connectedRooms + accessibleRooms;

  return (
    <div className="space-y-4">
      {/* Contact Information */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <User className="h-3.5 w-3.5" /> {t('rooms.mainContact', 'Main Contact')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('rooms.mainContact')}:</span> {show(roomInfo?.main_contact_name_room)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.position')}:</span> {show(roomInfo?.main_contact_position_room)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.phone')}:</span> {show(roomInfo?.room_phone)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.email')}:</span> {show(roomInfo?.room_email)}</p>
        </div>
      </div>

      {/* Check-in/Check-out */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Clock className="h-3.5 w-3.5" /> {t('rooms.checkInOut', 'Check-in & Check-out')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('rooms.preview.checkIn')}:</span> {show(roomInfo?.check_in_time ?? roomInfo?.check_in_out?.check_in_time)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.preview.checkOut')}:</span> {show(roomInfo?.check_out_time ?? roomInfo?.check_in_out?.check_out_time)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.earlyCheckInTimeFrame')}:</span> {show(roomInfo?.early_check_in_time_frame)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.earlyCheckInFee')}:</span> {roomInfo?.early_checkin_fee ? `${roomInfo.early_checkin_fee} € (${roomInfo.early_checkin_fee_type === 'per_hour' ? t('rooms.earlyCheckInFeeTypePerHour') : t('rooms.earlyCheckInFeeTypeFixed')})` : notSet}</p>
          <p><span className="text-foreground font-medium">{t('rooms.lateCheckOutTime')}:</span> {show(roomInfo?.late_check_out_tme)}</p>
          <p><span className="text-foreground font-medium">{t('rooms.lateCheckOutFee')}:</span> {roomInfo?.late_checkout_fee ? `${roomInfo.late_checkout_fee} €` : notSet}</p>
          <p><span className="text-foreground font-medium">{t('rooms.receptionHours')}:</span> {show(roomInfo?.reception_hours)}</p>
        </div>
      </div>

      {/* Room Counts */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Home className="h-3.5 w-3.5" /> {t('rooms.preview.roomOverview', 'Room Overview')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('rooms.preview.totalRooms')}:</span> {totalRooms > 0 ? totalRooms : notSet}</p>
          <p><span className="text-foreground font-medium">{t('rooms.singleRooms')}:</span> {singleRooms > 0 ? singleRooms : notSet}</p>
          <p><span className="text-foreground font-medium">{t('rooms.doubleRooms')}:</span> {doubleRooms > 0 ? doubleRooms : notSet}</p>
          <p><span className="text-foreground font-medium">{t('rooms.connectedRooms')}:</span> {connectedRooms > 0 ? connectedRooms : notSet}</p>
          <p><span className="text-foreground font-medium">{t('rooms.preview.accessibleRooms')}:</span> {accessibleRooms > 0 ? accessibleRooms : notSet}</p>
        </div>
      </div>

      {/* Standard Features */}
      {roomInfo?.standard_features && Array.isArray(roomInfo.standard_features) && roomInfo.standard_features.length > 0 && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <DoorOpen className="h-3.5 w-3.5" /> {t('rooms.standardFeatures', 'Standard Features')}
          </h3>
          <div className="text-xs text-muted-foreground">
            <p>{roomInfo.standard_features.join(', ')}</p>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {roomInfo?.payment_methods && Array.isArray(roomInfo.payment_methods) && roomInfo.payment_methods.length > 0 && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <CreditCard className="h-3.5 w-3.5" /> {t('rooms.paymentMethods', 'Payment Methods')}
          </h3>
          <div className="text-xs text-muted-foreground">
            <p>{roomInfo.payment_methods.join(', ')}</p>
          </div>
        </div>
      )}

      {/* Pet Policy */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Dog className="h-3.5 w-3.5" /> {t('rooms.petPolicy', 'Pet Policy')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('rooms.preview.petsAllowed')}:</span> {formatBooleanValue(roomInfo?.dogs_allowed ?? roomInfo?.pet_policy?.pets_allowed)}</p>
          {(roomInfo?.dogs_allowed || roomInfo?.pet_policy?.pets_allowed) && (
            <>
              <p><span className="text-foreground font-medium">{t('rooms.dogFee')}:</span> {roomInfo?.dog_fee ? `${roomInfo.dog_fee} € (${roomInfo.dog_fee_type === 'per_hour' ? t('rooms.dogFeeTypePerHour') : t('rooms.dogFeeTypeFixed')})` : notSet}</p>
              <p><span className="text-foreground font-medium">{t('rooms.dogFeeInclusions')}:</span> {show(roomInfo?.dog_fee_inclusions)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomInfoPreview;
