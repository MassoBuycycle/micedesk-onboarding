import { CalendarCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EventsInfoPreviewProps {
  eventsInfo: any;
}

const EventsInfoPreview = ({ eventsInfo }: EventsInfoPreviewProps) => {
  const { t } = useTranslation();
  
  // Helper function to handle boolean display
  const formatBooleanValue = (value: any): string => {
    // Handle numeric 1/0 as well as boolean true/false
    if (value === 1 || value === true || value === "1" || value === "true") {
      return t('common.yes');
    } else if (value === 0 || value === false || value === "0" || value === "false") {
      return t('common.no');
    }
    return String(value);
  };
  
  // Return null to hide this section completely
  return null;
};

export default EventsInfoPreview;
