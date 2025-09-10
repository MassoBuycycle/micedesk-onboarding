import { useQuery } from '@tanstack/react-query';
import { getHotelAnnouncement, Announcement } from '@/apiClient/announcementsApi';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props { hotelId: number; }

const HotelAnnouncementBanner: React.FC<Props> = ({ hotelId }) => {
  const { data } = useQuery<Announcement | null>({
    queryKey: ['announcement', hotelId],
    queryFn: () => getHotelAnnouncement(hotelId),
    enabled: !!hotelId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  if (!data) return null;

  return (
    <Card className="mb-4 border-green-500 bg-green-50">
      <CardContent className="py-3 flex items-start gap-2 text-sm text-green-900">
        <AlertCircle className="h-4 w-4 mt-0.5 text-green-700" />
        <span>{data.message}</span>
      </CardContent>
    </Card>
  );
};

export default HotelAnnouncementBanner; 