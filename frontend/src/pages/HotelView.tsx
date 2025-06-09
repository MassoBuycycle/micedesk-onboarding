import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFullHotelDetails, FullHotelResponse } from "@/apiClient/hotelsApi";
import { getInformationPoliciesByHotel, InformationPolicy } from "@/apiClient/informationPoliciesApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Download, MapPin, Phone, Mail, Globe, Car, Train, Plane, UserPlus, 
  Pencil, Trash, Speaker, Building2, Calendar, Users, BedDouble, 
  Utensils, FileText, Image, Clock, Shield, CreditCard,
  Contact, Info, Hotel, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteHotel } from "@/apiClient/hotelsApi";
import { toast } from "sonner";
import HotelAnnouncementBanner from '@/components/HotelAnnouncementBanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { upsertHotelAnnouncement } from '@/apiClient/announcementsApi';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from 'react-i18next';

const HotelView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hotelId = parseInt(id || "0", 10);
  const { t } = useTranslation();

  const { data: hotelData } = useQuery<FullHotelResponse>({
    queryKey: ["hotelFull", hotelId],
    queryFn: () => getFullHotelDetails(hotelId),
    enabled: !!hotelId
  });

  const { data: policies } = useQuery<InformationPolicy[]>({
    queryKey: ["hotelPolicies", hotelId],
    queryFn: () => getInformationPoliciesByHotel(hotelData?.hotel?.hotel_id || ''),
    enabled: !!hotelData?.hotel?.hotel_id
  });

  const hotel = hotelData?.hotel;
  const fbDetails = hotelData?.fnb;
  const files = hotelData?.files ?? [];
  const imageFiles = files.filter(f => f.mime_type.startsWith("image"));
  const documentFiles = files.filter(f => !f.mime_type.startsWith("image"));
  const mainImage = files.find(f => f.file_type_code === "main_image");

  const queryClient = useQueryClient();
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  const upsertMutation = useMutation({
    mutationFn: (msg:string) => upsertHotelAnnouncement(hotelId, msg, true),
    onSuccess: () => {
      toast.success(t('common.saved'));
      setAnnounceOpen(false);
      setAnnounceText('');
      queryClient.invalidateQueries({ queryKey: ['announcement', hotelId]});
      queryClient.invalidateQueries({ queryKey: ['announcements', 'active']});
    },
    onError: (err:any)=> toast.error(err.message || t('common.saveFailed'))
  });

  // Handlers
  const handleEdit = () => navigate(`/edit/hotel/${id}`);
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm(t('hotels.confirmDelete'))) return;
    try {
      await deleteHotel(parseInt(id));
      toast.success(t('hotels.deleted'));
      navigate('/');
    } catch (e:any){ 
      toast.error(e.message || t('hotels.deleteFailed')); 
    }
  };
  const handleAssign = () => navigate(`/users?assignHotel=${id}`);

  const getPolicyTypeLabel = (type: string) => {
    switch(type) {
      case 'room_information':
        return t("policies.policyTypes.roomInformation");
      case 'service_information':
        return t("policies.policyTypes.serviceInformation");
      case 'general_policies':
        return t("policies.policyTypes.generalPolicies");
      default:
        return type;
    }
  };

  if (!hotel) {
    return <div className="p-4">{t('common.loading')}...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Special announcement */}
        <HotelAnnouncementBanner hotelId={hotelId} />
        
        {/* Header with actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {mainImage ? (
              <img src={mainImage.url} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-muted">
                <Hotel className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{hotel.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {hotel.star_rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {hotel.star_rating} {t('hotels.stars')}
                  </Badge>
                )}
                {hotel.category && (
                  <Badge variant="outline">{hotel.category}</Badge>
                )}
                {hotel.hotel_id && (
                  <Badge variant="outline" className="font-mono">ID: {hotel.hotel_id}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAssign} className="gap-1">
              <UserPlus className="h-4 w-4"/>{t('users.assignUser')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleEdit} className="gap-1">
              <Pencil className="h-4 w-4"/>{t('common.edit')}
            </Button>
            <Button size="sm" variant="outline" onClick={()=>setAnnounceOpen(true)} className="gap-1">
              <Speaker className="h-4 w-4"/>{t('announcements.title')}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-1">
              <Trash className="h-4 w-4"/>{t('common.delete')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">{t('hotels.overview')}</TabsTrigger>
            <TabsTrigger value="details">{t('hotels.details')}</TabsTrigger>
            <TabsTrigger value="rooms">{t('rooms.title')}</TabsTrigger>
            <TabsTrigger value="events">{t('events.title')}</TabsTrigger>
            <TabsTrigger value="facilities">{t('hotels.facilities')}</TabsTrigger>
            <TabsTrigger value="policies">{t('policies.title')}</TabsTrigger>
            <TabsTrigger value="media">{t('hotels.media')}</TabsTrigger>
            <TabsTrigger value="documents">{t('documents.title')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Contact className="h-5 w-5" />
                    {t('hotels.contactInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/>
                    <div>
                      <p>{hotel.street}</p>
                      <p>{hotel.postal_code} {hotel.city}</p>
                    </div>
                  </div>
                  {hotel.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground"/>
                      <span>{hotel.phone}</span>
                    </div>
                  )}
                  {hotel.fax && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground"/>
                      <span>{hotel.fax} (Fax)</span>
                    </div>
                  )}
                  {hotel.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground"/>
                      <a href={`mailto:${hotel.email}`} className="text-primary hover:underline">
                        {hotel.email}
                      </a>
                    </div>
                  )}
                  {hotel.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground"/>
                      <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {hotel.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main Contact Person */}
              {hotelData?.contacts && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t('hotels.mainContact')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hotelData.contacts.main_contact_name && (
                      <div>
                        <p className="font-medium">{hotelData.contacts.main_contact_name}</p>
                        {hotelData.contacts.main_contact_position && (
                          <p className="text-sm text-muted-foreground">{hotelData.contacts.main_contact_position}</p>
                        )}
                      </div>
                    )}
                    {hotelData.contacts.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm">{hotelData.contacts.phone}</span>
                      </div>
                    )}
                    {hotelData.contacts.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground"/>
                        <a href={`mailto:${hotelData.contacts.email}`} className="text-sm text-primary hover:underline">
                          {hotelData.contacts.email}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t('hotels.quickStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {hotel.total_rooms && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('hotels.totalRooms')}</p>
                        <p className="text-2xl font-semibold">{hotel.total_rooms}</p>
                      </div>
                    )}
                    {hotel.conference_rooms && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('hotels.conferenceRooms')}</p>
                        <p className="text-2xl font-semibold">{hotel.conference_rooms}</p>
                      </div>
                    )}
                    {hotel.opening_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('hotels.openingYear')}</p>
                        <p className="text-2xl font-semibold">{hotel.opening_date}</p>
                      </div>
                    )}
                    {hotel.latest_renovation_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('hotels.renovationYear')}</p>
                        <p className="text-2xl font-semibold">{hotel.latest_renovation_date}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              {hotelData?.billing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {t('hotels.billingAddress')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {hotelData.billing.billing_address_name && (
                      <p className="font-medium">{hotelData.billing.billing_address_name}</p>
                    )}
                    <p>{hotelData.billing.billing_address_street}</p>
                    <p>{hotelData.billing.billing_address_zip} {hotelData.billing.billing_address_city}</p>
                    {hotelData.billing.billing_address_vat && (
                      <p className="text-sm text-muted-foreground">
                        {t('hotels.vat')}: {hotelData.billing.billing_address_vat}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Parking Information */}
              {hotelData?.parking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      {t('hotels.parking')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {hotelData.parking.no_of_parking_spaces && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.totalSpaces')}</p>
                          <p className="font-medium">{hotelData.parking.no_of_parking_spaces}</p>
                        </div>
                      )}
                      {hotelData.parking.no_of_parking_spaces_garage && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.garageSpaces')}</p>
                          <p className="font-medium">{hotelData.parking.no_of_parking_spaces_garage}</p>
                        </div>
                      )}
                      {hotelData.parking.no_of_parking_spaces_electric && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.electricSpaces')}</p>
                          <p className="font-medium">{hotelData.parking.no_of_parking_spaces_electric}</p>
                        </div>
                      )}
                      {hotelData.parking.no_of_parking_spaces_disabled && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.disabledSpaces')}</p>
                          <p className="font-medium">{hotelData.parking.no_of_parking_spaces_disabled}</p>
                        </div>
                      )}
                      {hotelData.parking.no_of_parking_spaces_bus && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.busSpaces')}</p>
                          <p className="font-medium">{hotelData.parking.no_of_parking_spaces_bus}</p>
                        </div>
                      )}
                      {hotelData.parking.no_of_parking_spaces_outside && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.outsideSpaces')}</p>
                          <p className="font-medium">{hotelData.parking.no_of_parking_spaces_outside}</p>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {hotelData.parking.parking_cost_per_hour && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.costPerHour')}</p>
                          <p className="font-medium">€{hotelData.parking.parking_cost_per_hour}</p>
                        </div>
                      )}
                      {hotelData.parking.parking_cost_per_day && (
                        <div>
                          <p className="text-sm text-muted-foreground">{t('hotels.costPerDay')}</p>
                          <p className="font-medium">€{hotelData.parking.parking_cost_per_day}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Distances */}
              {hotelData?.distances && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t('hotels.distances')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hotelData.distances.distance_to_airport_km && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-muted-foreground"/>
                          <span className="text-sm">{t('hotels.airport')}</span>
                        </div>
                        <span className="font-medium">{hotelData.distances.distance_to_airport_km} km</span>
                      </div>
                    )}
                    {hotelData.distances.distance_to_highway_km && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground"/>
                          <span className="text-sm">{t('hotels.highway')}</span>
                        </div>
                        <span className="font-medium">{hotelData.distances.distance_to_highway_km} km</span>
                      </div>
                    )}
                    {hotelData.distances.distance_to_train_station && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Train className="h-4 w-4 text-muted-foreground"/>
                          <span className="text-sm">{t('hotels.trainStation')}</span>
                        </div>
                        <span className="font-medium">{hotelData.distances.distance_to_train_station} km</span>
                      </div>
                    )}
                    {hotelData.distances.distance_to_public_transport && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Train className="h-4 w-4 text-muted-foreground"/>
                          <span className="text-sm">{t('hotels.publicTransport')}</span>
                        </div>
                        <span className="font-medium">{hotelData.distances.distance_to_public_transport} km</span>
                      </div>
                    )}
                    {hotelData.distances.distance_to_fair_km && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground"/>
                          <span className="text-sm">{t('hotels.fair')}</span>
                        </div>
                        <span className="font-medium">{hotelData.distances.distance_to_fair_km} km</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* PMS System & Other Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('hotels.systemInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hotel.pms_system && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('hotels.pmsSystem')}</p>
                      <p className="font-medium">{hotel.pms_system}</p>
                    </div>
                  )}
                  {hotel.created_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('common.createdAt')}</p>
                      <p className="font-medium">{new Date(hotel.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attractions & Changes */}
              {(hotel.attraction_in_the_area || hotel.planned_changes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      {t('hotels.additionalInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hotel.attraction_in_the_area && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('hotels.attractions')}</p>
                        <p className="text-sm">{hotel.attraction_in_the_area}</p>
                      </div>
                    )}
                    {hotel.planned_changes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('hotels.plannedChanges')}</p>
                        <p className="text-sm">{hotel.planned_changes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6 mt-6">
            {/* Room Categories */}
            {hotelData?.roomCategories && hotelData.roomCategories.length > 0 && (
              <>
                <h3 className="text-lg font-semibold">{t('rooms.categories')}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {hotelData.roomCategories.map((category: any, idx: number) => (
                    <Card key={category.id || idx}>
                      <CardHeader>
                        <CardTitle>{category.name || category.category_name || t('rooms.category')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                        {category.room_count && (
                          <p className="text-sm">
                            <span className="font-medium">{t('rooms.count')}:</span> {category.room_count}
                          </p>
                        )}
                        {category.size_sqm && (
                          <p className="text-sm">
                            <span className="font-medium">{t('rooms.size')}:</span> {category.size_sqm} m²
                          </p>
                        )}
                        {category.bed_configuration && (
                          <p className="text-sm">
                            <span className="font-medium">{t('rooms.bedConfiguration')}:</span> {category.bed_configuration}
                          </p>
                        )}
                        {category.max_occupancy && (
                          <p className="text-sm">
                            <span className="font-medium">{t('rooms.maxOccupancy')}:</span> {category.max_occupancy}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Separator />
              </>
            )}

            {/* Room Operational Info */}
            {hotelData?.roomOperational && hotelData.roomOperational.length > 0 && (
              <>
                <h3 className="text-lg font-semibold">{t('rooms.operationalInfo')}</h3>
                <div className="grid gap-4">
                  {hotelData.roomOperational.map((op: any, idx: number) => (
                    <Card key={op.id || idx}>
                      <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          {op.check_in_time && (
                            <div>
                              <p className="text-sm text-muted-foreground">{t('rooms.checkInTime')}</p>
                              <p className="font-medium">{op.check_in_time}</p>
                            </div>
                          )}
                          {op.check_out_time && (
                            <div>
                              <p className="text-sm text-muted-foreground">{t('rooms.checkOutTime')}</p>
                              <p className="font-medium">{op.check_out_time}</p>
                            </div>
                          )}
                          {op.reception_hours && (
                            <div>
                              <p className="text-sm text-muted-foreground">{t('rooms.receptionHours')}</p>
                              <p className="font-medium">{op.reception_hours}</p>
                            </div>
                          )}
                          {op.housekeeping_schedule && (
                            <div>
                              <p className="text-sm text-muted-foreground">{t('rooms.housekeepingSchedule')}</p>
                              <p className="font-medium">{op.housekeeping_schedule}</p>
                            </div>
                          )}
                          {op.luggage_storage && (
                            <div>
                              <p className="text-sm text-muted-foreground">{t('rooms.luggageStorage')}</p>
                              <p className="font-medium">{op.luggage_storage ? t('common.yes') : t('common.no')}</p>
                            </div>
                          )}
                          {op.late_check_out && (
                            <div>
                              <p className="text-sm text-muted-foreground">{t('rooms.lateCheckOut')}</p>
                              <p className="font-medium">{op.late_check_out}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Separator />
              </>
            )}

            {/* Regular Rooms */}
            {hotelData?.rooms && hotelData.rooms.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold">{t('rooms.rooms')}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {hotelData.rooms.map(room => (
                    <Card key={room.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5" />
                          {room.name || t('rooms.room')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {room.main_contact_name && (
                          <div>
                            <p className="text-sm text-muted-foreground">{t('rooms.mainContact')}</p>
                            <p className="font-medium">{room.main_contact_name}</p>
                          </div>
                        )}
                        {room.reception_hours && (
                          <div>
                            <p className="text-sm text-muted-foreground">{t('rooms.receptionHours')}</p>
                            <p className="font-medium">{room.reception_hours}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('rooms.noRoomsFound')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Events Tab - Comprehensive events information */}
          <TabsContent value="events" className="space-y-6 mt-6">
            {/* Event Spaces */}
            {hotelData?.eventSpaces && hotelData.eventSpaces.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hotelData.eventSpaces.map(space => (
                  <Card key={space.id}>
                    <CardHeader>
                      <CardTitle>{space.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {space.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{t('events.capacity')}: {space.capacity}</span>
                        </div>
                      )}
                      {space.size_sqm && (
                        <p className="text-sm">
                          <span className="font-medium">{t('events.size')}:</span> {space.size_sqm} m²
                        </p>
                      )}
                      {space.configuration && (
                        <p className="text-sm">
                          <span className="font-medium">{t('events.configuration')}:</span> {space.configuration}
                        </p>
                      )}
                      {space.features && (
                        <p className="text-sm">
                          <span className="font-medium">{t('events.features')}:</span> {space.features}
                        </p>
                      )}
                      {space.description && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">{space.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('events.noEventsFound')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6 mt-6">
            {/* Food & Beverage */}
            {fbDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    {t('hotels.foodBeverage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(fbDetails).map(([key, value]) => {
                      if (value === null || value === undefined || value === '') return null;
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-sm text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="font-medium">
                            {typeof value === 'boolean' ? (value ? t('common.yes') : t('common.no')) : String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wellness Facilities */}
            {(hotel.opening_time_pool || hotel.opening_time_fitness_center || hotel.opening_time_spa_area) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('hotels.wellness')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hotel.opening_time_pool && (
                    <div className="grid gap-2">
                      <p className="font-medium">{t('hotels.pool')}</p>
                      <p className="text-sm text-muted-foreground">{hotel.opening_time_pool}</p>
                    </div>
                  )}
                  {hotel.opening_time_fitness_center && (
                    <div className="grid gap-2">
                      <p className="font-medium">{t('hotels.fitnessCenter')}</p>
                      <p className="text-sm text-muted-foreground">{hotel.opening_time_fitness_center}</p>
                      {hotel.equipment_fitness_center && (
                        <p className="text-sm">{hotel.equipment_fitness_center}</p>
                      )}
                    </div>
                  )}
                  {hotel.opening_time_spa_area && (
                    <div className="grid gap-2">
                      <p className="font-medium">{t('hotels.spaArea')}</p>
                      <p className="text-sm text-muted-foreground">{hotel.opening_time_spa_area}</p>
                      {hotel.equipment_spa_area && (
                        <p className="text-sm">{hotel.equipment_spa_area}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6 mt-6">
            {policies && policies.length > 0 ? (
              <div className="space-y-6">
                {policies.map(policy => (
                  <Card key={policy.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {getPolicyTypeLabel(policy.type)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {policy.items && policy.items.length > 0 ? (
                        <div className="space-y-4">
                          {policy.items.map((item, idx) => (
                            <div key={item.id || idx} className="border-l-2 border-muted pl-4">
                              <h4 className="font-medium flex items-center gap-2">
                                {item.title}
                                {item.is_condition && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('policies.condition')}
                                  </Badge>
                                )}
                              </h4>
                              {item.details && item.details.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {item.details.map((detail, detailIdx) => (
                                    <li key={detail.id || detailIdx} className="text-sm text-muted-foreground">
                                      • {detail.name}
                                      {detail.description && (
                                        <span className="text-xs ml-1">({detail.description})</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">{t('policies.noItems')}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('policies.noPoliciesFound')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6 mt-6">
            {imageFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageFiles.map(img => (
                  <Card key={img.id} className="overflow-hidden">
                    <AspectRatio ratio={16/9} className="bg-muted">
                      <img 
                        src={img.url} 
                        alt={img.original_name} 
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" 
                      />
                    </AspectRatio>
                    <CardContent className="p-3">
                      <p className="text-sm truncate" title={img.original_name}>
                        {img.original_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {img.file_type_code}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('files.noImagesFound')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-6">
            {documentFiles.length > 0 ? (
              <div className="grid gap-3">
                {documentFiles.map(file => (
                  <Card key={file.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.original_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.file_type_code} • {file.mime_type}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4 mr-1" />
                          {t('common.download')}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('files.noDocumentsFound')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Announcement Dialog */}
        <Dialog open={announceOpen} onOpenChange={setAnnounceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('announcements.setSpecialAnnouncement')}</DialogTitle>
              <DialogDescription>
                {t('announcements.description')}
              </DialogDescription>
            </DialogHeader>
            <Input 
              placeholder={t('announcements.messagePlaceholder')} 
              value={announceText} 
              onChange={(e)=>setAnnounceText(e.target.value)} 
            />
            <DialogFooter>
              <Button 
                onClick={()=>upsertMutation.mutate(announceText)} 
                disabled={upsertMutation.isPending || !announceText.trim()}
              >
                {t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HotelView; 