
import { Building, CreditCard, Info, MapPin, Link as LinkIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface HotelInfoPreviewProps {
  hotel: any;
}

const HotelInfoPreview = ({ hotel }: HotelInfoPreviewProps) => {
  const { t } = useTranslation();
  if (!hotel || Object.keys(hotel).length === 0) return null;

  const notSet = t('common.notSet', 'Nicht gesetzt');
  const displayValue = (value: any): string | number => {
    if (value === null || value === undefined) return notSet;
    if (typeof value === 'number') return value === 0 ? notSet : value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || /^0+$/.test(trimmed)) return notSet;
      return trimmed;
    }
    return String(value);
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Basic Information Section (always show with fallback) */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Building className="h-3.5 w-3.5" /> {t('hotel.basicInfo', 'Basic Information')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.name')}:</span> {displayValue(hotel?.name)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.street')}:</span> {displayValue(hotel?.street)}</p>
          <p>
            <span className="text-foreground font-medium">{t('hotel.city')}:</span> {displayValue(hotel?.city)}{hotel?.country ? `, ${hotel.country}` : ''}
          </p>
          <p><span className="text-foreground font-medium">{t('hotel.postalCode', 'Postal code')}:</span> {displayValue(hotel?.postalCode)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.phone')}:</span> {displayValue(hotel?.phone)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.fax', 'Fax')}:</span> {displayValue(hotel?.fax)}</p>
          <p><span className="text-foreground font-medium">{t('auth.email')}:</span> {displayValue(hotel?.email)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.website')}:</span> {displayValue(hotel?.website)}</p>
          <p className="mt-1.5 border-t pt-1.5">
            <span className="text-foreground font-medium">{t('hotel.description')}:</span><br />
            <span className="italic text-xs">{displayValue(hotel?.description)}</span>
          </p>
        </div>
      </div>

      {/* Billing Information Section (always show with fallback) */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <CreditCard className="h-3.5 w-3.5" /> {t('hotel.billingDetails', 'Billing Information')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.billingName')}:</span> {displayValue(hotel?.billingAddressName)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.billingStreet')}:</span> {displayValue(hotel?.billingAddressStreet)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.billingZip', 'ZIP')}:</span> {displayValue(hotel?.billingAddressZip)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.billingCity')}:</span> {displayValue(hotel?.billingAddressCity)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.billingVat')}:</span> {displayValue(hotel?.billingAddressVat)}</p>
        </div>
      </div>

      {/* Hotel Details Section (always show with fallback) */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Info className="h-3.5 w-3.5" /> {t('hotels.overview', 'Hotel Details')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.starRating')}:</span> {displayValue(hotel?.starRating)} {hotel?.starRating ? t('hotels.stars', 'Stars') : ''}</p>
          <p><span className="text-foreground font-medium">{t('hotel.category')}:</span> {displayValue(hotel?.category)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.openingDate')}:</span> {displayValue(hotel?.openingDate)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.renovationDate')}:</span> {displayValue(hotel?.latestRenovationDate)}</p>
        </div>
      </div>

      {/* Location & Distances (always show with fallback) */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <MapPin className="h-3.5 w-3.5" /> {t('hotels.distances', 'Location & Distances')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotels.airport')}:</span> {displayValue(hotel?.distanceToAirportKm)}</p>
          <p><span className="text-foreground font-medium">{t('hotels.highway')}:</span> {displayValue(hotel?.distanceToHighwayKm)}</p>
          <p><span className="text-foreground font-medium">{t('hotels.fair')}:</span> {displayValue(hotel?.distanceToFairKm)}</p>
          <p><span className="text-foreground font-medium">{t('hotels.trainStation')}:</span> {displayValue(hotel?.distanceToTrainStation)}</p>
          <p><span className="text-foreground font-medium">{t('hotels.publicTransport')}:</span> {displayValue(hotel?.distanceToPublicTransport)}</p>
          <p><span className="text-foreground font-medium">{t('events.overview', 'Nearby Attractions')}:</span> {displayValue(hotel?.airportNote)}</p>
        </div>
      </div>

      {/* Additional Information (always show with fallback) */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Info className="h-3.5 w-3.5" /> {t('hotel.additionalInfo', 'Additional Information')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.plannedChanges')}:</span> {displayValue(hotel?.plannedChanges)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.attractions')}:</span> {displayValue(hotel?.attractionInTheArea)}</p>
        </div>
      </div>

      {/* Additional Links */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <LinkIcon className="h-3.5 w-3.5" /> {t('hotel.additionalLinks')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          {Array.isArray(hotel?.additionalLinks) && hotel.additionalLinks.length > 0 ? (
            hotel.additionalLinks.map((l: any, idx: number) => (
              <p key={`${l.name}-${idx}`}>
                {l.name ? <span className="text-foreground font-medium">{l.name}: </span> : null}
                {l.link}
              </p>
            ))
          ) : (
            <p>{notSet}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelInfoPreview;
