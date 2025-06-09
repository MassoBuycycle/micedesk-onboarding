
import { CalendarCheck } from "lucide-react";

interface EventsInfoPreviewProps {
  eventsInfo: any;
}

const EventsInfoPreview = ({ eventsInfo }: EventsInfoPreviewProps) => {
  if (!eventsInfo || Object.keys(eventsInfo).length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <CalendarCheck className="h-4 w-4" /> Event Facilities
      </h3>
      <div className="text-sm text-muted-foreground space-y-1.5">
        {eventsInfo?.totalEventSpaces && <p><span className="text-foreground font-medium">Total Event Spaces:</span> {eventsInfo.totalEventSpaces}</p>}
        {eventsInfo?.largestSpace && <p><span className="text-foreground font-medium">Largest Space:</span> {eventsInfo.largestSpace} sqm</p>}
        {eventsInfo?.maxCapacity && <p><span className="text-foreground font-medium">Maximum Capacity:</span> {eventsInfo.maxCapacity} people</p>}
        {eventsInfo?.eventCoordinator !== undefined && (
          <p><span className="text-foreground font-medium">Event Coordinator:</span> {eventsInfo.eventCoordinator ? 'Available' : 'Not Available'}</p>
        )}
        {eventsInfo?.hasAudioVisual !== undefined && (
          <p><span className="text-foreground font-medium">A/V Equipment:</span> {eventsInfo.hasAudioVisual ? 'Available' : 'Not Available'}</p>
        )}
        {eventsInfo?.cateringAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Catering:</span> {eventsInfo.cateringAvailable ? 'Available' : 'Not Available'}</p>
        )}
        {eventsInfo?.outdoorSpaceAvailable !== undefined && (
          <p><span className="text-foreground font-medium">Outdoor Space:</span> {eventsInfo.outdoorSpaceAvailable ? 'Available' : 'Not Available'}</p>
        )}
      </div>
    </div>
  );
};

export default EventsInfoPreview;
