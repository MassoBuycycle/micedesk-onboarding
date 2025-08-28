import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEntityFiles, FileData } from '@/apiClient/filesApi';
import { Image, Loader2 } from 'lucide-react';

interface RoomCategoryImagesProps {
  categoryId: number;
}

const RoomCategoryImages: React.FC<RoomCategoryImagesProps> = ({ categoryId }) => {
  const { data: images = [], isLoading } = useQuery<FileData[]>({
    queryKey: ['roomCategoryImages', categoryId],
    queryFn: () => getEntityFiles('room-categories', categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });

  // Filter only image files
  const imageFiles = images.filter(file => file.mime_type.startsWith('image'));

  if (isLoading) {
    return (
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1.5 mb-2">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">Loading images...</span>
        </div>
        {/* Loading skeleton for image grid */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full h-16 bg-gray-200 rounded border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (imageFiles.length === 0) {
    return null; // Don't show anything if no images
  }

  return (
    <div className="mt-3 pt-2 border-t border-gray-200">
      <div className="flex items-center gap-1.5 mb-2">
        <Image className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {imageFiles.length} Bild(er)
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageFiles.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.url}
              alt={image.original_name || 'Room category image'}
              className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(image.url, '_blank')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCategoryImages; 