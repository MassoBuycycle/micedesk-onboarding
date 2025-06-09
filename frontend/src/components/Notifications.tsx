import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getActiveAnnouncements, Announcement } from '@/apiClient/announcementsApi';
import { getPendingChanges, PendingChange } from '@/apiClient/approvalApi';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Notifications: React.FC = () => {
  // Announcements
  const { data: announcements = [], isLoading: loadingAnn } = useQuery<Announcement[]>({
    queryKey: ['announcements', 'active'],
    queryFn: getActiveAnnouncements,
    staleTime: 60 * 1000,
  });

  // Pending approvals (only count length)
  const { data: pending = [], isLoading: loadingPend } = useQuery<PendingChange[]>({
    queryKey: ['pendingChanges', 'header'],
    queryFn: () => getPendingChanges('pending'),
    staleTime: 60 * 1000,
  });

  const newCount = (announcements?.length || 0) + (pending?.length || 0);

  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          {newCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 inline-block h-2 w-2 rounded-full bg-red-500"
              aria-label={`${newCount} new notifications`}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        {(loadingAnn || loadingPend) && (
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        )}
        {!loadingAnn && announcements.length === 0 && !loadingPend && pending.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No new notifications</div>
        )}
        {announcements.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs uppercase opacity-70">Announcements</DropdownMenuLabel>
            {announcements.map((a) => (
              <DropdownMenuItem key={a.id} className="space-x-2">
                <AlertCircle className="h-4 w-4 text-info" />
                <span className="text-sm line-clamp-2">{a.message}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        {pending.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs uppercase opacity-70">Pending Approvals</DropdownMenuLabel>
            {pending.slice(0, 5).map((p) => (
              <Link key={p.id} to="/admin/approvals">
                <DropdownMenuItem className="space-x-2 cursor-pointer">
                  <CheckCircle className="h-4 w-4 text-warning" />
                  <span className="text-sm">Change #{p.id} awaiting review</span>
                </DropdownMenuItem>
              </Link>
            ))}
            {pending.length > 5 && (
              <Link to="/admin/approvals">
                <DropdownMenuItem className={cn('text-primary', 'cursor-pointer')}>View all approvals…</DropdownMenuItem>
              </Link>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications; 