import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import FileBrowser from './FileBrowser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFileTypesByCategory } from '@/apiClient/filesApi';
import { getAllHotels } from '@/apiClient/hotelsApi';
import { getAllEvents } from '@/apiClient/eventsApi';
import { useTranslation } from 'react-i18next';

interface FileType {
  id: number;
  name: string;
  code: string;
  category: string;
  allowed_extensions: string[];
}

interface EntityOption {
  id: string;
  name: string;
}

export default function FileUploadDemo() {
  const { t } = useTranslation();
  const [entityType, setEntityType] = useState<string>('hotels');
  const [category, setCategory] = useState<string>('hotel');
  const [fileTypeCode, setFileTypeCode] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [filteredFileTypes, setFilteredFileTypes] = useState<FileType[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch file types when category changes
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        const response = await getFileTypesByCategory(category);
        setFileTypes(response);
        setFilteredFileTypes(response);
        
        // Set default file type if available
        if (response.length > 0 && !fileTypeCode) {
          setFileTypeCode(response[0].code);
        }
      } catch (error) {
      }
    };

    fetchFileTypes();
  }, [category]);

  // Fetch entities (hotels, events, etc.) when entity type changes
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        let options: EntityOption[] = [];
        
        switch (entityType) {
          case 'hotels':
            const hotels = await getAllHotels();
            options = hotels.map((hotel: any) => ({
              id: hotel.id.toString(),
              name: hotel.name || `${t('common.unnamedHotel')} ${hotel.id}`
            }));
            break;
          case 'events':
            const events = await getAllEvents();
            options = events.map((event: any) => ({
              id: event.id.toString(),
              name: event.name || `${t('events.title')} ${event.id}`
            }));
            break;
          default:
            // Default to hotels if unknown entity type
            const defaultHotels = await getAllHotels();
            options = defaultHotels.map((hotel: any) => ({
              id: hotel.id.toString(),
              name: hotel.name || `${t('common.unnamedHotel')} ${hotel.id}`
            }));
        }
        
        setEntities(options);
        
        // Set default entity if available
        if (options.length > 0 && !entityId) {
          setEntityId(options[0].id);
        }
      } catch (error) {
      }
    };

    fetchEntities();
  }, [entityType]);

  // Handle file upload success
  const handleUploadSuccess = () => {
    // Refresh the file browser by incrementing the trigger
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.files.upload.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div>
              <Label>{t('admin.files.upload.entityType')}</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.files.upload.selectEntityType') as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotels">{t('hotels.title')}</SelectItem>
                  <SelectItem value="events">{t('events.title')}</SelectItem>
                  <SelectItem value="rooms">{t('rooms.title')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('admin.files.upload.entity')}</Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.files.upload.selectEntity') as string} />
                </SelectTrigger>
                <SelectContent>
                  {entities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('admin.files.upload.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.files.upload.selectCategory') as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">{t('hotels.title')}</SelectItem>
                  <SelectItem value="event">{t('events.title')}</SelectItem>
                  <SelectItem value="room">{t('rooms.title')}</SelectItem>
                  <SelectItem value="fb">{t('foodBeverage.title', 'Food & Beverage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('admin.files.upload.fileType')}</Label>
              <Select value={fileTypeCode} onValueChange={setFileTypeCode}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.files.upload.selectFileType') as string} />
                </SelectTrigger>
                <SelectContent>
                  {filteredFileTypes.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('admin.files.upload.uploadFile')}</h3>
              {entityId && (
                <FileUpload
                  entityType={entityType}
                  entityId={entityId}
                  category={category}
                  onSuccess={handleUploadSuccess}
                />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('admin.files.upload.files')}</h3>
              {entityId && (
                <FileBrowser
                  entityType={entityType}
                  entityId={entityId}
                  category={category}
                  onFileDelete={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 