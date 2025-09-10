import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Settings, Trash2, Edit, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getAllHotels, Hotel } from "@/apiClient/hotelsApi";
import { 
  getInformationPoliciesByHotel, 
  deleteInformationPolicy,
  InformationPolicy 
} from "@/apiClient/informationPoliciesApi";
import PolicyFormDialog from "@/components/policies/PolicyFormDialog";
import PolicyItemsDialog from "@/components/policies/PolicyItemsDialog";

const Policies = () => {
  const { t } = useTranslation();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [policies, setPolicies] = useState<InformationPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InformationPolicy | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<InformationPolicy | null>(null);

  // Load hotels on component mount
  useEffect(() => {
    loadHotels();
  }, []);

  // Load policies when hotel is selected
  useEffect(() => {
    if (selectedHotel?.system_hotel_id) {
      loadPolicies(selectedHotel.system_hotel_id);
    } else {
      setPolicies([]);
    }
  }, [selectedHotel]);

  const loadHotels = async () => {
    try {
      const hotelsData = await getAllHotels();
      // Ensure hotelsData is an array and filter hotels with system_hotel_id
      const hotelsArray = Array.isArray(hotelsData) ? hotelsData : [];
      const hotelsWithId = hotelsArray.filter(hotel => hotel.system_hotel_id && hotel.system_hotel_id.trim() !== '');
      setHotels(hotelsWithId);
    } catch (error) {
      setHotels([]); // Ensure we set an empty array on error
      toast.error(t("messages.error.failedToLoad"));
    }
  };

  const loadPolicies = async (systemHotelId: string) => {
    setLoading(true);
    try {
      const policiesData = await getInformationPoliciesByHotel(systemHotelId);
      // Ensure policiesData is always an array
      setPolicies(Array.isArray(policiesData) ? policiesData : []);
    } catch (error) {
      setPolicies([]); // Ensure we set an empty array on error
      toast.error(t("policies.failedToUpdateItems"));
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotelId: string) => {
    const hotel = hotels.find(h => h.id?.toString() === hotelId);
    setSelectedHotel(hotel || null);
  };

  const handleCreatePolicy = () => {
    if (!selectedHotel?.system_hotel_id) {
      toast.error(t("policies.selectHotelFirst"));
      return;
    }
    setEditingPolicy(null);
    setIsFormDialogOpen(true);
  };

  const handleEditPolicy = (policy: InformationPolicy) => {
    setEditingPolicy(policy);
    setIsFormDialogOpen(true);
    // Ensure the items dialog is closed when editing
    setIsItemsDialogOpen(false);
    setSelectedPolicy(null);
  };

  const handleDeletePolicy = async (policy: InformationPolicy) => {
    if (!policy.id) return;
    
    if (!confirm(t("policies.confirmDelete", { policyType: getPolicyTypeLabel(policy.type) }))) {
      return;
    }

    try {
      await deleteInformationPolicy(policy.id);
      toast.success(t("policies.policyDeleted"));
      if (selectedHotel?.system_hotel_id) {
        loadPolicies(selectedHotel.system_hotel_id);
      }
    } catch (error) {
      toast.error(t("policies.failedToDeletePolicy"));
    }
  };

  const handleManageItems = (policy: InformationPolicy) => {
    setSelectedPolicy(policy);
    setIsItemsDialogOpen(true);
    // Ensure the edit dialog is closed when managing items
    setIsFormDialogOpen(false);
    setEditingPolicy(null);
  };

  const handlePolicyFormSuccess = () => {
    setIsFormDialogOpen(false);
    setEditingPolicy(null);
    if (selectedHotel?.system_hotel_id) {
      loadPolicies(selectedHotel.system_hotel_id);
    }
  };

  const handleItemsSuccess = () => {
    setIsItemsDialogOpen(false);
    setSelectedPolicy(null);
    if (selectedHotel?.system_hotel_id) {
      loadPolicies(selectedHotel.system_hotel_id);
    }
  };

  const getPolicyTypeLabel = (type: string) => {
    switch (type) {
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

  const getPolicyTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'room_information':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'service_information':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'general_policies':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("policies.title")}</h1>
          <p className="text-muted-foreground">
            {t("policies.subtitle")}
          </p>
        </div>
      </div>

      {/* Hotel Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("policies.selectHotel")}
          </CardTitle>
          <CardDescription>
            {t("policies.selectHotelDescription")}
            {hotels.length === 0 && (
              <span className="block mt-1 text-amber-600">
                {t("policies.noHotelsWithId")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select onValueChange={handleHotelSelect} disabled={hotels.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    hotels.length === 0 
                      ? t("policies.noHotelsAvailable")
                      : t("policies.selectHotelPlaceholder")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {(hotels || []).map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id?.toString() || ''}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{hotel.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {hotel.system_hotel_id}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedHotel && (
              <Button onClick={handleCreatePolicy} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("policies.createPolicy")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      {selectedHotel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("policies.policiesFor")} {selectedHotel.name}
              {selectedHotel.system_hotel_id && (
                <Badge variant="outline" className="ml-2">
                  {selectedHotel.system_hotel_id}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {t("policies.managePoliciesFor")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">{t("common.loading")}</div>
              </div>
            ) : (policies || []).length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("policies.noPoliciesFound")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("policies.noPoliciesDescription")}
                </p>
                <Button onClick={handleCreatePolicy} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("policies.createFirstPolicy")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {(policies || []).map((policy) => (
                  <Card key={policy.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getPolicyTypeBadgeColor(policy.type)}
                            >
                              {getPolicyTypeLabel(policy.type)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {(policy.items && Array.isArray(policy.items) ? policy.items.length : 0)} {t("common.items")}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t("hotel.created")}: {new Date(policy.created_at || '').toLocaleDateString()}
                            {policy.updated_at !== policy.created_at && (
                              <span className="ml-2">
                                • {t("hotel.updated")}: {new Date(policy.updated_at || '').toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageItems(policy)}
                            className="gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            {t("policies.manageItems")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPolicy(policy)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            {t("common.edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePolicy(policy)}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("common.delete")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Policy Form Dialog */}
      <PolicyFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        hotel={selectedHotel}
        policy={editingPolicy}
        onSuccess={handlePolicyFormSuccess}
        onManageItems={(policy) => {
          setSelectedPolicy(policy);
          setIsItemsDialogOpen(true);
          setIsFormDialogOpen(false);
        }}
      />

      {/* Policy Items Dialog */}
      <PolicyItemsDialog
        open={isItemsDialogOpen}
        onOpenChange={setIsItemsDialogOpen}
        policy={selectedPolicy}
        onSuccess={handleItemsSuccess}
      />
    </div>
  );
};

export default Policies; 