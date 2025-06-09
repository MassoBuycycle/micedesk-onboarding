import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from 'lucide-react';
import AnnouncementsBanner from '@/components/AnnouncementsBanner';
import { useQuery } from '@tanstack/react-query';
import { getAllHotels, Hotel } from '@/apiClient/hotelsApi';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getPendingChanges } from '@/apiClient/approvalApi';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: getAllHotels,
  });

  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => getPendingChanges('pending'),
  });

  const pendingCount = pendingApprovals.length;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">{t("pages.index.title")}</h1>
        <p className="text-muted-foreground">
          {t("pages.index.subtitle")}
        </p>
      </header>

      {/* Special Announcements */}
      <AnnouncementsBanner />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="cursor-pointer" onClick={()=>navigate('/view')}>
          <CardHeader>
            <CardTitle>{t("pages.index.hotels")}</CardTitle>
            <CardDescription>{t("pages.index.hotelsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{hotels.length}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={()=>navigate('/admin/approvals')}>
          <CardHeader>
            <CardTitle>{t("pages.index.pendingApprovals")}</CardTitle>
            <CardDescription>{t("pages.index.pendingApprovalsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <AlertOctagon className="h-6 w-6 text-destructive"/>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick hotel overview */}
      {hotels.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("pages.index.hotelsOverview")}</CardTitle>
            <CardDescription>{t("pages.index.hotelsOverviewDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4"></th>
                  <th className="py-2 pr-4">{t("common.name")}</th>
                  <th className="py-2 pr-4">{t("hotel.city")}</th>
                  <th className="py-2">{t("pages.index.rooms")}</th>
                </tr>
              </thead>
              <tbody>
                {hotels.slice(0, 8).map(h => (
                  <tr key={h.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{h.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="py-2 pr-4">
                      <button className="text-primary hover:underline" onClick={()=>navigate(`/view/hotel/${h.id}`)}>{h.name}</button>
                    </td>
                    <td className="py-2 pr-4">{h.city || '—'}</td>
                    <td className="py-2 pr-4">{h.total_rooms ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
