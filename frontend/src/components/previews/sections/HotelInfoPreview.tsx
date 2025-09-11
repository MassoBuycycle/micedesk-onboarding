
import { Building, CreditCard, Info, MapPin, Link as LinkIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface HotelInfoPreviewProps {
  hotel: any;
}

const HotelInfoPreview = ({ hotel }: HotelInfoPreviewProps) => {
  const { t } = useTranslation();
  if (!hotel || Object.keys(hotel).length === 0) return null;

  return (
    <div className="space-y-4 text-sm">
      {/* Basic Information Section */}
      {(hotel?.name || hotel?.street || hotel?.postalCode || hotel?.city || hotel?.country ||
        hotel?.phone || hotel?.fax || hotel?.email || hotel?.website) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <Building className="h-3.5 w-3.5" /> {t('hotel.basicInfo', 'Basic Information')}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.name && <p><span className="text-foreground font-medium">{t('hotel.name')}:</span> {hotel.name}</p>}
            {hotel?.street && <p><span className="text-foreground font-medium">{t('hotel.street')}:</span> {hotel.street}</p>}
            {(hotel?.postalCode || hotel?.city) && (
              <p>
                {hotel?.postalCode && <span>{hotel.postalCode} </span>}
                {hotel?.city && <span>{hotel.city}</span>}
                {hotel?.country && <span>, {hotel.country}</span>}
              </p>
            )}
            {hotel?.phone && <p><span className="text-foreground font-medium">{t('hotel.phone')}:</span> {hotel.phone}</p>}
            {hotel?.fax && <p><span className="text-foreground font-medium">{t('hotel.fax', 'Fax')}:</span> {hotel.fax}</p>}
            {hotel?.email && <p><span className="text-foreground font-medium">{t('auth.email')}:</span> {hotel.email}</p>}
            {hotel?.website && <p><span className="text-foreground font-medium">{t('hotel.website')}:</span> {hotel.website}</p>}
            {hotel?.description && (
              <p className="mt-1.5 border-t pt-1.5">
                <span className="text-foreground font-medium">{t('hotel.description')}:</span><br />
                <span className="italic text-xs">"{hotel.description}"</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Billing Information Section */}
      {(hotel?.billingAddressName || hotel?.billingAddressStreet ||
        hotel?.billingAddressCity || hotel?.billingAddressVat) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <CreditCard className="h-3.5 w-3.5" /> {t('hotel.billingDetails', 'Billing Information')}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.billingAddressName && <p><span className="text-foreground font-medium">{t('hotel.billingName')}:</span> {hotel.billingAddressName}</p>}
            {hotel?.billingAddressStreet && <p><span className="text-foreground font-medium">{t('hotel.billingStreet')}:</span> {hotel.billingAddressStreet}</p>}
            {(hotel?.billingAddressZip || hotel?.billingAddressCity) && (
              <p>
                {hotel?.billingAddressZip && <span>{hotel.billingAddressZip} </span>}
                {hotel?.billingAddressCity && <span>{hotel.billingAddressCity}</span>}
              </p>
            )}
            {hotel?.billingAddressVat && <p><span className="text-foreground font-medium">{t('hotel.billingVat')}:</span> {hotel.billingAddressVat}</p>}
          </div>
        </div>
      )}

      {/* Hotel Details Section */}
      {(hotel?.starRating || hotel?.category || hotel?.openingDate ||
        hotel?.latestRenovationDate) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <Info className="h-3.5 w-3.5" /> {t('hotels.overview', 'Hotel Details')}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.starRating !== undefined && <p><span className="text-foreground font-medium">{t('hotel.starRating')}:</span> {hotel.starRating} {t('hotels.stars', 'Stars')}</p>}
            {hotel?.category && <p><span className="text-foreground font-medium">{t('hotel.category')}:</span> {hotel.category}</p>}
            {hotel?.openingDate && <p><span className="text-foreground font-medium">{t('hotel.openingDate')}:</span> {hotel.openingDate}</p>}
            {hotel?.latestRenovationDate && <p><span className="text-foreground font-medium">{t('hotel.renovationDate')}:</span> {hotel.latestRenovationDate}</p>}
          </div>
        </div>
      )}

      {/* Location & Distances */}
      {(hotel?.distanceToAirportKm || hotel?.distanceToHighwayKm || hotel?.distanceToFairKm ||
        hotel?.distanceToTrainStation || hotel?.distanceToPublicTransport || hotel?.airportNote) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <MapPin className="h-3.5 w-3.5" /> {t('hotels.distances', 'Location & Distances')}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.distanceToAirportKm !== undefined && <p><span className="text-foreground font-medium">{t('hotels.airport')}:</span> {hotel.distanceToAirportKm} km</p>}
            {hotel?.distanceToHighwayKm !== undefined && <p><span className="text-foreground font-medium">{t('hotels.highway')}:</span> {hotel.distanceToHighwayKm} km</p>}
            {hotel?.distanceToFairKm !== undefined && <p><span className="text-foreground font-medium">{t('hotels.fair')}:</span> {hotel.distanceToFairKm} km</p>}
            {hotel?.distanceToTrainStation !== undefined && <p><span className="text-foreground font-medium">{t('hotels.trainStation')}:</span> {hotel.distanceToTrainStation} km</p>}
            {hotel?.distanceToPublicTransport !== undefined && <p><span className="text-foreground font-medium">{t('hotels.publicTransport')}:</span> {hotel.distanceToPublicTransport} km</p>}
            {hotel?.airportNote && <p><span className="text-foreground font-medium">{t('events.overview', 'Nearby Attractions')}:</span> {hotel.airportNote}</p>}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {(hotel?.plannedChanges || hotel?.attractionInTheArea) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <Info className="h-3.5 w-3.5" /> {t('hotel.additionalInfo', 'Additional Information')}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.plannedChanges && <p><span className="text-foreground font-medium">{t('hotel.plannedChanges')}:</span> {hotel.plannedChanges}</p>}
            {hotel?.attractionInTheArea && <p><span className="text-foreground font-medium">{t('hotel.attractions')}:</span> {hotel.attractionInTheArea}</p>}
          </div>
        </div>
      )}

      {/* Additional Links */}
      {(hotel?.additionalLinks && hotel.additionalLinks.length > 0) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <LinkIcon className="h-3.5 w-3.5" /> {t('hotel.additionalLinks')}
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel.additionalLinks.map((l: any, idx: number) => (
              <p key={`${l.name}-${idx}`}>
                {l.name ? <span className="text-foreground font-medium">{l.name}: </span> : null}
                {l.link}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelInfoPreview;
