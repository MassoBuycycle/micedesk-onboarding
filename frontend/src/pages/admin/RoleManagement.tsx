import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getPermissions, 
  getRolePermissions, 
  assignPermissionsToRole,
  Role,
  Permission
} from '@/apiClient/permissionsApi';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Edit, Trash, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const RoleManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  // Fetch roles
  const { 
    data: roles = [], 
    isLoading: rolesLoading, 
    error: rolesError 
  } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles
  });
  
  // Fetch permissions
  const { 
    data: permissionsData, 
    isLoading: permissionsLoading 
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions
  });
  
  // Fetch permissions for the selected role
  const { 
    data: rolePermissions = [], 
    refetch: refetchRolePermissions 
  } = useQuery({
    queryKey: ['rolePermissions', selectedRoleId],
    queryFn: () => getRolePermissions(selectedRoleId!),
    enabled: !!selectedRoleId
  });
  
  // Set up mutations
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      resetForm();
      toast({
        title: 'Role created',
        description: 'The role was created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create role',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { name: string, description?: string } }) => 
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      resetForm();
      toast({
        title: 'Role updated',
        description: 'The role was updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: 'Role deleted',
        description: 'The role was deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete role',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const assignPermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number, permissionIds: number[] }) => 
      assignPermissionsToRole(roleId, permissionIds),
    onSuccess: () => {
      refetchRolePermissions();
      toast({
        title: 'Permissions updated',
        description: 'The role permissions were updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update permissions',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Update selected permissions when role changes or role permissions are loaded
  useEffect(() => {
    if (rolePermissions && rolePermissions.length > 0) {
      setSelectedPermissions(rolePermissions.map(p => p.id));
    } else {
      setSelectedPermissions([]);
    }
  }, [rolePermissions]);
  
  // Handle role selection for permission editing
  const handleRoleSelect = (role: Role) => {
    setSelectedRoleId(role.id);
  };
  
  // Reset form state
  const resetForm = () => {
    setDialogOpen(false);
    setEditMode(false);
    setCurrentRole(null);
    setRoleName('');
    setRoleDescription('');
  };
  
  // Handle opening the edit form
  const handleEditClick = (role: Role) => {
    setEditMode(true);
    setCurrentRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      toast({
        title: 'Validation error',
        description: 'Role name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (editMode && currentRole) {
      updateRoleMutation.mutate({
        id: currentRole.id,
        data: {
          name: roleName,
          description: roleDescription
        }
      });
    } else {
      createRoleMutation.mutate({
        name: roleName,
        description: roleDescription
      });
    }
  };
  
  // Handle role deletion
  const handleDelete = (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };
  
  // Handle permission checkbox toggle
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };
  
  // Handle saving permissions
  const handleSavePermissions = () => {
    if (selectedRoleId) {
      assignPermissionsMutation.mutate({
        roleId: selectedRoleId,
        permissionIds: selectedPermissions
      });
    }
  };
  
  // Select all permissions in a category
  const selectAllInCategory = (categoryPermissions: Permission[]) => {
    const permissionIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.id));
    
    if (allSelected) {
      // If all are selected, deselect all
      setSelectedPermissions(prev => prev.filter(id => !permissionIds.includes(id)));
    } else {
      // If some or none are selected, select all
      setSelectedPermissions(prev => {
        const filtered = prev.filter(id => !permissionIds.includes(id));
        return [...filtered, ...permissionIds];
      });
    }
  };
  
  if (rolesLoading) {
    return <div className="flex justify-center p-8">Loading roles...</div>;
  }
  
  if (rolesError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {(rolesError as Error).message || 'Failed to load roles'}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Button onClick={() => { setEditMode(false); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>
      
      <Tabs defaultValue="roles">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>
                Manage roles that define permissions for users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>{role.is_system ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEditClick(role)}
                            disabled={role.is_system}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDelete(role)}
                            disabled={role.is_system}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>
                  Select a role to edit its permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roles.map(role => (
                    <Button
                      key={role.id}
                      variant={selectedRoleId === role.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleRoleSelect(role)}
                    >
                      {role.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  {selectedRoleId 
                    ? `Manage permissions for ${roles.find(r => r.id === selectedRoleId)?.name}`
                    : 'Select a role to manage its permissions'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedRoleId ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Select a role from the left panel to edit its permissions
                  </div>
                ) : permissionsLoading ? (
                  <div className="text-center py-6">Loading permissions...</div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {permissionsData?.categories.map(category => {
                        const categoryPermissions = permissionsData.permissionsByCategory[category] || [];
                        const allSelected = categoryPermissions.every(p => 
                          selectedPermissions.includes(p.id)
                        );
                        const someSelected = categoryPermissions.some(p => 
                          selectedPermissions.includes(p.id)
                        );
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category}`}
                                checked={allSelected}
                                data-state={!allSelected && someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                                onCheckedChange={() => selectAllInCategory(categoryPermissions)}
                              />
                              <Label 
                                htmlFor={`category-${category}`}
                                className="text-lg font-semibold capitalize"
                              >
                                {category}
                              </Label>
                            </div>
                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {categoryPermissions.map(permission => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <Label 
                                    htmlFor={`permission-${permission.id}`}
                                    className="text-sm"
                                  >
                                    {permission.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSavePermissions} 
                  disabled={!selectedRoleId || assignPermissionsMutation.isPending}
                >
                  {assignPermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create/Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update the details for this role' 
                : 'Create a new role to assign to users'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="Enter role name"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter role description"
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoleMutation.isPending || updateRoleMutation.isPending}>
                {createRoleMutation.isPending || updateRoleMutation.isPending
                  ? 'Saving...'
                  : editMode ? 'Update' : 'Create'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement; 