import { CalendarCheck } from "lucide-react";

interface EventsInfoPreviewProps {
  eventsInfo: any;
}

const EventsInfoPreview = ({ eventsInfo }: EventsInfoPreviewProps) => {
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
          <p><span className="text-foreground font-medium">Veranstaltungskoordinator:</span> {eventsInfo.eventCoordinator ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
        {eventsInfo?.hasAudioVisual !== undefined && (
          <p><span className="text-foreground font-medium">A/V-Equipment:</span> {eventsInfo.hasAudioVisual ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
        {eventsInfo?.cateringAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Catering:</span> {eventsInfo.cateringAvailable ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
        {eventsInfo?.outdoorSpaceAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Außenfläche:</span> {eventsInfo.outdoorSpaceAvailable ? 'Verfügbar' : 'Nicht verfügbar'}</p>
        )}
      </div>
    </div>
  );
};

export default EventsInfoPreview;
