import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getEntityFiles, FileData } from "@/apiClient/filesApi";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2, Loader2, Building2 } from "lucide-react";
import UserAssignmentDialog from "@/components/dialogs/UserAssignmentDialog";
import UserAvatarGroup from "@/components/user/UserAvatarGroup";
import { mockUsers } from "@/components/user/UserAssignmentSelect";
import { User, UserRole } from "@/pages/UserManagement";
import { getAllHotels, Hotel, deleteHotel } from "@/apiClient/hotelsApi";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserWithAssignmentInfo, getUsersByHotelId } from "@/apiClient/userHotelsApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface HotelListProps {
  searchQuery?: string;
}

const HotelList = ({ searchQuery = "" }: HotelListProps) => {
  const navigate = useNavigate();
  const { permissions, user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelUsers, setHotelUsers] = useState<Record<string, User[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refreshing the user list
  const refreshUsers = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const data = await getAllHotels();
        setHotels(data);
        setError(null);
      } catch (err) {
        setError(t("pages.view.failedToLoadHotels"));
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [t]);

  // Fetch users for a specific hotel
  const fetchUsersForHotel = useCallback(async (hotelId: string, hotelName?: string): Promise<User[]> => {
    try {
      const apiUsers = await getUsersByHotelId(hotelId);
      
      // Convert API users to our application's User format
      return apiUsers.map(apiUser => ({
        id: apiUser.id.toString(),
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        email: apiUser.email,
        role: "viewer" as UserRole, // You might want to store role in API too
        assignedHotels: apiUser.has_all_access ? ["All Hotels"] : [hotelName || ""],
        status: "active" as "active" | "pending" | "inactive",
        dateAdded: new Date(apiUser.created_at).toISOString().split('T')[0]
      }));
    } catch (error) {
      return [];
    }
  }, []);

  // Refresh users for a specific hotel
  const refreshHotelUsers = useCallback(async (hotelId: string, hotelName?: string) => {
    if (!hotelId) return;
    
    const users = await fetchUsersForHotel(hotelId, hotelName);
    setHotelUsers(prev => ({
      ...prev,
      [hotelId]: users
    }));
  }, [fetchUsersForHotel]);

  useEffect(() => {
    // Fetch users for each hotel
    const fetchUsersForHotels = async () => {
      if (!hotels.length) return;
      
      try {
        const usersMap: Record<string, User[]> = {};
        
        for (const hotel of hotels) {
          if (hotel.id) {
            const hotelId = hotel.id.toString();
            const users = await fetchUsersForHotel(hotelId, hotel.name);
            usersMap[hotelId] = users;
          }
        }
        
        setHotelUsers(usersMap);
      } catch (err) {
      }
    };
    
    fetchUsersForHotels();
  }, [hotels, fetchUsersForHotel, refreshTrigger]);

  // Filter hotels based on search query
  const filteredHotels = hotels.filter(hotel => {
    const query = searchQuery.toLowerCase();
    return (
      (hotel.name?.toLowerCase().includes(query) || false) ||
      (hotel.city?.toLowerCase().includes(query) || false) ||
      (hotel.id?.toString().includes(query) || false)
    );
  });

  // Function to get assigned users for a hotel
  const getAssignedUsers = (hotelId: number | undefined): User[] => {
    if (!hotelId) return [];
    return hotelUsers[hotelId.toString()] || [];
  };

  // Handle hotel deletion
  const handleDelete = async (hotel: Hotel) => {
    if (!hotel.id || !hotel.name) return;
    
    if (!confirm(t("hotels.confirmDelete"))) {
      return;
    }

    try {
      await deleteHotel(hotel.id);
      toast.success(t("hotels.deleted"));
      
      // Refresh the hotel list
      const data = await getAllHotels();
      setHotels(data);
    } catch (error: any) {
      toast.error(error.message || t("hotels.deleteFailed"));
    }
  };

  // Render hotel name with main image (if any)
  const HotelNameWithImage: React.FC<{ hotel: Hotel }> = ({ hotel }) => {
    const { data } = useQuery<FileData[]>({
      queryKey: ['hotelMainImage', hotel.id],
      queryFn: () => getEntityFiles('hotels', hotel.id as number, 'hotel'),
      enabled: !!hotel.id,
      staleTime: 5 * 60 * 1000,
    });

    const image: string | undefined = data?.find((f)=>f.file_type_code === 'main_image')?.url;

    return (
      <div className="flex items-center gap-2">
        {image ? (
          <img src={image} alt="hotel" className="w-8 h-8 rounded object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center rounded bg-accent/20 text-accent-foreground shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
        )}
        <span>{hotel.name || t("common.unnamedHotel")}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("pages.view.loadingHotels")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.name")}</TableHead>
            <TableHead>{t("common.location")}</TableHead>
            <TableHead>{t("common.starRating")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead className="w-[180px]">{t("common.assignedUsers")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHotels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {searchQuery ? t("pages.view.noHotelsMatching") : t("pages.view.noHotelsFound")}
              </TableCell>
            </TableRow>
          ) : (
            filteredHotels.map((hotel) => {
              const assignedUsers = hotel.name ? getAssignedUsers(hotel.id) : [];
              const location = hotel.city ? (hotel.city + (hotel.postal_code ? ', ' + hotel.postal_code : '')) : 'N/A';
              const isAssigned = hotel.id ? getAssignedUsers(hotel.id).some(u => u.id === (currentUser?.id?.toString() || "")) : false;
              const canEdit = permissions.includes("edit_all") ||
                (isAssigned && permissions.includes("edit_assigned")) || permissions.includes("edit_with_approval");
              const canManageAssignments = permissions.includes("assign_entries") || permissions.includes("edit_all");
              const canDelete = permissions.includes("edit_all");

              return (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">
                    <HotelNameWithImage hotel={hotel} />
                  </TableCell>
                  <TableCell>{location || "N/A"}</TableCell>
                  <TableCell>
                    {hotel.star_rating === 0 ? t('starRatings.0') : 
                     hotel.star_rating ? `${hotel.star_rating} ${t('hotels.stars')}` : t('starRatings.0')}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t("common.active")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {hotel.id && getAssignedUsers(hotel.id).length > 0 ? (
                        <UserAvatarGroup users={getAssignedUsers(hotel.id)} />
                      ) : (
                        <span className="text-sm text-muted-foreground">{t("common.noUsersAssigned")}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/view/hotel/${hotel.id}`)}
                        title={t("pages.view.viewDetails")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("pages.view.editHotel")}
                          onClick={() => navigate(`/edit/hotel/${hotel.id}`)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      )}
                      {hotel.name && hotel.id && canManageAssignments && (
                        <UserAssignmentDialog 
                          hotelId={hotel.id.toString()} 
                          hotelName={hotel.name}
                          onAssignmentUpdate={() => refreshHotelUsers(hotel.id!.toString(), hotel.name)}
                        />
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("pages.view.deleteHotel")}
                          onClick={() => handleDelete(hotel)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HotelList;
