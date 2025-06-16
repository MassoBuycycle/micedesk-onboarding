import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Hotel } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  hotelId?: number | string;
  hotelName?: string;
  redirectDelay?: number; // in seconds
  showViewButton?: boolean;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onOpenChange,
  title = "Hotel Successfully Added!",
  description = "All information has been saved successfully.",
  hotelId,
  hotelName,
  redirectDelay = 3,
  showViewButton = true,
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(redirectDelay);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open && hotelId) {
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect to view hotel page
            navigate(`/view/hotel/${hotelId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Update progress bar
      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + (100 / (redirectDelay * 10));
        });
      }, 100);

      return () => {
        clearInterval(timer);
        clearInterval(progressTimer);
      };
    }
  }, [open, hotelId, redirectDelay, navigate]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setCountdown(redirectDelay);
      setProgress(0);
    }
  }, [open, redirectDelay]);

  const handleViewNow = () => {
    if (hotelId) {
      navigate(`/view/hotel/${hotelId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {hotelName && (
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <Hotel className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Hotel Name</p>
                <p className="font-semibold">{hotelName}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Redirecting to hotel view...</span>
              <span className="font-medium">{countdown}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {showViewButton && hotelId && (
            <Button 
              onClick={handleViewNow} 
              className="w-full"
              size="lg"
            >
              View Hotel Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog; 