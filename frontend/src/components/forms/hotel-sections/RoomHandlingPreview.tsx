import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoomHandlingPreviewProps {
  roomHandling: any;
}

const RoomHandlingPreview = ({ roomHandling }: RoomHandlingPreviewProps) => {
  const { t } = useTranslation();
  
  if (!roomHandling || Object.keys(roomHandling).length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
        <Clock className="h-3.5 w-3.5" /> Room Handling
      </h3>
      <div className="text-xs text-muted-foreground space-y-1">
        {roomHandling?.checkInTime && <p><span className="text-foreground font-medium">Check-in Time:</span> {roomHandling.checkInTime}</p>}
        {roomHandling?.checkOutTime && <p><span className="text-foreground font-medium">Check-out Time:</span> {roomHandling.checkOutTime}</p>}
        {roomHandling?.lateCheckout !== undefined && (
          <p><span className="text-foreground font-medium">Late Check-out:</span> {roomHandling.lateCheckout ? t('events.available') : t('events.notAvailable')}</p>
        )}
        {roomHandling?.lateCheckoutFee && <p><span className="text-foreground font-medium">Late Check-out Fee:</span> {roomHandling.lateCheckoutFee}</p>}
        {roomHandling?.guaranteePolicy && <p><span className="text-foreground font-medium">Guarantee Policy:</span> {roomHandling.guaranteePolicy}</p>}
        {roomHandling?.cancellationPolicy && <p><span className="text-foreground font-medium">Cancellation Policy:</span> {roomHandling.cancellationPolicy}</p>}
        {roomHandling?.keyType && <p><span className="text-foreground font-medium">Key Type:</span> {roomHandling.keyType}</p>}
      </div>
    </div>
  );
};

export default RoomHandlingPreview;
