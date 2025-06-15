import { CalendarRange } from "lucide-react";

interface EventSpacesPreviewProps {
  eventSpaces: any[];
}

const EventSpacesPreview = ({ eventSpaces }: EventSpacesPreviewProps) => {
  if (!eventSpaces || eventSpaces.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
          <CalendarRange className="h-4 w-4" /> Veranstaltungsräume
        </h3>
        <p className="text-sm italic text-muted-foreground">Noch keine Veranstaltungsräume hinzugefügt</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <CalendarRange className="h-4 w-4" /> Veranstaltungsräume
      </h3>
      <div className="text-sm text-muted-foreground space-y-4">
        {eventSpaces.map((space, index) => (
          <div key={space.id || index} className="border-l-2 border-primary/30 pl-3 py-1">
            <p className="font-medium text-foreground">{space.name || `Event Space ${index + 1}`}</p>
            <div className="space-y-1 mt-1">
              {space.cap_cocktail && <p><span className="text-foreground font-medium">Kapazität:</span> {space.cap_cocktail} Personen</p>}
              {space.size && <p><span className="text-foreground font-medium">Größe:</span> {space.size} m²</p>}
              {space.dimensions && <p><span className="text-foreground font-medium">Abmessungen:</span> {space.dimensions}</p>}
              
              {/* Seating capacity details */}
              <div className="mt-2">
                <span className="text-foreground font-medium">Bestuhlungs­kapazitäten:</span>
                <div className="grid grid-cols-2 gap-x-4 mt-1 ml-2">
                  {space.cap_theatre && <p>Theater: {space.cap_theatre}</p>}
                  {space.cap_classroom && <p>Seminar: {space.cap_classroom}</p>}
                  {space.cap_u_shape && <p>U-Form: {space.cap_u_shape}</p>}
                  {space.cap_boardroom && <p>Boardroom: {space.cap_boardroom}</p>}
                  {space.cap_rounds && <p>Runden: {space.cap_rounds}</p>}
                  {space.cap_cabaret && <p>Kabarett: {space.cap_cabaret}</p>}
                </div>
              </div>
              
              {/* Rates */}
              <div className="mt-2">
                {space.daily_rate && <p><span className="text-foreground font-medium">Tagesrate:</span> €{space.daily_rate}</p>}
                {space.half_day_rate && <p><span className="text-foreground font-medium">Halbtagesrate:</span> €{space.half_day_rate}</p>}
              </div>
              
              {/* Features */}
              <div className="mt-2">
                <span className="text-foreground font-medium">Merkmale:</span>
                <div className="flex flex-wrap gap-1 mt-1 ml-2">
                  {space.has_daylight && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Tageslicht</span>}
                  {space.is_soundproof && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Schalldicht</span>}
                  {space.has_blackout && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Verdunkelbar</span>}
                  {space.has_climate_control && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Klimatisiert</span>}
                  {space.supports_hybrid && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Hybrid</span>}
                  {space.has_tech_support && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">Technik-Support</span>}
                </div>
              </div>
              
              {/* Technical info */}
              {(space.wifi_speed || space.beamer_lumens || space.presentation_software) && (
                <div className="mt-2">
                  <span className="text-foreground font-medium">Technische Infos:</span>
                  <div className="mt-1 ml-2">
                    {space.wifi_speed && <p>WLAN: {space.wifi_speed}</p>}
                    {space.beamer_lumens && <p>Beamer: {space.beamer_lumens} Lumen</p>}
                    {space.presentation_software && <p>Software: {space.presentation_software}</p>}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {space.features && (
                <p className="mt-2"><span className="text-foreground font-medium">Beschreibung:</span> {space.features}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSpacesPreview; 