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
  
  // Always render with fallbacks so the section is visible during editing
  const notSet = t('common.notSet', 'Nicht gesetzt');
  const show = (v:any) => (v===undefined || v===null || v==='' ? notSet : v);

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <CalendarCheck className="h-4 w-4" /> Veranstaltungsbereiche
      </h3>
      <div className="text-sm text-muted-foreground space-y-1.5">
        <p><span className="text-foreground font-medium">{t('events.totalSpaces', { defaultValue: 'Veranstaltungsräume gesamt' })}:</span> {show(eventsInfo?.totalEventSpaces)}</p>
        <p><span className="text-foreground font-medium">{t('events.largestSpace', { defaultValue: 'Größter Raum' })}:</span> {eventsInfo?.largestSpace ? `${eventsInfo.largestSpace} m²` : notSet}</p>
        <p><span className="text-foreground font-medium">{t('events.maxCapacity', { defaultValue: 'Maximale Kapazität' })}:</span> {eventsInfo?.maxCapacity ? `${eventsInfo.maxCapacity} ${t('events.persons', { defaultValue: 'Personen' })}` : notSet}</p>
        <p><span className="text-foreground font-medium">{t('events.eventCoordinator', { defaultValue: 'Veranstaltungskoordinator' })}:</span> {eventsInfo?.eventCoordinator === undefined ? notSet : formatBooleanValue(eventsInfo.eventCoordinator)}</p>
        <p><span className="text-foreground font-medium">{t('events.audioVisual', { defaultValue: 'A/V-Equipment' })}:</span> {eventsInfo?.hasAudioVisual === undefined ? notSet : formatBooleanValue(eventsInfo.hasAudioVisual)}</p>
        <p><span className="text-foreground font-medium">{t('events.catering', { defaultValue: 'Catering' })}:</span> {eventsInfo?.cateringAvailable === undefined ? notSet : formatBooleanValue(eventsInfo.cateringAvailable)}</p>
        <p><span className="text-foreground font-medium">{t('events.outdoorSpace', { defaultValue: 'Außenfläche' })}:</span> {eventsInfo?.outdoorSpaceAvailable === undefined ? notSet : formatBooleanValue(eventsInfo.outdoorSpaceAvailable)}</p>
      </div>
    </div>
  );
};

export default EventsInfoPreview;
