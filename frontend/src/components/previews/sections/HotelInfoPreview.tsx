
import { Building, CreditCard, MapPin } from "lucide-react";

interface HotelInfoPreviewProps {
  hotel: any;
}

const HotelInfoPreview = ({ hotel }: HotelInfoPreviewProps) => {
  if (!hotel || Object.keys(hotel).length === 0) return null;

  return (
    <div className="space-y-4 text-sm">
      {/* Basic Information Section */}
      {(hotel?.name || hotel?.street || hotel?.postalCode || hotel?.city || hotel?.country ||
        hotel?.phone || hotel?.fax || hotel?.email || hotel?.website) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <Building className="h-3.5 w-3.5" /> Basic Information
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.name && <p><span className="text-foreground font-medium">Name:</span> {hotel.name}</p>}
            {hotel?.street && <p><span className="text-foreground font-medium">Address:</span> {hotel.street}</p>}
            {(hotel?.postalCode || hotel?.city) && (
              <p>
                {hotel?.postalCode && <span>{hotel.postalCode} </span>}
                {hotel?.city && <span>{hotel.city}</span>}
                {hotel?.country && <span>, {hotel.country}</span>}
              </p>
            )}
            {hotel?.phone && <p><span className="text-foreground font-medium">Phone:</span> {hotel.phone}</p>}
            {hotel?.fax && <p><span className="text-foreground font-medium">Fax:</span> {hotel.fax}</p>}
            {hotel?.email && <p><span className="text-foreground font-medium">Email:</span> {hotel.email}</p>}
            {hotel?.website && <p><span className="text-foreground font-medium">Website:</span> {hotel.website}</p>}
            {hotel?.description && (
              <p className="mt-1.5 border-t pt-1.5">
                <span className="text-foreground font-medium">Description:</span><br />
                <span className="italic text-xs">"{hotel.description}"</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Billing Information Section */}
      {(hotel?.billingAddressName || hotel?.billingAddressStreet || hotel?.billingAddressZip || 
        hotel?.billingAddressCity || hotel?.billingAddressVat) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <CreditCard className="h-3.5 w-3.5" /> Billing Information
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.billingAddressName && <p><span className="text-foreground font-medium">Name:</span> {hotel.billingAddressName}</p>}
            {hotel?.billingAddressStreet && <p><span className="text-foreground font-medium">Street:</span> {hotel.billingAddressStreet}</p>}
            {(hotel?.billingAddressZip || hotel?.billingAddressCity) && (
              <p>
                {hotel?.billingAddressZip && <span>{hotel.billingAddressZip} </span>}
                {hotel?.billingAddressCity && <span>{hotel.billingAddressCity}</span>}
              </p>
            )}
            {hotel?.billingAddressVat && <p><span className="text-foreground font-medium">VAT:</span> {hotel.billingAddressVat}</p>}
          </div>
        </div>
      )}

      {/* Hotel Details Section */}
      {(hotel?.starRating || hotel?.category || hotel?.openingDate || hotel?.latestRenovationDate) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <Building className="h-3.5 w-3.5" /> Hotel Details
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.starRating && <p><span className="text-foreground font-medium">Rating:</span> {hotel.starRating} Stars</p>}
            {hotel?.category && (
              <p><span className="text-foreground font-medium">Category:</span> {
                {
                  "kongress": "Kongresshotel",
                  "wellness": "Wellnesshotel",
                  "luxury": "Luxushotel",
                  "budget": "Budget-Hotel",
                  "boutique": "Boutique-Hotel",
                  "resort": "Resort",
                  "business": "Business-Hotel",
                  "family": "Familienhotel"
                }[hotel.category] || hotel.category
              }</p>
            )}
            {hotel?.openingDate && <p><span className="text-foreground font-medium">Opened:</span> {hotel.openingDate}</p>}
            {hotel?.latestRenovationDate && <p><span className="text-foreground font-medium">Last renovated:</span> {hotel.latestRenovationDate}</p>}
          </div>
        </div>
      )}

      {/* Location & Distances Section */}
      {(hotel?.distanceToAirportKm || hotel?.distanceToHighwayKm || hotel?.distanceToFairKm || 
        hotel?.distanceToTrainStation || hotel?.distanceToPublicTransport || hotel?.attractionInTheArea) && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <MapPin className="h-3.5 w-3.5" /> Location & Distances
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {hotel?.distanceToAirportKm && <p><span className="text-foreground font-medium">Airport:</span> {hotel.distanceToAirportKm} km</p>}
            {hotel?.distanceToHighwayKm && <p><span className="text-foreground font-medium">Highway:</span> {hotel.distanceToHighwayKm} km</p>}
            {hotel?.distanceToFairKm && <p><span className="text-foreground font-medium">Fair/Exhibition:</span> {hotel.distanceToFairKm} km</p>}
            {hotel?.distanceToTrainStation && <p><span className="text-foreground font-medium">Train Station:</span> {hotel.distanceToTrainStation} km</p>}
            {hotel?.distanceToPublicTransport && <p><span className="text-foreground font-medium">Public Transport:</span> {hotel.distanceToPublicTransport} km</p>}
            {hotel?.attractionInTheArea && (
              <p className="mt-1.5">
                <span className="text-foreground font-medium">Nearby Attractions:</span><br />
                <span className="text-xs">{hotel.attractionInTheArea}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Additional Information Section */}
      {hotel?.plannedChanges && (
        <div>
          <h3 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 pb-1 border-b">
            <Building className="h-3.5 w-3.5" /> Additional Information
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="text-foreground font-medium">Planned Changes:</span><br /><span className="text-xs">{hotel.plannedChanges}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelInfoPreview;
