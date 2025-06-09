import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, MoreVertical, Pencil, Shield, Trash2, UserPlus, UserRoundCog, Users, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllUsers, createUser, updateUser, deleteUser, getUserRole, getUserById, ApiUser, UserInput, UserUpdateInput } from "@/apiClient/usersApi";
import { getAllRoles, Role } from "@/apiClient/roleApi";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Define user roles
export type UserRole = "admin" | "manager" | "editor" | "viewer";

// Define user data structure
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: number;
  assignedHotels: string[];
  status: "active" | "pending" | "inactive";
  dateAdded: string;
}

// Sample hotels for assignment
const availableHotels = [
  "Grand Hotel Berlin", 
  "Business Hotel Frankfurt", 
  "Luxury Resort Munich", 
  "Boutique Hotel Hamburg"
];

// Form schema for adding/editing users
const userFormSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6).optional().or(z.literal("")),
  roleId: z.string().optional(),
  assignedHotels: z.array(z.string()).optional(),
  status: z.enum(["active", "pending", "inactive"])
});

// Component for color-coded role badges
const RoleBadge = ({ role }: { role: string }) => {
  const roleStyles: Record<string, string> = {
    Admin: "bg-red-100 text-red-800 border-red-200",
    Manager: "bg-blue-100 text-blue-800 border-blue-200",
    Editor: "bg-green-100 text-green-800 border-green-200",
    Viewer: "bg-gray-100 text-gray-800 border-gray-200",
    Contributor: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const style = roleStyles[role] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge variant="outline" className={style}>
      {role}
    </Badge>
  );
};

// Convert API user to app user format
const apiToAppUser = (apiUser: ApiUser): User => ({
  id: apiUser.id.toString(),
  name: `${apiUser.first_name} ${apiUser.last_name}`,
  email: apiUser.email,
  role: apiUser.role?.name as UserRole || "viewer", // Use role if available
  roleId: apiUser.role?.id, // Store role ID
  assignedHotels: [], // Would need to be fetched from user-hotel assignments
  status: apiUser.status || "pending",
  dateAdded: new Date(apiUser.created_at).toISOString().split('T')[0]
});

// User Management component
interface UserManagementProps {
  mode?: 'list' | 'add' | 'edit';
}

const UserManagement = ({ mode = 'list' }: UserManagementProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      roleId: "",
      assignedHotels: [],
      status: "pending"
    }
  });

  // Fetch all users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const apiUsers = await getAllUsers();
      const formattedUsers = apiUsers.map(apiToAppUser);
      setUsers(formattedUsers);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for the role selector
  const fetchRoles = async () => {
    try {
      const roles = await getAllRoles();
      setRoles(roles);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      toast.error("Failed to load roles. Default roles may not be available.");
    }
  };

  // Load user data for edit mode
  const loadUserForEdit = async (userId: string) => {
    try {
      setLoading(true);
      // Get user details
      const user = await getUserById(userId);
      // Get user's role
      const { role } = await getUserRole(userId);
      
      const formattedUser = apiToAppUser(user);
      setEditingUser(formattedUser);
      
      // Parse first and last name from full name
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: "", // Don't set password when editing
        roleId: role ? role.id.toString() : "",
        assignedHotels: formattedUser.assignedHotels,
        status: user.status
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load user for editing:", err);
      toast.error("Failed to load user information. Redirecting to users list.");
      navigate("/users");
    }
  };

  // Initialize based on mode
  useEffect(() => {
    fetchRoles();
    
    if (mode === 'list') {
      fetchUsers();
    } else if (mode === 'edit' && id) {
      loadUserForEdit(id);
    } else if (mode === 'add') {
      resetForm();
    }
  }, [mode, id]);

  // Reset form when dialog opens/closes
  const resetForm = () => {
    form.reset({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      roleId: "",
      assignedHotels: [],
      status: "pending"
    });
    setEditingUser(null);
  };

  // Edit user action - navigates to edit page
  const handleEditUser = (user: User) => {
    navigate(`/users/edit/${user.id}`);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      if (mode === 'edit' && id) {
        // Update existing user
        const updateData: UserUpdateInput = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          status: data.status,
          roleId: data.roleId ? parseInt(data.roleId) : undefined
        };
        
        // Only include password if it was changed
        if (data.password) {
          updateData.password = data.password;
        }
        
        const result = await updateUser(id, updateData);
        
        if (result.success) {
          toast.success("User updated successfully");
          navigate("/users");
        }
      } else {
        // Add new user
        const userData: UserInput = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password || 'default123', // Provide a default password if none is given
          status: data.status,
          roleId: data.roleId ? parseInt(data.roleId) : undefined
        };
        
        const result = await createUser(userData);
        
        if (result.success) {
          toast.success("User added successfully");
          navigate("/users");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save user");
    }
  };

  // Delete a user
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast.success("User removed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  // Format assigned hotels for display
  const formatAssignedHotels = (hotels: string[]) => {
    if (hotels.includes("All Hotels")) return "All Hotels";
    if (hotels.length <= 2) return hotels.join(", ");
    return `${hotels.length} hotels`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // User Form for Add/Edit
  if (mode === 'add' || mode === 'edit') {
    return (
      <div className="space-y-6">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {mode === 'edit' ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'edit' 
              ? 'Update user details, role, and permissions' 
              : 'Create a new user and assign their role and permissions'}
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{mode === 'edit' ? 'Edit User' : 'Add User'}</CardTitle>
            <CardDescription>
              {mode === 'edit' 
                ? 'Update user details, role, and hotel assignments' 
                : 'Fill in the details to create a new user'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{mode === 'edit' ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={mode === 'edit' ? "••••••••" : "Enter password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              <div className="flex items-center">
                                {role.name === "Admin" && <Shield className="mr-2 h-4 w-4 text-red-600" />}
                                {role.name === "Editor" && <Pencil className="mr-2 h-4 w-4 text-green-600" />}
                                {role.name === "Contributor" && <UserRoundCog className="mr-2 h-4 w-4 text-yellow-600" />}
                                {role.name === "Viewer" && <Users className="mr-2 h-4 w-4 text-gray-600" />}
                                {role.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines what actions the user can perform in the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="status-active"
                            value="active"
                            checked={field.value === "active"}
                            onChange={() => field.onChange("active")}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <Label htmlFor="status-active" className="cursor-pointer">Active</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="status-pending"
                            value="pending"
                            checked={field.value === "pending"}
                            onChange={() => field.onChange("pending")}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <Label htmlFor="status-pending" className="cursor-pointer">Pending</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="status-inactive"
                            value="inactive"
                            checked={field.value === "inactive"}
                            onChange={() => field.onChange("inactive")}
                            className="form-radio h-4 w-4 text-primary"
                          />
                          <Label htmlFor="status-inactive" className="cursor-pointer">Inactive</Label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/users")}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {mode === 'edit' ? "Update User" : "Add User"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Users list (default view)
  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-1">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and hotel assignments
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Users</CardTitle>
            <CardDescription>Manage system users and their permissions</CardDescription>
          </div>
          <Button onClick={() => navigate("/users/add")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Hotels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found. Click "Add User" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="py-2 pr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>{formatAssignedHotels(user.assignedHotels)}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : user.status === "pending" ? "outline" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.dateAdded}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
