import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Grid, 
  Users, 
  Calendar,
  FileImage,
  Image,
  FileText,
  File,
  Download,
  FileJson,
  FileSpreadsheet,
  Pencil,
  Save,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToCSV, exportToJSON } from "@/utils/exportUtils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HotelPermissions from '@/components/HotelPermissions';
import { useAuth } from '@/context/AuthContext';
import { getUserResourcePermissions } from '@/apiClient/permissionsApi';
import { useQuery } from '@tanstack/react-query';
import { getFullHotelDetails, updateHotel, type FullHotelResponse } from '@/apiClient/hotelsApi';

const ViewDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Extract type from URL path or parameters
  const type = params.type || (window.location.pathname.includes('/view/hotel/') ? 'hotel' : undefined);
  const id = params.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      starRating: 0,
      address: "",
      city: "",
      country: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      description: "",
      facilities: []
    }
  });
  
  const { user } = useAuth();
  
  // Load hotel data using React Query
  const { data: hotelData, isLoading, error } = useQuery<FullHotelResponse>({
    queryKey: ['hotelFull', id],
    queryFn: () => getFullHotelDetails(parseInt(id!)),
    enabled: !!id && type === 'hotel',
  });
  
  // Check if user has permission to manage this hotel
  const { data: userPermissions = [] } = useQuery({
    queryKey: ['userHotelPermissions', user?.id, parseInt(id || '0')],
    queryFn: () => getUserResourcePermissions(user!.id, 'hotel'),
    enabled: !!user?.id && !!id
  });

  const canManageHotel = userPermissions.some(
    p => p.resource_id === parseInt(id || '0') && 
      (p.permission_type === 'manage' || p.permission_type === 'edit')
  );
  
  // Update detail when hotelData changes
  useEffect(() => {
    if (hotelData && hotelData.hotel) {
      const hotel = hotelData.hotel;
      const transformedDetail = {
        id: hotel.id?.toString() || id,
        name: hotel.name || '',
        category: hotel.category || '',
        starRating: hotel.star_rating || 0,
        address: hotel.street || '',
        city: hotel.city || '',
        country: 'Germany', // Default for now
        contactName: 'Contact Person', // Default for now
        contactPhone: hotel.phone || '',
        contactEmail: hotel.email || '',
        description: 'Hotel description', // Default for now
        rooms: {
          singleRooms: Math.floor((hotel.total_rooms || 0) * 0.4),
          doubleRooms: Math.floor((hotel.total_rooms || 0) * 0.5),
          suites: Math.floor((hotel.total_rooms || 0) * 0.1),
          connectingRooms: Math.floor((hotel.total_rooms || 0) * 0.1),
          features: "AC, WiFi, Safe, Minibar, Room Service"
        },
        facilities: [
          "Indoor Pool",
          "Spa & Wellness Center", 
          "Fitness Center",
          "Business Center",
          "Concierge Service",
          "Valet Parking"
        ],
        events: {
          spaces: hotelData.eventSpaces?.length || 0,
          maxCapacity: 500,
          equipment: true,
          coordinator: "Event Coordinator"
        },
        fnb: {
          restaurants: 2,
          bars: 1,
          roomService: true,
          contact: "F&B Manager"
        },
        images: (() => {
          const imageFiles = hotelData.files?.filter(f => f.mime_type?.startsWith('image')) || [];
          const mainImage = imageFiles.find(f => f.file_type_code === 'main_image');
          const otherImages = imageFiles.filter(f => f.file_type_code !== 'main_image');
          
          // Put main_image first if it exists
          const orderedImages = mainImage ? [mainImage, ...otherImages] : imageFiles;
          
          return orderedImages.map(f => ({
            type: "image",
            url: f.url || '',
            title: f.original_name || 'Hotel Image',
            isMainImage: f.file_type_code === 'main_image'
          }));
        })(),
        documents: hotelData.files?.filter(f => !f.mime_type?.startsWith('image')).map(f => ({
          type: "document",
          name: f.original_name || 'Document',
          size: f.size ? `${Math.round(f.size / 1024 / 1024 * 10) / 10} MB` : 'Unknown'
        })) || []
      };
      
      setDetail(transformedDetail);
      setLoading(false);
    }
  }, [hotelData, id]);
  
  // Set loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Update form values when detail data changes
  useEffect(() => {
    if (detail) {
      form.reset({
        name: detail.name,
        category: detail.category,
        starRating: detail.starRating,
        address: detail.address,
        city: detail.city,
        country: detail.country,
        contactName: detail.contactName,
        contactPhone: detail.contactPhone,
        contactEmail: detail.contactEmail,
        description: detail.description,
        facilities: detail.facilities
      });
    }
  }, [detail, form]);

  const handleExport = (format: "pdf" | "csv" | "json") => {
    try {
      if (!detail) return;
      
      switch (format) {
        case "pdf":
          exportToPDF(detail);
          break;
        case "csv":
          exportToCSV(detail);
          break;
        case "json":
          exportToJSON(detail);
          break;
      }
      
      toast.success(`Exported ${detail.name} details as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export as ${format}. Please try again.`);
    }
  };
  
  // Get button text based on type
  const getEditButtonText = () => {
    switch (type) {
      case 'hotel': return 'Edit Hotel';
      case 'event': return 'Edit Event';
      case 'room': return 'Edit Room';
      case 'fnb': return 'Edit F&B';
      default: return 'Edit';
    }
  };

  // Handle edit button click based on resource type
  const handleEditClick = () => {
    
    switch (type) {
      case 'hotel':
        navigate(`/edit/hotel/${id}`);
        break;
      // Add other cases as needed
      default:
        setIsEditing(true); // Fallback to in-page editing for other resource types
        break;
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (detail) {
      form.reset({
        name: detail.name,
        category: detail.category,
        starRating: detail.starRating,
        address: detail.address,
        city: detail.city,
        country: detail.country,
        contactName: detail.contactName,
        contactPhone: detail.contactPhone,
        contactEmail: detail.contactEmail,
        description: detail.description,
        facilities: detail.facilities
      });
    }
  };
  
  const handleSave = async (formData: any) => {
    try {
      if (!id) {
        toast.error("No hotel ID available for update");
        return;
      }

      const updateData = {
        name: formData.name,
        category: formData.category,
        star_rating: formData.starRating,
        street: formData.address,
        city: formData.city,
        phone: formData.contactPhone,
        email: formData.contactEmail,
      };

      await updateHotel(parseInt(id), updateData);
      
      // Update local state with new data
      const updatedDetail = {
        ...detail,
        ...formData,
      };
      
      setDetail(updatedDetail);
      setIsEditing(false);
      toast.success("Hotel details updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update hotel details");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested item could not be found.</p>
        <Button onClick={() => navigate('/view')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    );
  }

  const getTypeTitle = () => {
    switch (type) {
      case 'hotel': return 'Hotel Details';
      case 'event': return 'Event Details';
      case 'room': return 'Room Details';
      case 'fnb': return 'Food & Beverage Details';
      default: return 'Details';
    }
  };

  const renderStars = (rating: number) => {
    if (rating === 0) {
      return <span className="text-muted-foreground">{t('starRatings.0')}</span>;
    }
    return Array(rating).fill(0).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
    ));
  };

  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'floorPlan': return <FileImage className="h-5 w-5" />;
      case 'brochure': return <FileText className="h-5 w-5" />;
      case 'menu': return <FileText className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/view')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{getTypeTitle()}</h1>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as PDF/Text</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    <FileJson className="mr-2 h-4 w-4" />
                    <span>Export as JSON</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => navigate(`/edit/hotel/${id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Hotel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant="default" onClick={form.handleSubmit(handleSave)}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Hotel Name" 
                              className="text-2xl font-bold leading-none h-10"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : (
                    <CardTitle className="text-2xl">{detail.name}</CardTitle>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {isEditing ? (
                      <>
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormControl>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Luxury">Luxury</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Budget">Budget</SelectItem>
                                    <SelectItem value="Resort">Resort</SelectItem>
                                    <SelectItem value="Boutique">Boutique</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="starRating"
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormControl>
                                <Select 
                                  value={field.value.toString()} 
                                  onValueChange={(val) => field.onChange(parseInt(val))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Rating" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">{t('starRatings.0')}</SelectItem>
                                    <SelectItem value="1">{t('starRatings.1')}</SelectItem>
                                    <SelectItem value="2">{t('starRatings.2')}</SelectItem>
                                    <SelectItem value="3">{t('starRatings.3')}</SelectItem>
                                    <SelectItem value="4">{t('starRatings.4')}</SelectItem>
                                    <SelectItem value="5">{t('starRatings.5')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <Badge variant="outline" className="font-normal">
                          {detail.category}
                        </Badge>
                        <div className="flex items-center">
                          {renderStars(detail.starRating)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Building className="mr-1 h-3 w-3" />
                    {detail.rooms.singleRooms + detail.rooms.doubleRooms + detail.rooms.suites} Rooms
                  </Badge>
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {detail.events.spaces} Event Spaces
                  </Badge>
                  <Badge variant="secondary">
                    <Grid className="mr-1 h-3 w-3" />
                    {detail.fnb.restaurants + detail.fnb.bars} F&B Outlets
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3">
                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormControl>
                            <Textarea 
                              placeholder="Hotel description"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : (
                    <p className="text-muted-foreground mb-4">
                      {detail.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          {isEditing ? (
                            <>
                              <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        placeholder="Street address"
                                        className="my-1"
                                        {...field} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div className="flex gap-2">
                                <FormField
                                  control={form.control}
                                  name="city"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input 
                                          placeholder="City"
                                          className="text-sm"
                                          {...field} 
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="country"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input 
                                          placeholder="Country"
                                          className="text-sm"
                                          {...field} 
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">{detail.address}</p>
                              <p className="text-sm text-muted-foreground">{detail.city}, {detail.country}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Contact</p>
                          {isEditing ? (
                            <>
                              <FormField
                                control={form.control}
                                name="contactName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        placeholder="Contact name"
                                        className="my-1 text-sm"
                                        {...field} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        placeholder="Phone number"
                                        className="text-sm"
                                        {...field} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">{detail.contactName}</p>
                              <p className="text-sm text-muted-foreground">{detail.contactPhone}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          {isEditing ? (
                            <FormField
                              control={form.control}
                              name="contactEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      placeholder="Email address"
                                      className="text-sm"
                                      {...field} 
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">{detail.contactEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/3">
                  {detail.images && detail.images.length > 0 && detail.images[0].url && (
                    <div className="relative rounded-md overflow-hidden border">
                      <AspectRatio ratio={16 / 9}>
                        <img 
                          src={detail.images[0].url} 
                          alt={detail.images[0].title || detail.name}
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      {detail.images[0].isMainImage && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Main Image
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Note: Facility editing is not implemented in this version.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {detail.facilities.map((facility: string, index: number) => (
                  <Badge key={index} variant="outline" className="justify-start py-1.5 px-3">
                    {facility}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Food & Beverage</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Note: F&B editing is not implemented in this version.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Outlets</p>
                  <p className="text-sm text-muted-foreground">
                    {detail.fnb.restaurants} Restaurants, {detail.fnb.bars} Bars
                  </p>
                </div>
                <div>
                  <p className="font-medium">F&B Contact</p>
                  <p className="text-sm text-muted-foreground">{detail.fnb.contact}</p>
                </div>
                <div>
                  <p className="font-medium">Room Service</p>
                  <Badge variant={detail.fnb.roomService ? "default" : "outline"}>
                    {detail.fnb.roomService ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Note: Room editing is not implemented in this version.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="text-2xl font-bold">{detail.rooms.singleRooms}</p>
                  <p className="text-sm text-muted-foreground">Single Rooms</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="text-2xl font-bold">{detail.rooms.doubleRooms}</p>
                  <p className="text-sm text-muted-foreground">Double Rooms</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="text-2xl font-bold">{detail.rooms.suites}</p>
                  <p className="text-sm text-muted-foreground">Suites</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="text-2xl font-bold">{detail.rooms.connectingRooms}</p>
                  <p className="text-sm text-muted-foreground">Connecting Rooms</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Room Features</p>
                <div className="flex flex-wrap gap-2">
                  {detail.rooms.features.split(', ').map((feature: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Note: Event facilities editing is not implemented in this version.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="font-medium">Event Spaces</p>
                  <p className="text-xl">{detail.events.spaces} <span className="text-sm text-muted-foreground">spaces</span></p>
                </div>
                <div>
                  <p className="font-medium">Maximum Capacity</p>
                  <p className="text-xl">{detail.events.maxCapacity} <span className="text-sm text-muted-foreground">people</span></p>
                </div>
                <div>
                  <p className="font-medium">AV Equipment</p>
                  <Badge variant={detail.events.equipment ? "default" : "outline"}>
                    {detail.events.equipment ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">Event Coordinator</p>
                  <p className="text-muted-foreground">{detail.events.coordinator}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <p className="font-medium mb-4">Upcoming Events</p>
                <p className="text-muted-foreground italic">No upcoming events scheduled</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Images & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Note: Document and image editing is not implemented in this version.
                  </p>
                </div>
              ) : null}
              <div className="mb-8">
                <h3 className="text-md font-medium mb-4">Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {detail.images.map((image: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <AspectRatio ratio={4/3}>
                        <img 
                          src={image.url} 
                          alt={image.title} 
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {renderFileIcon(image.type)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{image.title}</p>
                              {image.isMainImage && (
                                <Badge variant="secondary" className="text-xs mt-1">Main Image</Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <Download size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {detail.documents && detail.documents.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-4">Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {detail.documents.map((doc: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {renderFileIcon(doc.type)}
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {detail && canManageHotel && (
        <div className="mb-8">
          <HotelPermissions hotelId={parseInt(id)} hotelName={detail.name!} />
        </div>
      )}
    </div>
  );
};

export default ViewDetail;
