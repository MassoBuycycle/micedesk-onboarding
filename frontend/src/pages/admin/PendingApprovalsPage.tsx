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

const renderDiff = (change: PendingChange) => {
  
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

  // Helper function to format field values nicely
  const formatValue = (value: any, fieldName: string): string => {
    if (value === null || value === undefined) return '-';
    if (value === '') return '(empty)';
    
    // Handle specific field types
    if (fieldName.includes('phone') && typeof value === 'string') {
      return value.replace(/^\+49\s*0/, '+49 '); // Format German phone numbers
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
      return value.length > 0 ? value.join(', ') : '(empty)';
    }
    
    if (typeof value === 'object') {
      return '(complex data)';
    }
    
    return String(value);
  };

  // Helper function to get a human-readable field name
  const getFieldDisplayName = (fieldName: string): string => {
    const fieldMappings: { [key: string]: string } = {
      'name': 'Hotel Name',
      'city': 'City',
      'country': 'Country',
      'street': 'Street Address',
      'postal_code': 'Postal Code',
      'email': 'Email Address',
      'phone': 'Phone Number',
      'website': 'Website',
      'description': 'Description',
      'star_rating': 'Star Rating',
      'total_rooms': 'Total Rooms',
      'opening_year': 'Opening Year',
      'latest_renovation_year': 'Latest Renovation Year',
      'conference_rooms': 'Conference Rooms',
      'parking_remarks': 'Parking Information',
      'planned_changes': 'Planned Changes',
      'system_hotel_id': 'System Hotel ID',
      'additional_links': 'Additional Links',
      'opening_time_pool': 'Pool Opening Hours',
      'opening_time_spa_area': 'Spa Area Opening Hours',
      'opening_time_fitness_center': 'Fitness Center Opening Hours',
      'equipment_spa_area': 'Spa Equipment',
      'equipment_fitness_center': 'Fitness Equipment',
      'billing_address_name': 'Billing Company Name',
      'billing_address_street': 'Billing Street Address',
      'billing_address_city': 'Billing City',
      'billing_address_zip': 'Billing Postal Code',
      'billing_address_vat': 'VAT Number',
      'general_manager_name': 'General Manager Name',
      'general_manager_email': 'General Manager Email',
      'general_manager_phone': 'General Manager Phone',
      'no_of_parking_spaces': 'Parking Spaces',
      'parking_cost_per_day': 'Daily Parking Cost',
      'parking_cost_per_hour': 'Hourly Parking Cost',
      'no_of_parking_spaces_bus': 'Bus Parking Spaces',
      'no_of_parking_spaces_disabled': 'Disabled Parking Spaces',
      'no_of_parking_spaces_electric': 'Electric Vehicle Parking',
      'no_of_parking_spaces_garage': 'Garage Parking Spaces',
      'no_of_parking_spaces_outside': 'Outdoor Parking Spaces',
      'distance_to_fair_km': 'Distance to Fair',
      'distance_to_airport_km': 'Distance to Airport',
      'distance_to_train_station': 'Distance to Train Station',
      'distance_to_public_transport': 'Distance to Public Transport',
      'distance_to_highway_km': 'Distance to Highway',
      'attraction_in_the_area': 'Nearby Attractions',
      'category': 'Hotel Category',
      'pms_system': 'PMS System',
      'opening_date': 'Opening Date',
      'latest_renovation_date': 'Latest Renovation Date'
    };
    
    return fieldMappings[fieldName] || fieldName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (allKeys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-medium mb-4">No Data Available for Comparison</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left">
          <p className="text-sm mb-2"><strong>Change ID:</strong> {change.id}</p>
          <p className="text-sm mb-2"><strong>Entry Type:</strong> {change.entry_type}</p>
          <p className="text-sm mb-2"><strong>Entry ID:</strong> {change.entry_id}</p>
          <p className="text-sm mb-2"><strong>Status:</strong> {change.status}</p>
          <p className="text-sm mb-2"><strong>Submitted:</strong> {new Date(change.created_at).toLocaleString()}</p>
          <p className="text-sm mb-2"><strong>Original Data:</strong> {change.original_data ? 'Available' : 'Missing'}</p>
          <p className="text-sm mb-2"><strong>Change Data:</strong> {change.change_data ? 'Available' : 'Missing'}</p>
        </div>
        <p className="text-xs mt-4 text-gray-500">
          This change request may have been created before the approval system was fully implemented.
        </p>
      </div>
    );
  }

  // Filter out system fields and sort remaining fields
  const displayKeys = allKeys
    .filter(key => !['id', 'created_at', 'updated_at'].includes(key))
    .sort((a, b) => {
      // Sort by importance: name first, then location, then other fields
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
      {/* Summary Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Change Summary</h3>
            <p className="text-sm text-blue-700">
              Review the changes below. <span className="font-medium text-red-600">Red text</span> shows removed/changed values, 
              <span className="font-medium text-green-600"> green text</span> shows new/updated values.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{changedFields.length}</div>
            <div className="text-xs text-blue-600 uppercase tracking-wide">Fields Changed</div>
          </div>
        </div>
      </div>
      
      {/* Changed Fields */}
      {changedFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            🔄 Changed Fields ({changedFields.length})
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
                    Changed
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                      <span className="mr-2">❌</span>
                      Original Value
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
                      New Value
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
                    <span>Field updated from <span className="font-medium">"{formatValue(origVal, key)}"</span> to <span className="font-medium">"{formatValue(newVal, key)}"</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Unchanged Fields Summary */}
      {unchangedFields.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">📝</span>
            Unchanged Fields
          </h4>
          <p className="text-sm text-gray-600">
            {unchangedFields.length} fields remain unchanged in this update.
          </p>
          <details className="mt-3">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Click to view unchanged fields
            </summary>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {unchangedFields.slice(0, 12).map(key => (
                <span key={key} className="text-xs bg-white px-2 py-1 rounded border text-gray-600">
                  {getFieldDisplayName(key)}
                </span>
              ))}
              {unchangedFields.length > 12 && (
                <span className="text-xs bg-white px-2 py-1 rounded border text-gray-500">
                  +{unchangedFields.length - 12} more
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
        title: `Change ${variables.status}`,
        description: `Change has been ${variables.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["pendingChanges"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to review change.",
        variant: "destructive",
      });
    },
  });

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading pending approvals.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Pending Approvals</h1>
      {changes && changes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-4">
          <CheckCircle className="h-12 w-12 text-success" />
          <p className="text-lg font-medium">No pending approvals</p>
          <p className="text-sm">Everything is up to date. Great job!</p>
        </div>
      )}
      {changes && changes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Entry Type</TableHead>
              <TableHead>Entry ID</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
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
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Review Change #{change.id}</DialogTitle>
                        <DialogDescription className="text-base">
                          Compare previous and new data below. Approve or reject the change.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-y-auto mt-6 px-1">
                        {renderDiff(change)}
                      </div>
                      <DialogFooter className="mt-8 space-x-3">
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={() => mutation.mutate({ id: change.id, status: "rejected" })}
                          disabled={mutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => mutation.mutate({ id: change.id, status: "approved" })}
                          disabled={mutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
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