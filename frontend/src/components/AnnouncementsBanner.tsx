import { useQuery } from '@tanstack/react-query';
import { getActiveAnnouncements, Announcement } from '@/apiClient/announcementsApi';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AnnouncementsBanner: React.FC = () => {
  const { data = [] } = useQuery<Announcement[]>({
    queryKey: ['announcements', 'active'],
    queryFn: getActiveAnnouncements,
  });

  if (data.length === 0) return null;

  return (
    <Card className="mb-6 border-green-500 bg-green-50">
      <CardContent className="py-4">
        {data.map((a) => (
          <Link
            to={`/view/hotel/${a.hotel_id}`}
            key={a.id}
            className="flex items-start gap-3 text-sm text-green-900 mb-1 last:mb-0 hover:underline"
          >
            <Avatar className="h-6 w-6 mt-0.5">
              {a.image_url ? (
                <AvatarImage src={a.image_url} />
              ) : (
                <AvatarFallback>{a.hotel_name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p><strong>{a.hotel_name}:</strong> {a.message}</p>
              {a.assignee && <p className="text-xs text-muted-foreground">Assigned to {a.assignee}</p>}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsBanner; 