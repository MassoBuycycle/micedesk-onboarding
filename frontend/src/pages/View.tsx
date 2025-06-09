import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Users } from "lucide-react";
import HotelList from "@/components/lists/HotelList";
import { Card, CardDescription } from "@/components/ui/card";

const View = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("pages.view.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("pages.view.subtitle")}
        </p>
      </header>

      <Card className="mb-6 p-4 bg-muted/40">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{t("pages.view.userAssignment")}</h3>
            <CardDescription>
              {t("pages.view.userAssignmentDescription")}
            </CardDescription>
          </div>
        </div>
      </Card>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t("pages.view.searchPlaceholder")}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <HotelList searchQuery={searchQuery} />
    </div>
  );
};

export default View;
