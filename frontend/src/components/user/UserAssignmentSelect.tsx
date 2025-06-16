import React, { useState, useEffect, useRef } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, CheckCircle2, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { User, UserRole } from "@/pages/UserManagement";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getAvatarColorClass, getRoleBadgeClass } from "@/lib/userUtils";
import { 
  getUsersByHotelId, 
  assignUserToHotel, 
  unassignUserFromHotel, 
  UserWithAssignmentInfo 
} from "@/apiClient/userHotelsApi";
import { getAllUsers } from "@/apiClient/usersApi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserAssignmentSelectProps {
  hotelId: string;
  hotelName: string;
  onAssignUser?: (userId: string, hotelId: string) => void;
}

// Mock users data as a fallback - in a real app, this would come from your context or API
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@example.com",
    role: "admin",
    assignedHotels: ["All Hotels"],
    status: "active",
    dateAdded: "2023-04-15"
  },
  {
    id: "2",
    name: "Maria Manager",
    email: "manager@example.com",
    role: "manager",
    assignedHotels: ["Grand Hotel Berlin", "Business Hotel Frankfurt"],
    status: "active",
    dateAdded: "2023-05-20"
  },
  {
    id: "3",
    name: "Ed Editor",
    email: "editor@example.com",
    role: "editor",
    assignedHotels: ["Grand Hotel Berlin"],
    status: "active",
    dateAdded: "2023-06-10"
  },
  {
    id: "4",
    name: "Vince Viewer",
    email: "viewer@example.com",
    role: "viewer",
    assignedHotels: ["Business Hotel Frankfurt"],
    status: "pending",
    dateAdded: "2023-07-05"
  }
];

// Helper to convert API user format to our User format
const convertApiUserToUser = (apiUser: UserWithAssignmentInfo): User => {
  return {
    id: apiUser.id.toString(),
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    email: apiUser.email,
    role: "viewer" as UserRole, // Default role, would come from API in a real app
    assignedHotels: apiUser.has_all_access ? ["All Hotels"] : [],
    status: "active",
    dateAdded: new Date(apiUser.created_at).toISOString().split('T')[0]
  };
};

