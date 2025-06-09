import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import UserAssignmentSelect from "@/components/user/UserAssignmentSelect";
import { assignUserToHotel } from "@/apiClient/userHotelsApi";
import { toast } from "sonner";

interface UserAssignmentDialogProps {
  hotelId: string | number;
  hotelName: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  onAssignmentUpdate?: () => void;
}

const UserAssignmentDialog: React.FC<UserAssignmentDialogProps> = ({
  hotelId,
  hotelName,
  buttonVariant = "ghost",
  buttonSize = "icon",
  onAssignmentUpdate,
}) => {
  const handleAssignUser = async (userId: string, hotelId: string) => {
    try {
      await assignUserToHotel({
        userId,
        hotelId
      });
      
      // If a callback was provided for refreshing data in the parent component
      if (onAssignmentUpdate) {
        onAssignmentUpdate();
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      toast.error("Failed to assign user. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} title="Assign users">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Users to {hotelName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <UserAssignmentSelect
            hotelId={String(hotelId)}
            hotelName={hotelName}
            onAssignUser={handleAssignUser}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserAssignmentDialog;
