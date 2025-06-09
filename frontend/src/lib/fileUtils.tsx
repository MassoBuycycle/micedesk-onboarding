import React from 'react';
import { FileText, FileImage, FileArchive, File } from 'lucide-react';

/**
 * Get an appropriate icon for the file based on its MIME type
 */
export const getFileIcon = (mimeType: string): React.ReactNode => {
  if (mimeType.startsWith('image/')) {
    return <FileImage className="h-4 w-4 text-blue-500" />;
  }
  
  if (mimeType === 'application/pdf') {
    return <FileText className="h-4 w-4 text-red-500" />;
  }
  
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="h-4 w-4 text-blue-700" />;
  }
  
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileText className="h-4 w-4 text-green-700" />;
  }
  
  if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return <FileArchive className="h-4 w-4 text-amber-600" />;
  }
  
  // Default icon
  return <File className="h-4 w-4 text-gray-500" />;
}; 