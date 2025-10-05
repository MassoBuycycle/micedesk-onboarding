import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFullHotelDetails, FullHotelResponse } from "@/apiClient/hotelsApi";
import { getInformationPoliciesByHotel, InformationPolicy } from "@/apiClient/informationPoliciesApi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getEntityFiles, FileData, deleteFile as deleteFileApi } from "@/apiClient/filesApi";
import { 
  Download, MapPin, Phone, Mail, Globe, Car, Train, Plane, UserPlus, 
  Pencil, Trash, Speaker, Building2, Calendar, Users, User, BedDouble, 
  Utensils, FileText, Image, Clock, Shield, CreditCard, Eye,
  Contact, Info, Hotel, Star, ClipboardList, ChevronDown, ChevronUp,
  PartyPopper, Wifi, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteHotel } from "@/apiClient/hotelsApi";
import { toast } from "sonner";
import HotelAnnouncementBanner from '@/components/HotelAnnouncementBanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { upsertHotelAnnouncement, deleteHotelAnnouncement, getHotelAnnouncement } from '@/apiClient/announcementsApi';
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from 'react-i18next';
import { DialogClose } from '@/components/ui/dialog';
import RoomCategoryImages from '@/components/RoomCategoryImages';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const HotelView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hotelId = parseInt(id || "0", 10);
  const { t } = useTranslation();

  // Helper function to handle boolean display
  const formatBooleanValue = (value: any): string => {
    if (value === 1 || value === true || value === "1" || value === "true") {
      return t('common.yes');
    } else if (value === 0 || value === false || value === "0" || value === "false") {
      return t('common.no');
    }
    return String(value);
  };

  const { data: hotelData } = useQuery<FullHotelResponse>({
    queryKey: ["hotelFull", hotelId],
    queryFn: () => getFullHotelDetails(hotelId),
    enabled: !!hotelId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: fallbackFiles = [] } = useQuery<FileData[]>({
    queryKey: ["hotelFiles", hotelId],
    queryFn: () => getEntityFiles("hotels", hotelId),
    enabled: !!hotelId && (!hotelData?.files || hotelData.files.length === 0),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: policies } = useQuery<InformationPolicy[]>({
    queryKey: ["hotelPolicies", hotelId],
    queryFn: () => getInformationPoliciesByHotel(hotelData?.hotel?.system_hotel_id || ''),
    enabled: !!hotelData?.hotel?.system_hotel_id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const hotel = hotelData?.hotel;
  const hotelAny = hotel as any;
  const fbDetails = hotelData?.fnb;
  const eventsInfo: any = (hotelData as any)?.eventsInfo || {};
  const roomHandling: any = (hotelData as any)?.roomHandling || null;
  const contractDetails: any = (hotelData as any)?.contractDetails || {};
  const files = (hotelData?.files && hotelData.files.length > 0) ? hotelData.files : fallbackFiles;
  const imageFiles = files.filter(f => f.mime_type.startsWith("image") || f.mime_type.startsWith("video"));
  const documentFiles = files.filter(f => !f.mime_type.startsWith("image") && !f.mime_type.startsWith("video"));
  const mainImage = files.find(f => f.file_type_code === "main_image");

  const queryClient = useQueryClient();
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Collapsible section states - all open by default for better overview
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isRoomsOpen, setIsRoomsOpen] = useState(true);
  const [isEventsOpen, setIsEventsOpen] = useState(true);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(true);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(true);
  const [isContractOpen, setIsContractOpen] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(true);

  const { data: currentAnnouncement } = useQuery({
    queryKey: ['announcement', hotelId],
    queryFn: () => getHotelAnnouncement(hotelId),
    enabled: !!hotelId,
  });

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

  const deleteAnnouncementMutation = useMutation({
    mutationFn: () => deleteHotelAnnouncement(hotelId),
    onSuccess: () => {
      toast.success(t('announcements.deleted'));
      setAnnounceOpen(false);
      setAnnounceText('');
      queryClient.invalidateQueries({ queryKey: ['announcement', hotelId]});
      queryClient.invalidateQueries({ queryKey: ['announcements', 'active']});
    },
    onError: (err:any) => toast.error(err.message || t('announcements.deleteFailed'))
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => deleteFileApi(fileId),
    onSuccess: () => {
      toast.success(t('files.deleted'));
      queryClient.invalidateQueries({ queryKey: ["hotelFull", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["hotelFiles", hotelId] });
    },
    onError: (err: any) => toast.error(err.message || t('files.deleteFailed'))
  });

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

  const openPreview = (file: FileData) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const getEntitySourceLabel = (file: any): { label: string; type: string } => {
    if (file.entity_type === 'hotels') {
      return { label: t('common.hotel'), type: 'hotel' };
    } else if (file.entity_type === 'rooms') {
      const room = hotelData?.rooms?.find((r: any) => r.id === file.entity_id);
      const roomName = room ? room.room_category_name || room.name || `${t('common.room')} ${file.entity_id}` : `${t('common.room')} ${file.entity_id}`;
      return { label: roomName, type: 'room' };
    } else if (file.entity_type === 'events') {
      const event = (hotelData as any)?.events?.find((e: any) => e.id === file.entity_id);
      const eventName = event ? event.name || `${t('common.event')} ${file.entity_id}` : `${t('common.event')} ${file.entity_id}`;
      return { label: eventName, type: 'event' };
    }
    return { label: file.entity_type, type: 'unknown' };
  };

  if (!hotel) {
    return <div className="p-4">{t('common.loading')}...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        <HotelAnnouncementBanner hotelId={hotelId} />
        
        {/* Enhanced Header */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-6">
                {mainImage ? (
                  <img src={mainImage.url} alt={hotel.name} className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl object-cover shadow-md ring-2 ring-primary/10" />
                ) : (
                  <div className="w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/10">
                    <Hotel className="h-12 w-12 lg:h-16 lg:w-16 text-primary" />
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{hotel.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      {hotel.star_rating !== null && hotel.star_rating !== undefined && (
                        <Badge variant="secondary" className="gap-1 text-base px-3 py-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {hotel.star_rating === 0 ? t('starRatings.0') : `${hotel.star_rating} ${t('hotels.stars')}`}
                        </Badge>
                      )}
                      {hotel.category && (
                        <Badge variant="outline" className="text-base px-3 py-1">{hotel.category}</Badge>
                      )}
                      {hotelAny && hotelAny.hotel_id && (
                        <Badge variant="outline" className="font-mono text-sm px-3 py-1">ID: {hotelAny.hotel_id}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {hotel.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.city}</span>
                      </div>
                    )}
                    {hotel.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        <span>{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${hotel.email}`} className="text-primary hover:underline">
                          {hotel.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleAssign} className="gap-1.5">
                  <UserPlus className="h-4 w-4"/>{t('users.assignUser')}
                </Button>
                <Button size="sm" variant="outline" onClick={handleEdit} className="gap-1.5">
                  <Pencil className="h-4 w-4"/>{t('common.edit')}
                </Button>
                <Button size="sm" variant="outline" onClick={()=> {
                  setAnnounceText(currentAnnouncement?.message || '');
                  setAnnounceOpen(true);
                }} className="gap-1.5">
                  <Speaker className="h-4 w-4"/>{t('announcements.title')}
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-1.5">
                  <Trash className="h-4 w-4"/>{t('common.delete')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('hotels.totalRooms')}</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{hotel.total_rooms || 0}</p>
                </div>
                <BedDouble className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('hotels.conferenceRooms')}</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{hotel.conference_rooms || 0}</p>
                </div>
                <Calendar className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">{t('events.totalSpaces')}</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{eventsInfo.totalEventSpaces || 0}</p>
                </div>
                <PartyPopper className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">{t('restaurants.title')}</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {(fbDetails?.restaurants?.length || 0) + (fbDetails?.bars?.length || 0)}
                  </p>
                </div>
                <Utensils className="h-10 w-10 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Overview Section */}
        <Collapsible open={isContactOpen} onOpenChange={setIsContactOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Contact className="h-6 w-6 text-primary" />
                    {t('hotels.contactInfo')} & {t('hotels.overview')}
                  </CardTitle>
                  {isContactOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Full Address */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {t('hotels.address')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-medium">{hotel.street}</p>
                      <p>{hotel.postal_code} {hotel.city}</p>
                      {hotel.website && (
                        <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline text-sm mt-2">
                          <Globe className="h-4 w-4"/>
                          {t('hotels.website')}
                        </a>
                      )}
                    </CardContent>
                  </Card>

                  {/* Main Contact */}
                  {hotelData?.contacts && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          {t('hotels.mainContact')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {hotelData.contacts.main_contact_name && (
                          <div>
                            <p className="font-medium">{hotelData.contacts.main_contact_name}</p>
                            {hotelData.contacts.main_contact_position && (
                              <p className="text-sm text-muted-foreground">{hotelData.contacts.main_contact_position}</p>
                            )}
                          </div>
                        )}
                        {hotelData.contacts.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground"/>
                            <span>{hotelData.contacts.phone}</span>
                          </div>
                        )}
                        {hotelData.contacts.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground"/>
                            <a href={`mailto:${hotelData.contacts.email}`} className="text-primary hover:underline">
                              {hotelData.contacts.email}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* General Manager */}
                  {(hotelAny?.general_manager_name || hotelAny?.general_manager_email || hotelAny?.general_manager_phone) && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          {t('hotel.generalManagerSection')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {hotelAny?.general_manager_name && (
                          <p className="font-medium">{hotelAny.general_manager_name}</p>
                        )}
                        {hotelAny?.general_manager_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{hotelAny.general_manager_phone}</span>
                          </div>
                        )}
                        {hotelAny?.general_manager_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${hotelAny.general_manager_email}`} className="text-primary hover:underline">
                              {hotelAny.general_manager_email}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        {t('hotels.quickStats')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {hotel.opening_date && (
                          <div>
                            <p className="text-xs text-muted-foreground">{t('hotels.openingYear')}</p>
                            <p className="text-lg font-semibold">{hotel.opening_date}</p>
                          </div>
                        )}
                        {hotel.latest_renovation_date && (
                          <div>
                            <p className="text-xs text-muted-foreground">{t('hotels.renovationYear')}</p>
                            <p className="text-lg font-semibold">{hotel.latest_renovation_date}</p>
                          </div>
                        )}
                        {hotel.pms_system && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">{t('hotels.pmsSystem')}</p>
                            <p className="font-medium">{hotel.pms_system}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Billing Address */}
                  {hotelData?.billing && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          {t('hotels.billingAddress')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        {hotelData.billing.billing_address_name && (
                          <p className="font-medium">{hotelData.billing.billing_address_name}</p>
                        )}
                        <p>{hotelData.billing.billing_address_street}</p>
                        <p>{hotelData.billing.billing_address_zip} {hotelData.billing.billing_address_city}</p>
                        {hotelData.billing.billing_address_vat && (
                          <p className="text-muted-foreground pt-1">
                            {t('hotels.vat')}: {hotelData.billing.billing_address_vat}
                          </p>
                        )}
                        {hotelAny?.external_billing_id && (
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground">{t('hotel.allinvosCisboxNr')}</p>
                            <p className="font-medium">{hotelAny.external_billing_id}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Hotel Description */}
                  {hotelAny?.description && (
                    <Card className="bg-muted/30 md:col-span-2 lg:col-span-3">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          {t('hotel.description')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{hotelAny.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Details Section (Parking, Distances, etc) */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building2 className="h-6 w-6 text-primary" />
                    {t('hotels.details')} & {t('hotels.facilities')}
                  </CardTitle>
                  {isDetailsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Parking */}
                  {hotelData?.parking && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Car className="h-5 w-5 text-primary" />
                          {t('hotels.parking')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">{t('hotels.totalSpaces')}</p>
                            <p className="font-medium">{hotelData.parking.no_of_parking_spaces ?? t('common.notSet','N/A')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">{t('hotels.garageSpaces')}</p>
                            <p className="font-medium">{hotelData.parking.no_of_parking_spaces_garage ?? t('common.notSet','N/A')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">{t('hotels.electricSpaces')}</p>
                            <p className="font-medium">{hotelData.parking.no_of_parking_spaces_electric ?? t('common.notSet','N/A')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">{t('hotels.disabledSpaces')}</p>
                            <p className="font-medium">{hotelData.parking.no_of_parking_spaces_disabled ?? t('common.notSet','N/A')}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">{t('hotels.costPerHour')}</p>
                            <p className="font-medium">{hotelData.parking.parking_cost_per_hour != null ? `€${hotelData.parking.parking_cost_per_hour}` : t('common.notSet','N/A')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">{t('hotels.costPerDay')}</p>
                            <p className="font-medium">{hotelData.parking.parking_cost_per_day != null ? `€${hotelData.parking.parking_cost_per_day}` : t('common.notSet','N/A')}</p>
                          </div>
                        </div>
                        {hotelData.parking.parking_remarks && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">{t('hotel.parkingRemarks')}</p>
                              <p className="text-sm">{hotelData.parking.parking_remarks}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Distances */}
                  {hotelData?.distances && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {t('hotels.distances')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-muted-foreground"/>
                            <span>{t('hotels.airport')}</span>
                          </div>
                          <span className="font-medium">{hotelData.distances.distance_to_airport_km ?? 'N/A'} {hotelData.distances.distance_to_airport_km ? 'km' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground"/>
                            <span>{t('hotels.highway')}</span>
                          </div>
                          <span className="font-medium">{hotelData.distances.distance_to_highway_km ?? 'N/A'} {hotelData.distances.distance_to_highway_km ? 'km' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Train className="h-4 w-4 text-muted-foreground"/>
                            <span>{t('hotels.trainStation')}</span>
                          </div>
                          <span className="font-medium">{hotelData.distances.distance_to_train_station ?? 'N/A'} {hotelData.distances.distance_to_train_station ? 'km' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Train className="h-4 w-4 text-muted-foreground"/>
                            <span>{t('hotels.publicTransport')}</span>
                          </div>
                          <span className="font-medium">{hotelData.distances.distance_to_public_transport ?? 'N/A'} {hotelData.distances.distance_to_public_transport ? 'km' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground"/>
                            <span>{t('hotels.fair')}</span>
                          </div>
                          <span className="font-medium">{hotelData.distances.distance_to_fair_km ?? 'N/A'} {hotelData.distances.distance_to_fair_km ? 'km' : ''}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Wellness */}
                  {(hotel.opening_time_pool || hotel.opening_time_fitness_center || hotel.opening_time_spa_area) && (
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          {t('hotels.wellness')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {hotel.opening_time_pool && (
                          <div>
                            <p className="font-medium">{t('hotels.pool')}</p>
                            <p className="text-muted-foreground">{hotel.opening_time_pool}</p>
                          </div>
                        )}
                        {hotel.opening_time_fitness_center && (
                          <div>
                            <p className="font-medium">{t('hotels.fitnessCenter')}</p>
                            <p className="text-muted-foreground">{hotel.opening_time_fitness_center}</p>
                            {hotel.equipment_fitness_center && (
                              <p className="text-xs mt-1">{hotel.equipment_fitness_center}</p>
                            )}
                          </div>
                        )}
                        {hotel.opening_time_spa_area && (
                          <div>
                            <p className="font-medium">{t('hotels.spaArea')}</p>
                            <p className="text-muted-foreground">{hotel.opening_time_spa_area}</p>
                            {hotel.equipment_spa_area && (
                              <p className="text-xs mt-1">{hotel.equipment_spa_area}</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Additional Info */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        {t('hotels.additionalInfo')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{t('hotels.attractions')}</p>
                        <p>{hotel.attraction_in_the_area || t('common.notSet','N/A')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{t('hotels.plannedChanges')}</p>
                        <p>{hotel.planned_changes || t('common.notSet','N/A')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Rooms Section */}
        <Collapsible open={isRoomsOpen} onOpenChange={setIsRoomsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BedDouble className="h-6 w-6 text-primary" />
                    {t('rooms.title')}
                    {hotelData?.roomCategories && (
                      <Badge variant="secondary">{hotelData.roomCategories.length}</Badge>
                    )}
                  </CardTitle>
                  {isRoomsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {hotelData?.roomCategories && hotelData.roomCategories.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {hotelData.roomCategories.map((category: any, idx: number) => {
                      const handledKeys = new Set<string>(['description','room_count','size_sqm','bed_configuration','max_occupancy']);
                      return (
                        <Card key={category.id || idx} className="bg-muted/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{category.name || category.category_name || t('rooms.category')}</CardTitle>
                            {category.description && (
                              <CardDescription className="text-sm mt-2">{category.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            {category.room_count !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('rooms.count')}:</span>
                                <span className="font-medium">{category.room_count}</span>
                              </div>
                            )}
                            {category.size_sqm !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('rooms.size')}:</span>
                                <span className="font-medium">{category.size_sqm} m²</span>
                              </div>
                            )}
                            {category.bed_configuration && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('rooms.bedConfiguration')}:</span>
                                <span className="font-medium">{category.bed_configuration}</span>
                              </div>
                            )}
                            {category.max_occupancy !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('rooms.maxOccupancy')}:</span>
                                <span className="font-medium">{category.max_occupancy}</span>
                              </div>
                            )}
                            {Object.entries(category).filter(([k,v])=>!handledKeys.has(k) && !['id','hotel_id','name','category_name','created_at','updated_at'].includes(k) && v!==null && v!==undefined && v!=='').map(([key,value])=>{
                              const label = key.replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2');
                              return (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground capitalize">{label}:</span>
                                  <span className="font-medium">{formatBooleanValue(value)}</span>
                                </div>
                              );
                            })}
                            <RoomCategoryImages categoryId={category.id} />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {roomHandling && (
                  <>
                    <Separator />
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          {t('rooms.policies')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {roomHandling.checkInTime && <div><p className="text-muted-foreground text-xs">{t('rooms.checkInTime')}</p><p className="font-medium">{roomHandling.checkInTime}</p></div>}
                        {roomHandling.checkOutTime && <div><p className="text-muted-foreground text-xs">{t('rooms.checkOutTime')}</p><p className="font-medium">{roomHandling.checkOutTime}</p></div>}
                        {roomHandling.guaranteePolicy && <div className="md:col-span-2"><p className="text-muted-foreground text-xs mb-1">{t('rooms.guaranteePolicy')}</p><p className="whitespace-pre-wrap">{roomHandling.guaranteePolicy}</p></div>}
                        {roomHandling.cancellationPolicy && <div className="md:col-span-2"><p className="text-muted-foreground text-xs mb-1">{t('rooms.cancellationPolicy')}</p><p className="whitespace-pre-wrap">{roomHandling.cancellationPolicy}</p></div>}
                        {roomHandling.noShowPolicy && <div className="md:col-span-2"><p className="text-muted-foreground text-xs mb-1">{t('rooms.noShowPolicy')}</p><p className="whitespace-pre-wrap">{roomHandling.noShowPolicy}</p></div>}
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Events Section */}
        <Collapsible open={isEventsOpen} onOpenChange={setIsEventsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-6 w-6 text-primary" />
                    {t('events.title')}
                    {hotelData?.eventSpaces && (
                      <Badge variant="secondary">{hotelData.eventSpaces.length}</Badge>
                    )}
                  </CardTitle>
                  {isEventsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {Object.keys(eventsInfo).length > 0 && (
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t('events.overview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {eventsInfo.largestSpace && <div><p className="text-muted-foreground text-xs">{t('events.largestSpace')}</p><p className="font-medium">{eventsInfo.largestSpace} m²</p></div>}
                      {eventsInfo.maxCapacity && <div><p className="text-muted-foreground text-xs">{t('events.maxCapacity')}</p><p className="font-medium">{eventsInfo.maxCapacity}</p></div>}
                      {eventsInfo.eventCoordinator !== undefined && <div><p className="text-muted-foreground text-xs">{t('events.eventCoordinator')}</p><p className="font-medium">{formatBooleanValue(eventsInfo.eventCoordinator)}</p></div>}
                      {eventsInfo.hasAudioVisual !== undefined && <div><p className="text-muted-foreground text-xs">{t('events.audioVisual')}</p><p className="font-medium">{formatBooleanValue(eventsInfo.hasAudioVisual)}</p></div>}
                      {eventsInfo.cateringAvailable !== undefined && <div><p className="text-muted-foreground text-xs">{t('events.catering')}</p><p className="font-medium">{formatBooleanValue(eventsInfo.cateringAvailable)}</p></div>}
                    </CardContent>
                  </Card>
                )}

                {hotelData?.eventSpaces && hotelData.eventSpaces.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {hotelData.eventSpaces.map(space => (
                      <Card key={space.id} className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{space.name}</CardTitle>
                          {space.description && (
                            <CardDescription className="text-sm">{space.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {space.capacity && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{t('events.capacity')}</span>
                              </div>
                              <span className="font-medium">{space.capacity}</span>
                            </div>
                          )}
                          {space.size_sqm && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('events.size')}</span>
                              <span className="font-medium">{space.size_sqm} m²</span>
                            </div>
                          )}
                          {space.configuration && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('events.configuration')}</span>
                              <span className="font-medium">{space.configuration}</span>
                            </div>
                          )}
                          {space.features && (
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">{t('events.features')}</p>
                              <p>{space.features}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-muted/30">
                    <CardContent className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t('events.noEventsFound')}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* F&B Section */}
        {fbDetails && (
          <Collapsible open={isFacilitiesOpen} onOpenChange={setIsFacilitiesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Utensils className="h-6 w-6 text-primary" />
                      {t('hotels.foodBeverage')}
                      <Badge variant="secondary">
                        {(fbDetails.restaurants?.length || 0) + (fbDetails.bars?.length || 0)}
                      </Badge>
                    </CardTitle>
                    {isFacilitiesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  {/* F&B General Info */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t('hotels.generalInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
                        {Object.entries(fbDetails).filter(([k,v])=> typeof v !== 'object').map(([key, value])=>{
                          if(value===null||value===undefined||value==='') return null;
                          return (
                            <div key={key}>
                              <p className="text-muted-foreground text-xs capitalize">{key.replace(/_/g,' ').replace(/([A-Z])/g,' $1').trim()}</p>
                              <p className="font-medium">{formatBooleanValue(value)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Restaurants */}
                  {Array.isArray(fbDetails.restaurants) && fbDetails.restaurants.length>0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-4">{t('restaurants.title', {count: fbDetails.restaurants.length})}</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {fbDetails.restaurants.map((rest: any, idx:number)=>(
                            <Card key={idx} className="bg-muted/30">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{rest.name || `${t('restaurants.restaurant')} ${idx+1}`}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                {rest.cuisine && <div className="flex justify-between"><span className="text-muted-foreground">{t('restaurants.cuisine')}</span><span className="font-medium">{rest.cuisine}</span></div>}
                                {rest.seats_indoor !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">{t('restaurants.seatsIndoor')}</span><span className="font-medium">{rest.seats_indoor}</span></div>}
                                {rest.seats_outdoor !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">{t('restaurants.seatsOutdoor')}</span><span className="font-medium">{rest.seats_outdoor}</span></div>}
                                {rest.opening_hours && <div><p className="text-muted-foreground text-xs">{t('restaurants.openingHours')}</p><p className="font-medium">{rest.opening_hours}</p></div>}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Bars */}
                  {Array.isArray(fbDetails.bars) && fbDetails.bars.length>0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-4">{t('bars.title', {count: fbDetails.bars.length})}</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {fbDetails.bars.map((bar:any, idx:number)=>(
                            <Card key={idx} className="bg-muted/30">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{bar.name || `${t('bars.bar')} ${idx+1}`}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                {bar.seats_indoor!==undefined && <div className="flex justify-between"><span className="text-muted-foreground">{t('bars.seatsIndoor')}</span><span className="font-medium">{bar.seats_indoor}</span></div>}
                                {bar.seats_outdoor!==undefined && <div className="flex justify-between"><span className="text-muted-foreground">{t('bars.seatsOutdoor')}</span><span className="font-medium">{bar.seats_outdoor}</span></div>}
                                {bar.opening_hours && <div><p className="text-muted-foreground text-xs">{t('bars.openingHours')}</p><p className="font-medium">{bar.opening_hours}</p></div>}
                                {bar.snacks_available!==undefined && <div className="flex justify-between"><span className="text-muted-foreground">{t('bars.snacks')}</span><span className="font-medium">{formatBooleanValue(bar.snacks_available)}</span></div>}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Policies Section */}
        <Collapsible open={isPoliciesOpen} onOpenChange={setIsPoliciesOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-6 w-6 text-primary" />
                    {t('policies.title')}
                    {policies && <Badge variant="secondary">{policies.length}</Badge>}
                  </CardTitle>
                  {isPoliciesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {policies && policies.length > 0 ? (
                  policies.map(policy => (
                    <Card key={policy.id} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          {getPolicyTypeLabel(policy.type)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {policy.items && policy.items.length > 0 ? (
                          <div className="space-y-3">
                            {policy.items.map((item, idx) => (
                              <div key={item.id || idx} className="border-l-2 border-primary/30 pl-4 py-2">
                                <h4 className="font-medium flex items-center gap-2 mb-1">
                                  {item.title}
                                  {item.is_condition && (
                                    <Badge variant="secondary" className="text-xs">
                                      {t('policies.condition')}
                                    </Badge>
                                  )}
                                </h4>
                                {item.details && item.details.length > 0 && (
                                  <ul className="space-y-1 mt-2">
                                    {item.details.map((detail, detailIdx) => (
                                      <li key={detail.id || detailIdx} className="text-sm text-muted-foreground pl-2">
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
                  ))
                ) : (
                  <Card className="bg-muted/30">
                    <CardContent className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t('policies.noPoliciesFound')}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Contract Section */}
        <Collapsible open={isContractOpen} onOpenChange={setIsContractOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-6 w-6 text-primary" />
                    {t('contract.title')}
                  </CardTitle>
                  {isContractOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {Object.keys(contractDetails).length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {t('contract.contracting')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {contractDetails.contract_model && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('contract.contractModel')}</p>
                            <p className="font-medium">{contractDetails.contract_model}</p>
                          </div>
                        )}
                        {contractDetails.fte_count != null && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('contract.fteCount')}</p>
                            <p className="font-medium">{contractDetails.fte_count}</p>
                          </div>
                        )}
                        {contractDetails.onboarding_date && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('contract.onboardingDate')}</p>
                            <p className="font-medium">{new Date(contractDetails.onboarding_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {contractDetails.contract_start_date && (
                          <div>
                            <p className="text-muted-foreground text-xs">{t('contract.contractStartDate')}</p>
                            <p className="font-medium">{new Date(contractDetails.contract_start_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {contractDetails.special_agreements && (
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">{t('contract.specialAgreements')}</p>
                            <p className="whitespace-pre-wrap">{contractDetails.special_agreements}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          {t('contract.technicalSetup')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>{t('contract.emailAddressesCreated')}</span>
                          <Badge variant={contractDetails.email_addresses_created ? "default" : "secondary"}>
                            {formatBooleanValue(contractDetails.email_addresses_created)}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{t('contract.systemAccess')}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('contract.pmsSystem')}</span>
                            <Badge variant={contractDetails.access_pms_system ? "default" : "secondary"}>
                              {formatBooleanValue(contractDetails.access_pms_system)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('contract.scTool')}</span>
                            <Badge variant={contractDetails.access_sc_tool ? "default" : "secondary"}>
                              {formatBooleanValue(contractDetails.access_sc_tool)}
                            </Badge>
                          </div>
                          
                          {contractDetails.access_other_systems && contractDetails.access_other_systems.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">{t('contract.otherSystems')}</p>
                              <div className="flex flex-wrap gap-2">
                                {contractDetails.access_other_systems.map((system: string, idx: number) => (
                                  <Badge key={idx} variant="outline">{system}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-muted/30">
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t('contract.noContractDetails')}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Media & Documents Section */}
        <Collapsible open={isMediaOpen} onOpenChange={setIsMediaOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Image className="h-6 w-6 text-primary" />
                    {t('hotels.media')} & {t('documents.title')}
                    <Badge variant="secondary">{files.length}</Badge>
                  </CardTitle>
                  {isMediaOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {/* Images */}
                {imageFiles.length > 0 && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('hotels.media')} ({imageFiles.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imageFiles.map(img => {
                          const entitySource = getEntitySourceLabel(img);
                          return (
                            <Card key={img.id} className="overflow-hidden group">
                              <div className="relative">
                                <AspectRatio ratio={16/9} className="bg-muted">
                                  {img.mime_type.startsWith("video") ? (
                                    <video 
                                      src={img.url}
                                      controls
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <img 
                                      src={img.url} 
                                      alt={img.original_name} 
                                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 cursor-pointer" 
                                      onClick={()=>openPreview(img)}
                                    />
                                  )}
                                </AspectRatio>
                                <Badge 
                                  variant={entitySource.type === 'hotel' ? 'default' : entitySource.type === 'room' ? 'secondary' : 'outline'}
                                  className="absolute top-2 right-2 text-xs"
                                >
                                  {entitySource.label}
                                </Badge>
                              </div>
                              <CardContent className="p-2">
                                <p className="text-xs truncate" title={img.original_name}>
                                  {img.original_name}
                                </p>
                                <div className="flex gap-1 mt-1 justify-end">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>openPreview(img)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => deleteFileMutation.mutate(img.id)}
                                    disabled={deleteFileMutation.isPending}
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                  <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                    <a href={img.url} download>
                                      <Download className="h-3 w-3" />
                                    </a>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Documents */}
                {documentFiles.length > 0 && (
                  <>
                    {imageFiles.length > 0 && <Separator />}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('documents.title')} ({documentFiles.length})</h3>
                      <div className="grid gap-3">
                        {documentFiles.map(file => {
                          const entitySource = getEntitySourceLabel(file);
                          return (
                            <Card key={file.id} className="bg-muted/30">
                              <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium truncate max-w-[300px]" title={file.original_name}>{file.original_name}</p>
                                      <Badge 
                                        variant={entitySource.type === 'hotel' ? 'default' : entitySource.type === 'room' ? 'secondary' : 'outline'}
                                        className="text-xs shrink-0"
                                      >
                                        {entitySource.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {(file.file_type_name || file.file_type_code) + ` • ${file.mime_type}` + (file.size ? ` • ${(file.size/1024/1024).toFixed(1)} MB` : '')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button variant="ghost" size="icon" onClick={()=>openPreview(file)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => deleteFileMutation.mutate(file.id)}
                                    disabled={deleteFileMutation.isPending}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                  <Button asChild variant="ghost" size="icon">
                                    <a href={file.url} download>
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {files.length === 0 && (
                  <Card className="bg-muted/30">
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t('files.noMediaFound', { defaultValue: 'No files found' })}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Dialogs */}
        <Dialog open={announceOpen} onOpenChange={setAnnounceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('announcements.setSpecialAnnouncement')}</DialogTitle>
              <DialogDescription>
                {currentAnnouncement ? 
                  t('announcements.currentAnnouncement') : 
                  t('announcements.description')
                }
              </DialogDescription>
            </DialogHeader>
            
            {currentAnnouncement && (
              <div className="mb-4 p-3 rounded-md bg-muted">
                <p className="text-sm font-medium mb-1">{t('announcements.current')}</p>
                <p className="text-sm">{currentAnnouncement.message}</p>
              </div>
            )}
            
            <Input 
              placeholder={t('announcements.messagePlaceholder')} 
              value={announceText} 
              onChange={(e)=>setAnnounceText(e.target.value)} 
            />
            <DialogFooter className="flex justify-between">
              <div>
                {currentAnnouncement && (
                  <Button 
                    variant="destructive"
                    onClick={()=>deleteAnnouncementMutation.mutate()} 
                    disabled={deleteAnnouncementMutation.isPending}
                  >
                    {t('common.delete')}
                  </Button>
                )}
              </div>
              <Button 
                onClick={()=>upsertMutation.mutate(announceText)} 
                disabled={upsertMutation.isPending || !announceText.trim()}
              >
                {t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewFile?.original_name}</DialogTitle>
            </DialogHeader>
            {previewFile && previewFile.mime_type.startsWith('image') ? (
              <img src={previewFile.url} alt={previewFile.original_name} className="max-h-full w-full object-contain" />
            ) : (
              <iframe src={previewFile?.url} title="preview" className="w-full h-full" />
            )}
            <DialogFooter>
              <Button asChild variant="outline" size="sm">
                <a href={previewFile?.url} download>
                  <Download className="h-4 w-4 mr-1" /> {t('common.download')}
                </a>
              </Button>
              <DialogClose asChild>
                <Button>{t('common.close')}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HotelView;