const UserAssignmentSelect = ({ hotelId, hotelName, onAssignUser }: UserAssignmentSelectProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const prevHotelIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch data if hotelId is "preview" or invalid
      if (!hotelId || hotelId === "preview") {
        setLoading(false);
        return;
      }
      
      // Don't fetch if we're already fetching or if the hotel ID hasn't changed
      if (isFetchingRef.current || hotelId === prevHotelIdRef.current) {
        return;
      }
      
      try {
        isFetchingRef.current = true;
        setLoading(true);
        // Fetch users assigned to this hotel
        const hotelUsers = await getUsersByHotelId(hotelId);
        const convertedAssignedUsers = hotelUsers.map(convertApiUserToUser);
        setAssignedUsers(convertedAssignedUsers);
        
        // Fetch all users to determine which ones are available for assignment
        const allUsers = await getAllUsers();
        // Convert API users to our User format
        const convertedAllUsers = allUsers.map(user => ({
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: "viewer" as UserRole, // Default role, would come from API in a real app
          assignedHotels: [],
          status: "active" as "active" | "pending" | "inactive",
          dateAdded: new Date(user.created_at).toISOString().split('T')[0]
        }));
        
        // Filter out users who are already assigned
        const assignedUserIds = new Set(convertedAssignedUsers.map(u => u.id));
        const availableForAssignment = convertedAllUsers.filter(
          user => !assignedUserIds.has(user.id) && user.status === "active"
        );
        
        setAvailableUsers(availableForAssignment);
        setError(null);
        prevHotelIdRef.current = hotelId;
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Using mock data as fallback.");
        // Use mock data as fallback
        const mockAssignedUsers = mockUsers.filter(user => 
          user.assignedHotels.includes(hotelName) || 
          user.assignedHotels.includes("All Hotels")
        );
        setAssignedUsers(mockAssignedUsers);
        
        const mockAvailableUsers = mockUsers.filter(
          user => !mockAssignedUsers.some(assigned => assigned.id === user.id) && 
                 user.status === "active"
        );
        setAvailableUsers(mockAvailableUsers);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };
    
    fetchData();
  }, [hotelId, hotelName]);

  // Capture trigger width whenever popover opens
  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssignUsers = async () => {
    if (selectedUserIds.length === 0) return;
    
    let successCount = 0;
    let errorCount = 0;
    
    // Create a copy of the selected users to update the UI
    const usersToAssign = availableUsers.filter(user => selectedUserIds.includes(user.id));
    
    // Track assigned users to update the UI
    const newlyAssignedUsers: User[] = [];
    
    for (const userId of selectedUserIds) {
      try {
        // Call API to assign user to hotel
        await assignUserToHotel({
          userId,
          hotelId
        });
        
        // Track the user for UI update
        const userToAssign = availableUsers.find(user => user.id === userId);
        if (userToAssign) {
          newlyAssignedUsers.push(userToAssign);
        }
        
        // Call the callback if provided
        if (onAssignUser) {
          onAssignUser(userId, hotelId);
        }
        
        successCount++;
      } catch (err) {
        console.error(`Error assigning user ${userId}:`, err);
        errorCount++;
      }
    }
    
    // Update the state with all successfully assigned users
    setAssignedUsers(prev => [...prev, ...newlyAssignedUsers]);
    
    // Remove assigned users from available users
    const successfullyAssignedIds = new Set(newlyAssignedUsers.map(u => u.id));
    setAvailableUsers(prev => prev.filter(user => !successfullyAssignedIds.has(user.id)));
    
    // Reset selection
    setSelectedUserIds([]);
    setOpen(false);
    
    // Show appropriate toast message
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} user${successCount !== 1 ? 's' : ''} assigned to ${hotelName}`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} user${successCount !== 1 ? 's' : ''} assigned, but ${errorCount} failed`);
    } else {
      toast.error("Failed to assign users. Please try again.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    const userToRemove = assignedUsers.find(user => user.id === userId);
    if (!userToRemove) return;
    
    // Don't allow removing users with "All Hotels" access
    if (userToRemove.assignedHotels.includes("All Hotels")) {
      toast.error(`${userToRemove.name} has access to all hotels and cannot be removed specifically from ${hotelName}`);
      return;
    }
    
    try {
      // Call API to unassign user from hotel
      await unassignUserFromHotel(userId, hotelId);
      
      // Update state
      setAssignedUsers(prev => prev.filter(user => user.id !== userId));
      setAvailableUsers(prev => [...prev, userToRemove]);
      
      toast.success(`${userToRemove.name} has been removed from ${hotelName}`);
    } catch (err) {
      console.error("Error removing user:", err);
      toast.error("Failed to remove user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading users...</span>
      </div>
    );
  }

  // Show warning if using mock data due to error
  useEffect(() => {
    if (error) {
      toast.warning(error, { duration: 5000, id: "user-data-error" });
    }
  }, [error]);

  return (
    <div className="space-y-4">
      {/* Select Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUserIds.length > 0
              ? `${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} selected`
              : "Select users to assign"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
         <PopoverContent
           align="center"
           sideOffset={4}
           style={{ width: triggerWidth || '100%' }}
           className="max-h-64 overflow-auto p-0"
         >
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandList>
                <ScrollArea className="h-[200px]">
                  <CommandGroup>
                    {availableUsers.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No more users available to assign
                      </p>
                    ) : (
                      availableUsers.map(user => (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() => handleToggleUser(user.id)}
                          className="flex items-center gap-2 px-2 py-1.5"
                        >
                          <div className="flex items-center gap-2 flex-grow">
                            <Checkbox 
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={() => handleToggleUser(user.id)}
                              className="mr-1"
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={getAvatarColorClass(user.role)}>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Action bar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleAssignUsers} 
            disabled={selectedUserIds.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Users
          </Button>
        </div>
      

      {assignedUsers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assigned Users
          </h4>
          <div className="grid gap-2">
            {assignedUsers.map(user => (
              <div 
                key={user.id} 
                className="flex items-center justify-between bg-background border rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={getAvatarColorClass(user.role)}>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                      {user.assignedHotels.includes("All Hotels") && (
                        <span className="flex items-center text-xs text-muted-foreground gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          All hotels access
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!user.assignedHotels.includes("All Hotels") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveUser(user.id)}
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAssignmentSelect;
