import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, ChevronDown, ChevronUp, X } from 'lucide-react';
import FileUpload from './FileUpload';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEntityFiles, deleteFile, FileData } from '@/apiClient/filesApi';
import { useEntityFiles, useDeleteFile } from '@/hooks/useEntityFiles';

interface SectionFileUploadProps {
  entityId?: number | string; // Hotel ID (can be null initially)
  entityType?: string; // Usually 'hotels'
  section: 'hotel' | 'roomInfo' | 'roomCategories' | 'roomHandling' | 'eventsInfo' | 'eventSpaces' | 'foodBeverage' | 'contractOnboarding';
  title?: string;
  description?: string;
  className?: string;
  onSuccess?: (files: any[]) => void;
}

const SECTION_CATEGORIES = {
  hotel: 'hotel',
  roomInfo: 'room',
  roomCategories: 'room',
  roomHandling: 'room',
  eventsInfo: 'event',
  eventSpaces: 'event',
  foodBeverage: 'fb',
  contractOnboarding: 'contract',
};

const SECTION_TITLES = {
  hotel: 'Hotel Documents',
  roomInfo: 'Room Documents',
  roomCategories: 'Room Categories Documents',
  roomHandling: 'Room Operations Documents',
  eventsInfo: 'Event Documents',
  eventSpaces: 'Event Spaces Documents',
  foodBeverage: 'Food & Beverage Documents',
  contractOnboarding: 'Contract & Onboarding Documents',
};

const SECTION_DESCRIPTIONS = {
  hotel: 'Upload hotel brochures, images, legal documents, and other general hotel files.',
  roomInfo: 'Upload room layouts, images, amenities lists, etc.',
  roomCategories: 'Upload documents specific to room categories and types.',
  roomHandling: 'Upload operational procedures, policies, and handling guidelines.',
  eventsInfo: 'Upload event brochures, sample menus, pricing guides, etc.',
  eventSpaces: 'Upload floor plans, space images, equipment lists for event spaces.',
  foodBeverage: 'Upload menus, restaurant images, promotional materials for F&B outlets.',
  contractOnboarding: 'Upload contracts, onboarding documents, technical setup guides, and agreements.',
};

export default function SectionFileUpload({ 
  entityId,
  entityType = 'hotels',
  section,
  title,
  description,
  className = '',
  onSuccess
}: SectionFileUploadProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use the mapped category or the section name if not found
  const category = SECTION_CATEGORIES[section] || section;
  
  // Get title and description from defaults or props
  const displayTitle = title || SECTION_TITLES[section] || 'Upload Documents';
  const displayDescription = description || SECTION_DESCRIPTIONS[section] || 'Upload related documents for this section.';

  const uploadEntityType = entityType;
  const uploadEntityId = entityId; // May be undefined until created
  const uploadCategory = category;

  const handleUploadSuccess = (files: any[]) => {
    if (onSuccess) {
      onSuccess(files);
    }
    queryClient.invalidateQueries({ queryKey: ['sectionFiles', uploadEntityType, uploadEntityId, uploadCategory] });
  };

  // Fetch existing files
  const queryClient = useQueryClient();
  const { data: existingFiles = [], isLoading: loadingFiles } = useEntityFiles(uploadEntityType, uploadEntityId, uploadCategory);
  const deleteMut = useDeleteFile(uploadEntityType, uploadEntityId, uploadCategory);

  return (
    <Card className={`mt-6 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex justify-between w-full p-0"
            >
              <CardTitle className="flex items-center text-base">
                <Paperclip className="mr-2 h-4 w-4" />
                {displayTitle}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {displayDescription}
            </p>
            <FileUpload
              entityType={uploadEntityType}
              entityId={uploadEntityId}
              category={uploadCategory}
              autoUpload={false}
              onSuccess={handleUploadSuccess}
            />

            {/* Existing files */}
            {uploadEntityId && (
              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-sm">Existing files</h4>
                {loadingFiles && <p className="text-xs text-muted-foreground">Loading…</p>}
                {!loadingFiles && existingFiles.length === 0 && (
                  <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
                )}
                {!loadingFiles && existingFiles.map(f=> (
                  <div key={f.id} className="flex items-center justify-between border rounded p-2 text-sm gap-2">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate font-medium">{f.original_name}</span>
                      <span className="text-xs text-muted-foreground truncate">{f.file_type_name || f.file_type_code}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button asChild variant="ghost" size="icon" title="Download">
                        <a href={f.url} target="_blank" rel="noopener noreferrer" download>
                          <Paperclip className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={()=>deleteMut.mutate(f.id)} title="Delete">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 