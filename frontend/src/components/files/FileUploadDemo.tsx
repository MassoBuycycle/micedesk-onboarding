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
              name: hotel.name || `Hotel ${hotel.id}`
            }));
            break;
          case 'events':
            const events = await getAllEvents();
            options = events.map((event: any) => ({
              id: event.id.toString(),
              name: event.name || `Event ${event.id}`
            }));
            break;
          default:
            // Default to hotels if unknown entity type
            const defaultHotels = await getAllHotels();
            options = defaultHotels.map((hotel: any) => ({
              id: hotel.id.toString(),
              name: hotel.name || `Hotel ${hotel.id}`
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
          <CardTitle>File Upload Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div>
              <Label>Entity Type</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotels">Hotels</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="rooms">Rooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Entity</Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
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
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="fb">Food & Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>File Type</Label>
              <Select value={fileTypeCode} onValueChange={setFileTypeCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
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
              <h3 className="text-lg font-semibold mb-4">Upload File</h3>
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
              <h3 className="text-lg font-semibold mb-4">Files</h3>
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