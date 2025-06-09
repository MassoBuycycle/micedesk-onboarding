
import { UserRole } from "@/pages/UserManagement";

// Helper function to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Helper function to get avatar background color based on role
export const getAvatarColorClass = (role: UserRole): string => {
  switch (role) {
    case "admin": return "bg-red-100";
    case "manager": return "bg-blue-100";
    case "editor": return "bg-green-100";
    case "viewer": return "bg-gray-100";
    default: return "bg-gray-100";
  }
};

// Helper function to get role badge color
export const getRoleBadgeClass = (role: UserRole): string => {
  switch (role) {
    case "admin": return "bg-red-100 text-red-800";
    case "manager": return "bg-blue-100 text-blue-800";
    case "editor": return "bg-green-100 text-green-800";
    case "viewer": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
