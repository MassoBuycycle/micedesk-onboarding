
import React from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, UserRole } from "@/pages/UserManagement";
import { getInitials, getAvatarColorClass } from "@/lib/userUtils";

interface UserAvatarGroupProps {
  users: User[];
  limit?: number;
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({ 
  users, 
  limit = 4 
}) => {
  // Sort users by role priority (admin -> manager -> editor -> viewer)
  const sortedUsers = [...users].sort((a, b) => {
    const rolePriority = { admin: 0, manager: 1, editor: 2, viewer: 3 };
    return rolePriority[a.role as UserRole] - rolePriority[b.role as UserRole];
  });

  const displayUsers = sortedUsers.slice(0, limit);
  const remainingCount = sortedUsers.length - limit;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {displayUsers.map((user) => (
        <TooltipProvider key={user.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className={getAvatarColorClass(user.role)}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{remainingCount} more {remainingCount === 1 ? 'user' : 'users'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default UserAvatarGroup;
