import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getResourcePermissionUsers,
  setResourcePermission,
  removeResourcePermission,
  UserPermissionInfo
} from '@/apiClient/permissionsApi';
import { getAllUsers } from '@/apiClient/usersApi';
import { ApiUser } from '@/apiClient/usersApi';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash, Edit } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HotelPermissionsProps {
  hotelId: number;
  hotelName: string;
}

type PermissionType = 'view' | 'edit' | 'manage';

const HotelPermissions: React.FC<HotelPermissionsProps> = ({ hotelId, hotelName }) => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<PermissionType>('view');
  const [editMode, setEditMode] = useState(false);
  const [currentUserPermission, setCurrentUserPermission] = useState<UserPermissionInfo | null>(null);
  
  // Fetch users with permissions for this hotel
  const { 
    data: userPermissions = [], 
    isLoading: loadingPermissions,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['hotelPermissions', hotelId],
    queryFn: () => getResourcePermissionUsers('hotel', hotelId),
  });
  
  // Fetch all users
  const { 
    data: users = [], 
    isLoading: loadingUsers 
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
  
  // Filter out users who already have permissions
  const availableUsers = users.filter(user => 
    !userPermissions.some(up => up.user_id === user.id)
  );
  
  // Set permission mutation
  const setPermissionMutation = useMutation({
    mutationFn: (data: { userId: number, permissionType: PermissionType }) => 
      setResourcePermission(
        data.userId,
        'hotel',
        hotelId,
        data.permissionType
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelPermissions', hotelId] });
      resetForm();
      toast({
        title: 'Permission updated',
        description: 'User permission has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update permission',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Remove permission mutation
  const removePermissionMutation = useMutation({
    mutationFn: (userId: number) => removeResourcePermission(userId, 'hotel', hotelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelPermissions', hotelId] });
      toast({
        title: 'Permission removed',
        description: 'User permission has been removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove permission',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Reset form state
  const resetForm = () => {
    setDialogOpen(false);
    setSelectedUser('');
    setSelectedPermission('view');
    setEditMode(false);
    setCurrentUserPermission(null);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode && currentUserPermission) {
      // Update existing permission
      setPermissionMutation.mutate({
        userId: currentUserPermission.user_id,
        permissionType: selectedPermission
      });
    } else if (selectedUser) {
      // Create new permission
      setPermissionMutation.mutate({
        userId: parseInt(selectedUser),
        permissionType: selectedPermission
      });
    } else {
      toast({
        title: 'Validation error',
        description: 'Please select a user',
        variant: 'destructive',
      });
    }
  };
  
  // Handle edit click
  const handleEditPermission = (permission: UserPermissionInfo) => {
    setEditMode(true);
    setCurrentUserPermission(permission);
    setSelectedPermission(permission.permission_type as PermissionType);
    setDialogOpen(true);
  };
  
  // Handle delete click
  const handleRemovePermission = (permission: UserPermissionInfo) => {
    if (window.confirm(`Are you sure you want to remove ${permission.first_name} ${permission.last_name}'s access to this hotel?`)) {
      removePermissionMutation.mutate(permission.user_id);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Access Permissions</CardTitle>
        <CardDescription>
          Manage user access to {hotelName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => { setEditMode(false); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User Access
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permission Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No users have been granted access to this hotel
                  </TableCell>
                </TableRow>
              ) : (
                userPermissions.map(permission => (
                  <TableRow key={permission.user_id}>
                    <TableCell className="py-2 pr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{permission.first_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {permission.first_name} {permission.last_name}
                    </TableCell>
                    <TableCell>{permission.email}</TableCell>
                    <TableCell>
                      <span className={
                        permission.permission_type === 'manage' 
                          ? 'text-green-600 font-medium' 
                          : permission.permission_type === 'edit'
                            ? 'text-blue-600'
                            : ''
                      }>
                        {permission.permission_type === 'view' && 'View Only'}
                        {permission.permission_type === 'edit' && 'Can Edit'}
                        {permission.permission_type === 'manage' && 'Full Access'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditPermission(permission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemovePermission(permission)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMode ? 'Edit User Access' : 'Add User Access'}
              </DialogTitle>
              <DialogDescription>
                {editMode 
                  ? `Update permission level for ${currentUserPermission?.first_name} ${currentUserPermission?.last_name}`
                  : `Grant a user access to ${hotelName}`
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {!editMode && (
                  <div className="space-y-2">
                    <Label htmlFor="user">Select User</Label>
                    <Select 
                      value={selectedUser} 
                      onValueChange={setSelectedUser}
                    >
                      <SelectTrigger id="user">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.first_name} {user.last_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Permission Level</Label>
                  <RadioGroup 
                    value={selectedPermission} 
                    onValueChange={(value) => setSelectedPermission(value as PermissionType)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="view" id="view" />
                      <Label htmlFor="view">View Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="edit" id="edit" />
                      <Label htmlFor="edit">Can Edit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manage" id="manage" />
                      <Label htmlFor="manage">Full Access</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={setPermissionMutation.isPending}
                >
                  {setPermissionMutation.isPending 
                    ? 'Saving...' 
                    : editMode ? 'Update Access' : 'Grant Access'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HotelPermissions; 