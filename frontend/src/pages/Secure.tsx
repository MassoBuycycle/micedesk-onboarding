import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllHotels, Hotel } from '@/apiClient/hotelsApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import HotelSecureData from '@/components/HotelSecureData';
import { useTranslation } from 'react-i18next';

const Secure: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: getAllHotels,
  });

  const handleSelect = (id: string) => {
    const hotel = hotels.find((h) => h.id?.toString() === id);
    setSelectedHotel(hotel || null);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}> 
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('securePage.backToDashboard')}
      </Button>

      <Card className="max-w-xl mb-8">
        <CardHeader>
          <CardTitle>{t('securePage.selectHotelTitle')}</CardTitle>
          <CardDescription>{t('securePage.selectHotelDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t('securePage.selectHotelPlaceholder') as string} />
            </SelectTrigger>
            <SelectContent>
              {hotels.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id!.toString()}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedHotel && (
        <HotelSecureData hotelId={selectedHotel.id!} hotelName={selectedHotel.name || ''} />
      )}
    </div>
  );
};

export default Secure;
