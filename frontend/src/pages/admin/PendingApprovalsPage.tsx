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

// Recursively render diff for nested objects/arrays
const renderValue = (val: any) => {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
};

const renderDiff = (change: PendingChange) => {
  console.log('Rendering diff for change:', change);
  console.log('Original data:', change.original_data);
  console.log('Change data:', change.change_data);
  
  // Handle cases where data might be null, undefined, or invalid
  let original: any = {};
  let updated: any = {};
  
  try {
    if (change.original_data && typeof change.original_data === 'string') {
      original = JSON.parse(change.original_data);
    } else if (change.original_data && typeof change.original_data === 'object') {
      original = change.original_data;
    }
  } catch (e) {
    console.error('Error parsing original_data:', e);
    original = {};
  }
  
  try {
    if (change.change_data && typeof change.change_data === 'string') {
      updated = JSON.parse(change.change_data);
    } else if (change.change_data && typeof change.change_data === 'object') {
      updated = change.change_data;
    }
  } catch (e) {
    console.error('Error parsing change_data:', e);
    updated = {};
  }

  console.log('Parsed original:', original);
  console.log('Parsed updated:', updated);

  const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(updated)]));
  console.log('All keys:', allKeys);

  const renderRows = (keys: string[], parentKey = '') => {
    return keys.map(key => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const origVal = original && fullKey.split('.').reduce((o,k)=>o?.[k], original);
      const newVal = updated && fullKey.split('.').reduce((o,k)=>o?.[k], updated);

      if (typeof origVal === 'object' || typeof newVal === 'object') {
        const nestedKeys = Array.from(new Set([...Object.keys(origVal||{}), ...Object.keys(newVal||{})]));
        return (
          <div key={fullKey} className="mb-2">
            <p className="font-medium underline mb-1 capitalize">{fullKey}</p>
            {renderRows(nestedKeys, fullKey)}
          </div>
        );
      }
      return (
        <div key={fullKey} className="grid grid-cols-2 gap-4 text-sm mb-2 p-2 border rounded">
          <div className="text-center">
            <div className="font-medium text-xs text-gray-500 mb-1">Original</div>
            <span className={origVal!==newVal? 'text-red-600 font-medium':''}>{renderValue(origVal)}</span>
          </div>
          <div className="text-center">
            <div className="font-medium text-xs text-gray-500 mb-1">Updated</div>
            <span className={origVal!==newVal? 'text-green-600 font-medium':''}>{renderValue(newVal)}</span>
          </div>
          <div className="col-span-2 text-center mt-2">
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              Field: {fullKey}
            </span>
          </div>
        </div>
      );
    });
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

  return (
    <div className="text-sm">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-800 mb-2">Data Comparison</p>
        <p className="text-xs text-blue-600">
          Showing changes between original and updated data. 
          Red text indicates removed/changed values, green text indicates new/updated values.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center font-medium text-red-600">Original Data</div>
        <div className="text-center font-medium text-green-600">Updated Data</div>
      </div>
      {renderRows(allKeys)}
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
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Review Change #{change.id}</DialogTitle>
                        <DialogDescription>
                          Compare previous and new data below. Approve or reject the change.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-y-auto mt-4">
                        {renderDiff(change)}
                      </div>
                      <DialogFooter className="mt-6 space-x-2">
                        <Button
                          variant="destructive"
                          onClick={() => mutation.mutate({ id: change.id, status: "rejected" })}
                          disabled={mutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => mutation.mutate({ id: change.id, status: "approved" })}
                          disabled={mutation.isPending}
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