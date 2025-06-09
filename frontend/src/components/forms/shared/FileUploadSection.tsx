import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Paperclip } from 'lucide-react';
import FileUpload from '@/components/files/FileUpload';
import FormSection from '@/components/shared/FormSection';

interface FileUploadSectionProps {
  entityType: string;
  entityId: number | string;
  category: string;
  title?: string;
  description?: string;
  className?: string;
  onFileUploaded?: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  entityType,
  entityId,
  category,
  title = 'Files & Documents',
  description = 'Upload files related to this record',
  className = '',
  onFileUploaded
}) => {
  // Always allow file uploads regardless of entityId
  // Use 'new' as temporary identifier if no entityId is provided
  const effectiveEntityId = entityId || 'new';

  // File types for different categories
  const getFileTypeByCategory = (category: string): string => {
    switch (category) {
      case 'hotel':
        return 'images';
      case 'event':
        return 'images';
      case 'room':
        return 'photos';
      case 'fb':
        return 'menu';
      default:
        return 'documents';
    }
  };

  return (
    <FormSection 
      title={title}
      description={description}
      className={className}
    >
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">Files uploaded here will be stored in secure cloud storage.</p>
      </div>
      
      <div className="space-y-4">
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="p-4">
            <FileUpload
              entityType={entityType}
              entityId={effectiveEntityId}
              category={category}
              fileTypeCode={getFileTypeByCategory(category)}
              onSuccess={onFileUploaded}
            />
          </CardContent>
        </Card>
        
        {/* Only show uploaded files section if there's an actual entityId */}
        {entityId && (
          <Card>
            <CardHeader className="px-4 py-2 border-b">
              <CardTitle className="text-sm">Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[320px] overflow-y-auto">
              <div className="p-4" id={`uploaded-files-${entityType}-${entityId}`}>
                {/* This div will be populated by the FileBrowser component dynamically */}
                <FileBrowserLoader 
                  entityType={entityType} 
                  entityId={entityId} 
                  category={category} 
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Show a note when files will be attached to the entity after saving */}
        {!entityId && (
          <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <p>Note: Files will be automatically attached to this {entityType.slice(0, -1)} after you save it.</p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

// Dynamically load FileBrowser with lazy loading
const FileBrowserLoader: React.FC<{
  entityType: string;
  entityId: number | string;
  category: string;
}> = ({ entityType, entityId, category }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [FileBrowser, setFileBrowser] = React.useState<any>(null);

  React.useEffect(() => {
    const loadComponent = async () => {
      try {
        // Dynamically import the FileBrowser component
        const module = await import('@/components/files/FileBrowser');
        setFileBrowser(() => module.default);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading FileBrowser component:", error);
      }
    };

    loadComponent();
  }, []);

  if (!isLoaded || !FileBrowser) {
    return <div className="py-2 text-sm text-muted-foreground">Loading files...</div>;
  }

  return (
    <FileBrowser
      entityType={entityType}
      entityId={entityId}
      category={category}
      title=""
      className="border-0 shadow-none p-0"
    />
  );
};

export default FileUploadSection; 