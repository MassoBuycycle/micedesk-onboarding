import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingChanges,
  reviewChange,
  PendingChange,
} from "@/apiClient/approvalApi";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

const RenderDiff: React.FC<{ change: PendingChange }> = ({ change }) => {
  const { t } = useTranslation();
  
  // Handle cases where data might be null, undefined, or invalid
  let original: any = {};
  let updated: any = {};
  
  // The backend already parses the JSON, so we can use the data directly
  if (change.original_data && typeof change.original_data === 'object') {
    original = change.original_data;
  } else if (change.original_data && typeof change.original_data === 'string') {
    try {
      original = JSON.parse(change.original_data);
    } catch (e) {
      original = {};
    }
  }
  
  if (change.change_data && typeof change.change_data === 'object') {
    updated = change.change_data;
  } else if (change.change_data && typeof change.change_data === 'string') {
    try {
      updated = JSON.parse(change.change_data);
    } catch (e) {
      updated = {};
    }
  }

  const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(updated)]));

  const formatValue = (value: any, fieldName: string): string => {
    if (value === null || value === undefined) return '-';
    if (value === '') return t('common.empty', '(empty)');
    if (fieldName.includes('phone') && typeof value === 'string') {
      return value.replace(/^\+49\s*0/, '+49 ');
    }
    if (fieldName.includes('cost') && typeof value === 'number') {
      return `€${value.toFixed(2)}`;
    }
    if (fieldName.includes('rating') && typeof value === 'number') {
      return `${value} ⭐`;
    }
    if (fieldName.includes('year') && typeof value === 'number') {
      return value.toString();
    }
    if (fieldName.includes('km') && typeof value === 'number') {
      return `${value} km`;
    }
    if (fieldName.includes('rooms') && typeof value === 'number') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : t('common.empty', '(empty)');
    }
    if (typeof value === 'object') {
      return t('common.complexData', '(complex data)');
    }
    return String(value);
  };

  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMappings: { [key: string]: string } = {
      'name': t('hotel.name', 'Hotel Name'),
      'city': t('hotel.city', 'City'),
      'country': t('hotel.country', 'Country'),
      'street': t('hotel.street', 'Street Address'),
      'postal_code': t('hotel.postalCode', 'Postal Code'),
      'email': t('auth.email', 'Email Address'),
      'phone': t('hotel.phone', 'Phone Number'),
      'website': t('hotel.website', 'Website'),
      'description': t('common.description', 'Description'),
      'star_rating': t('hotel.starRating', 'Star Rating'),
      'total_rooms': t('rooms.totalRooms', 'Total Rooms'),
      'opening_year': t('hotel.openingDate', 'Opening Year'),
      'latest_renovation_year': t('hotel.renovationDate', 'Latest Renovation Year'),
      'conference_rooms': t('hotel.conferenceRooms', 'Conference Rooms'),
      'parking_remarks': t('hotel.parkingRemarks', 'Parking Information'),
      'planned_changes': t('hotel.plannedChanges', 'Planned Changes'),
      'system_hotel_id': t('hotel.hotelId', 'System Hotel ID'),
      'additional_links': t('hotel.additionalLinks', 'Additional Links'),
      'opening_time_pool': t('hotel.poolHours', 'Pool Opening Hours'),
      'opening_time_spa_area': t('hotel.spaHours', 'Spa Area Opening Hours'),
      'opening_time_fitness_center': t('hotel.fitnessHours', 'Fitness Center Hours'),
      'equipment_spa_area': t('hotel.spaEquipment', 'Spa Equipment'),
      'equipment_fitness_center': t('hotel.fitnessEquipment', 'Fitness Equipment'),
      'billing_address_name': t('hotel.billingName', 'Billing Company Name'),
      'billing_address_street': t('hotel.billingStreet', 'Billing Street Address'),
      'billing_address_city': t('hotel.billingCity', 'Billing City'),
      'billing_address_zip': t('hotel.billingZip', 'Billing Postal Code'),
      'billing_address_vat': t('hotel.billingVat', 'VAT Number'),
      'general_manager_name': t('hotel.generalManagerSection', 'General Manager Name'),
      'general_manager_email': t('hotel.generalManagerSection', 'General Manager Email'),
      'general_manager_phone': t('hotel.generalManagerSection', 'General Manager Phone'),
      'no_of_parking_spaces': t('hotels.totalSpaces', 'Parking Spaces'),
      'parking_cost_per_day': t('hotels.costPerDay', 'Daily Parking Cost'),
      'parking_cost_per_hour': t('hotels.costPerHour', 'Hourly Parking Cost'),
      'no_of_parking_spaces_bus': t('hotels.busSpaces', 'Bus Parking Spaces'),
      'no_of_parking_spaces_disabled': t('hotels.disabledSpaces', 'Disabled Parking Spaces'),
      'no_of_parking_spaces_electric': t('hotels.electricSpaces', 'Electric Vehicle Parking'),
      'no_of_parking_spaces_garage': t('hotels.garageSpaces', 'Garage Parking Spaces'),
      'no_of_parking_spaces_outside': t('hotels.outsideSpaces', 'Outdoor Parking Spaces'),
      'distance_to_fair_km': t('hotels.fair', 'Distance to Fair'),
      'distance_to_airport_km': t('hotels.airport', 'Distance to Airport'),
      'distance_to_train_station': t('hotels.trainStation', 'Distance to Train Station'),
      'distance_to_public_transport': t('hotels.publicTransport', 'Distance to Public Transport'),
      'distance_to_highway_km': t('hotels.highway', 'Distance to Highway'),
      'attraction_in_the_area': t('hotel.attractions', 'Nearby Attractions'),
      'category': t('hotel.category', 'Hotel Category'),
      'pms_system': t('hotel.pmsSystem', 'PMS System'),
      'opening_date': t('hotel.openingDate', 'Opening Date'),
      'latest_renovation_date': t('hotel.renovationDate', 'Latest Renovation Date')
    };
    
    return fieldMappings[fieldName] || fieldName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (allKeys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-medium mb-4">{t('admin.approvals.noDataTitle')}</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left">
          <p className="text-sm mb-2"><strong>{t('admin.approvals.changeId')}:</strong> {change.id}</p>
          <p className="text-sm mb-2"><strong>{t('admin.approvals.entryType')}:</strong> {change.entry_type}</p>
          <p className="text-sm mb-2"><strong>{t('admin.approvals.entryId')}:</strong> {change.entry_id}</p>
          <p className="text-sm mb-2"><strong>{t('common.status', 'Status')}:</strong> {change.status}</p>
          <p className="text-sm mb-2"><strong>{t('common.submitted', 'Submitted')}:</strong> {new Date(change.created_at).toLocaleString()}</p>
          <p className="text-sm mb-2"><strong>{t('admin.approvals.originalData')}:</strong> {change.original_data ? t('common.available', 'Available') : t('common.missing', 'Missing')}</p>
          <p className="text-sm mb-2"><strong>{t('admin.approvals.changeData')}:</strong> {change.change_data ? t('common.available', 'Available') : t('common.missing', 'Missing')}</p>
        </div>
        <p className="text-xs mt-4 text-gray-500">
          {t('admin.approvals.legacyNote')}
        </p>
      </div>
    );
  }

  const displayKeys = allKeys
    .filter(key => !['id', 'created_at', 'updated_at'].includes(key))
    .sort((a, b) => {
      if (a === 'name') return -1;
      if (b === 'name') return 1;
      if (['city', 'country', 'street', 'postal_code'].includes(a)) return -1;
      if (['city', 'country', 'street', 'postal_code'].includes(b)) return 1;
      return a.localeCompare(b);
    });

  const changedFields = displayKeys.filter(key => original[key] !== updated[key]);
  const unchangedFields = displayKeys.filter(key => original[key] === updated[key]);

  return (
    <div className="text-sm">
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 {t('admin.approvals.changeSummary')}</h3>
            <p className="text-sm text-blue-700">
              {t('admin.approvals.summaryHelp', {
                red: t('admin.approvals.redText', 'Red'),
                green: t('admin.approvals.greenText', 'green')
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{changedFields.length}</div>
            <div className="text-xs text-blue-600 uppercase tracking-wide">{t('admin.approvals.fieldsChanged')}</div>
          </div>
        </div>
      </div>
      
      {changedFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {t('admin.approvals.changedFields', { count: changedFields.length })}
          </h4>
          {changedFields.map(key => {
            const origVal = original[key];
            const newVal = updated[key];
            
            return (
              <div key={key} className="p-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-base flex items-center">
                    <span className="mr-2">📝</span>
                    {getFieldDisplayName(key)}
                  </h4>
                  <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                    {t('admin.approvals.changed')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                      <span className="mr-2">❌</span>
                      {t('admin.approvals.originalValue')}
                    </div>
                    <div className="p-3 bg-white rounded border border-red-200 shadow-sm">
                      <span className="text-sm text-red-700 font-medium">
                        {formatValue(origVal, key)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                      <span className="mr-2">✅</span>
                      {t('admin.approvals.newValue')}
                    </div>
                    <div className="p-3 bg-white rounded border border-green-200 shadow-sm">
                      <span className="text-sm text-green-700 font-medium">
                        {formatValue(newVal, key)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <div className="flex items-center text-xs text-orange-600">
                    <span className="mr-2">🔄</span>
                    <span>{t('admin.approvals.fieldUpdated', { from: formatValue(origVal, key), to: formatValue(newVal, key) })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {unchangedFields.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">📝</span>
            {t('admin.approvals.unchangedFields')}
          </h4>
          <p className="text-sm text-gray-600">
            {t('admin.approvals.unchangedCount', { count: unchangedFields.length })}
          </p>
          <details className="mt-3">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              {t('admin.approvals.viewUnchanged')}
            </summary>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {unchangedFields.slice(0, 12).map(key => (
                <span key={key} className="text-xs bg-white px-2 py-1 rounded border text-gray-600">
                  {getFieldDisplayName(key)}
                </span>
              ))}
              {unchangedFields.length > 12 && (
                <span className="text-xs bg-white px-2 py-1 rounded border text-gray-500">
                  +{unchangedFields.length - 12} {t('common.more', 'more')}
                </span>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

const PendingApprovalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: changes,
    isPending,
    isError,
  } = useQuery<PendingChange[]>({
    queryKey: ["pendingChanges"],
    queryFn: () => getPendingChanges("pending"),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
      reviewChange(id, status),
    onSuccess: (_, variables) => {
      toast({
        title: t('admin.approvals.changeReviewedTitle', { status: t(`admin.approvals.${variables.status}`) }),
        description: t('admin.approvals.changeReviewedDesc', { status: t(`admin.approvals.${variables.status}`) }),
      });
      queryClient.invalidateQueries({ queryKey: ["pendingChanges"] });
    },
    onError: (err: any) => {
      toast({
        title: t('common.error'),
        description: err?.message || t('admin.approvals.reviewFailed'),
        variant: "destructive",
      });
    },
  });

  if (isPending) return <div>{t('common.loading')}</div>;
  if (isError) return <div>{t('admin.approvals.loadError')}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t('admin.approvals.title')}</h1>
      {changes && changes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-4">
          <CheckCircle className="h-12 w-12 text-success" />
          <p className="text-lg font-medium">{t('admin.approvals.none')}</p>
          <p className="text-sm">{t('admin.approvals.allUpToDate')}</p>
        </div>
      )}
      {changes && changes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.id', 'ID')}</TableHead>
              <TableHead>{t('admin.approvals.entryType')}</TableHead>
              <TableHead>{t('admin.approvals.entryId')}</TableHead>
              <TableHead>{t('admin.approvals.submittedBy')}</TableHead>
              <TableHead>{t('common.date', 'Date')}</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.id}>
                <TableCell>{change.id}</TableCell>
                <TableCell className="capitalize">{change.entry_type}</TableCell>
                <TableCell>{change.entry_id}</TableCell>
                <TableCell>
                  {change.submitter_first_name} {change.submitter_last_name}
                </TableCell>
                <TableCell>
                  {new Date(change.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        {t('common.view')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{t('admin.approvals.reviewChange', { id: change.id })}</DialogTitle>
                        <DialogDescription className="text-base">
                          {t('admin.approvals.reviewDescription')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-y-auto mt-6 px-1">
                        <RenderDiff change={change} />
                      </div>
                      <DialogFooter className="mt-8 space-x-3">
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={() => mutation.mutate({ id: change.id, status: "rejected" })}
                          disabled={mutation.isPending}
                        >
                          {t('admin.approvals.reject')}
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => mutation.mutate({ id: change.id, status: "approved" })}
                          disabled={mutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {t('admin.approvals.approve')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PendingApprovalsPage; 