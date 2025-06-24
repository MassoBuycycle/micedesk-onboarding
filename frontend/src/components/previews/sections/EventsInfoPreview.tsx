import { CalendarCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EventsInfoPreviewProps {
  eventsInfo: any;
}

const EventsInfoPreview = ({ eventsInfo }: EventsInfoPreviewProps) => {
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
  
  if (!eventsInfo || Object.keys(eventsInfo).length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <CalendarCheck className="h-4 w-4" /> Veranstaltungsbereiche
      </h3>
      <div className="text-sm text-muted-foreground space-y-1.5">
        {eventsInfo?.totalEventSpaces && <p><span className="text-foreground font-medium">Veranstaltungsräume gesamt:</span> {eventsInfo.totalEventSpaces}</p>}
        {eventsInfo?.largestSpace && <p><span className="text-foreground font-medium">Größter Raum:</span> {eventsInfo.largestSpace} m²</p>}
        {eventsInfo?.maxCapacity && <p><span className="text-foreground font-medium">Maximale Kapazität:</span> {eventsInfo.maxCapacity} Personen</p>}
        {eventsInfo?.eventCoordinator !== undefined && (
          <p><span className="text-foreground font-medium">Veranstaltungskoordinator:</span> {formatBooleanValue(eventsInfo.eventCoordinator)}</p>
        )}
        {eventsInfo?.hasAudioVisual !== undefined && (
          <p><span className="text-foreground font-medium">A/V-Equipment:</span> {formatBooleanValue(eventsInfo.hasAudioVisual)}</p>
        )}
        {eventsInfo?.cateringAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Catering:</span> {formatBooleanValue(eventsInfo.cateringAvailable)}</p>
        )}
        {eventsInfo?.outdoorSpaceAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Außenfläche:</span> {formatBooleanValue(eventsInfo.outdoorSpaceAvailable)}</p>
        )}
      </div>
    </div>
  );
};

export default EventsInfoPreview;
