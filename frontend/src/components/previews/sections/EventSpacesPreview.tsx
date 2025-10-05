import { CalendarRange } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface EventSpacesPreviewProps {
  eventSpaces: any[];
}

const EventSpacesPreview = ({ eventSpaces }: EventSpacesPreviewProps) => {
  const { t } = useTranslation();
  if (!eventSpaces || eventSpaces.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
          <CalendarRange className="h-4 w-4" /> {t('events.eventSpaces')}
        </h3>
        <p className="text-sm italic text-muted-foreground">{t('events.preview.noEventSpaces')}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 pb-1 border-b">
        <CalendarRange className="h-4 w-4" /> {t('events.eventSpaces')}
      </h3>
      <div className="text-sm text-muted-foreground space-y-4">
        {eventSpaces.map((space, index) => (
          <div key={space.id || index} className="border-l-2 border-primary/30 pl-3 py-1">
            <p className="font-medium text-foreground">{space.name || `${t('events.eventSpaces')} ${index + 1}`}</p>
            <div className="space-y-1 mt-1">
              {space.cap_cocktail && <p><span className="text-foreground font-medium">{t('events.capacity')}:</span> {space.cap_cocktail} {t('events.persons')}</p>}
              {space.size && <p><span className="text-foreground font-medium">{t('events.size')}:</span> {space.size} m²</p>}
              {space.dimensions && <p><span className="text-foreground font-medium">{t('events.preview.dimensions')}:</span> {space.dimensions}</p>}
              
              {/* Seating capacity details */}
              <div className="mt-2">
                <span className="text-foreground font-medium">{t('events.preview.seatingCapacities')}</span>
                <div className="grid grid-cols-2 gap-x-4 mt-1 ml-2">
                  {space.cap_theatre ? <p>{t('events.eventForm.spaces.theatre')}: {space.cap_theatre}</p> : null}
                  {space.cap_classroom ? <p>{t('events.eventForm.spaces.parliamentary') || t('events.eventForm.spaces.classroom')}: {space.cap_classroom}</p> : null}
                  {space.cap_u_shape ? <p>{t('events.eventForm.spaces.uShape')}: {space.cap_u_shape}</p> : null}
                  {space.cap_boardroom ? <p>{t('events.eventForm.spaces.block') || t('events.eventForm.spaces.boardroom')}: {space.cap_boardroom}</p> : null}
                  {space.cap_rounds ? <p>{t('events.eventForm.spaces.roundTables') || t('events.eventForm.spaces.rounds')}: {space.cap_rounds}</p> : null}
                  {space.cap_cabaret ? <p>{t('events.eventForm.spaces.cabaret')}: {space.cap_cabaret}</p> : null}
                  {space.cap_cocktail ? <p>{t('events.eventForm.spaces.cocktail')}: {space.cap_cocktail}</p> : null}
                </div>
              </div>
              
              {/* Rates */}
              <div className="mt-2">
                {space.daily_rate && <p><span className="text-foreground font-medium">{t('events.eventForm.spaces.dailyRate')}:</span> €{space.daily_rate}</p>}
                {space.half_day_rate && <p><span className="text-foreground font-medium">{t('events.eventForm.spaces.halfDayRate')}:</span> €{space.half_day_rate}</p>}
              </div>
              
              {/* Features removed per request */}
              
              {/* Technical info */}
              {(space.wifi_speed || space.beamer_lumens || space.presentation_software) && (
                <div className="mt-2">
                  <span className="text-foreground font-medium">{t('events.preview.technicalInfo')}</span>
                  <div className="mt-1 ml-2">
                    {space.wifi_speed && <p>{t('events.preview.wifi')}: {space.wifi_speed}</p>}
                    {space.beamer_lumens && <p>{t('events.preview.beamer')}: {space.beamer_lumens} {t('events.preview.lumens')}</p>}
                    {space.presentation_software && <p>{t('events.preview.software')}: {space.presentation_software}</p>}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {space.features && (
                <p className="mt-2"><span className="text-foreground font-medium">{t('common.description')}:</span> {space.features}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSpacesPreview; 