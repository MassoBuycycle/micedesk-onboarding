
import { CalendarRange } from "lucide-react";

interface EventCategoriesPreviewProps {
  eventCategories: any[];
}

const EventCategoriesPreview = ({ eventCategories }: EventCategoriesPreviewProps) => {
  if (!eventCategories || eventCategories.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
          <CalendarRange className="h-4 w-4" /> Event Spaces
        </h3>
        <p className="text-sm italic text-muted-foreground">No event spaces added yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <CalendarRange className="h-4 w-4" /> Event Spaces
      </h3>
      <div className="text-sm text-muted-foreground space-y-4">
        {eventCategories.map((space, index) => (
          <div key={space.id || index} className="border-l-2 border-primary/30 pl-3 py-1">
            <p className="font-medium text-foreground">{space.name || `Event Space ${index + 1}`}</p>
            <div className="space-y-1 mt-1">
              {space.capacity && <p><span className="text-foreground font-medium">Capacity:</span> {space.capacity} people</p>}
              {space.size && <p><span className="text-foreground font-medium">Size:</span> {space.size} sqm</p>}
              {space.layout && <p><span className="text-foreground font-medium">Layout:</span> {
                {
                  "theater": "Theater",
                  "classroom": "Classroom",
                  "boardroom": "Boardroom",
                  "u-shape": "U-Shape",
                  "banquet": "Banquet",
                  "reception": "Reception",
                  "hollow-square": "Hollow Square"
                }[space.layout] || space.layout
              }</p>}
              {space.features && space.features.length > 0 && (
                <p><span className="text-foreground font-medium">Features:</span> {space.features.join(', ')}</p>
              )}
              {space.description && <p><span className="text-foreground font-medium">Description:</span> {space.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCategoriesPreview;
