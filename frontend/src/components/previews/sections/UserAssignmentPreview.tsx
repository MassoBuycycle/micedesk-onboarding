
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import UserAssignmentSelect from "@/components/user/UserAssignmentSelect";
import { UserCog } from "lucide-react";

interface UserAssignmentPreviewProps {
  hotelId: string;
  hotelName: string;
}

const UserAssignmentPreview = ({ hotelId, hotelName }: UserAssignmentPreviewProps) => {
  const handleAssignUser = (userId: string, hotelId: string) => {
    // In a real app, you would make an API call here
    // You might also want to implement the approval workflow here
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          User Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserAssignmentSelect 
          hotelId={hotelId} 
          hotelName={hotelName} 
          onAssignUser={handleAssignUser} 
        />
      </CardContent>
    </Card>
  );
};

export default UserAssignmentPreview;
