
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
          <p><span className="text-foreground font-medium">{t('hotel.hotelId')}:</span> {displayValue(hotel?.systemHotelId)}</p>
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

      {/* General Manager Section */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Building className="h-3.5 w-3.5" /> {t('hotel.generalManagerSection', 'General Manager')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.generalManagerName')}:</span> {displayValue(hotel?.generalManagerName)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.generalManagerPhone')}:</span> {displayValue(hotel?.generalManagerPhone)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.generalManagerEmail')}:</span> {displayValue(hotel?.generalManagerEmail)}</p>
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
          <p><span className="text-foreground font-medium">{t('hotel.billingEmail')}:</span> {displayValue(hotel?.billingEmail)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.allinvosCisboxNr')}:</span> {displayValue(hotel?.externalBillingId)}</p>
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

      {/* Rooms & Systems Section */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Building className="h-3.5 w-3.5" /> {t('hotel.roomsAndSystems', 'Rooms & Systems')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.totalRooms')}:</span> {displayValue(hotel?.totalRooms)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.conferenceRooms')}:</span> {displayValue(hotel?.conferenceRooms)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.pmsSystem')}:</span> {displayValue(hotel?.pmsSystem)}</p>
        </div>
      </div>

      {/* Parking Section */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <MapPin className="h-3.5 w-3.5" /> {t('hotel.parking', 'Parking')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.totalSpaces')}:</span> {displayValue(hotel?.noOfParkingSpaces)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.garageSpaces')}:</span> {displayValue(hotel?.noOfParkingSpacesGarage)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.electricSpaces')}:</span> {displayValue(hotel?.noOfParkingSpacesElectric)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.busSpaces')}:</span> {displayValue(hotel?.noOfParkingSpacesBus)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.outsideSpaces')}:</span> {displayValue(hotel?.noOfParkingSpacesOutside)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.disabledSpaces')}:</span> {displayValue(hotel?.noOfParkingSpacesDisabled)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.costPerHour')}:</span> {displayValue(hotel?.parkingCostPerHour)} {hotel?.parkingCostPerHour ? '€' : ''}</p>
          <p><span className="text-foreground font-medium">{t('hotel.costPerDay')}:</span> {displayValue(hotel?.parkingCostPerDay)} {hotel?.parkingCostPerDay ? '€' : ''}</p>
          {hotel?.parkingRemarks && (
            <p className="mt-1.5 border-t pt-1.5">
              <span className="text-foreground font-medium">{t('hotel.parkingRemarks')}:</span><br />
              <span className="italic text-xs">{displayValue(hotel?.parkingRemarks)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Facilities Section */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <Building className="h-3.5 w-3.5" /> {t('hotel.facilities', 'Facilities')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-foreground font-medium">{t('hotel.poolHours')}:</span> {displayValue(hotel?.openingTimePool)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.fitnessHours')}:</span> {displayValue(hotel?.openingTimeFitnessCenter)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.fitnessEquipment')}:</span> {displayValue(hotel?.equipmentFitnessCenter)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.spaHours')}:</span> {displayValue(hotel?.openingTimeSpaArea)}</p>
          <p><span className="text-foreground font-medium">{t('hotel.spaEquipment')}:</span> {displayValue(hotel?.equipmentSpaArea)}</p>
        </div>
      </div>

      {/* Location & Distances (always show with fallback) */}
      <div>
        <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
          <MapPin className="h-3.5 w-3.5" /> {t('hotels.distances', 'Location & Distances')}
        </h3>
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>
            <p><span className="text-foreground font-medium">{t('hotels.airport')}:</span> {displayValue(hotel?.distanceToAirportKm)}</p>
            {hotel?.airportNote && <p className="pl-4 text-xs italic text-muted-foreground/80">→ {hotel.airportNote}</p>}
          </div>
          <div>
            <p><span className="text-foreground font-medium">{t('hotels.highway')}:</span> {displayValue(hotel?.distanceToHighwayKm)}</p>
            {hotel?.highwayNote && <p className="pl-4 text-xs italic text-muted-foreground/80">→ {hotel.highwayNote}</p>}
          </div>
          <div>
            <p><span className="text-foreground font-medium">{t('hotels.fair')}:</span> {displayValue(hotel?.distanceToFairKm)}</p>
            {hotel?.fairNote && <p className="pl-4 text-xs italic text-muted-foreground/80">→ {hotel.fairNote}</p>}
          </div>
          <div>
            <p><span className="text-foreground font-medium">{t('hotels.trainStation')}:</span> {displayValue(hotel?.distanceToTrainStation)}</p>
            {hotel?.trainStationNote && <p className="pl-4 text-xs italic text-muted-foreground/80">→ {hotel.trainStationNote}</p>}
          </div>
          <div>
            <p><span className="text-foreground font-medium">{t('hotels.publicTransport')}:</span> {displayValue(hotel?.distanceToPublicTransport)}</p>
            {hotel?.publicTransportNote && <p className="pl-4 text-xs italic text-muted-foreground/80">→ {hotel.publicTransportNote}</p>}
          </div>
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
