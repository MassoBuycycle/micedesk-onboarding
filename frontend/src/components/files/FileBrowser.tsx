import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Trash2, 
  FileText,
  FileImage, 
  File as FileIcon,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getFileIcon } from '@/lib/fileUtils.tsx';
import { FileData, getEntityFiles, deleteFile } from '@/apiClient/filesApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FileBrowserProps {
  entityType: string;
  entityId: number | string;
  category?: string;
  title?: string;
  onFileDelete?: () => void;
  className?: string;
}

export default function FileBrowser({
  entityType,
  entityId,
  category,
  title = 'Files',
  onFileDelete,
  className = '',
}: FileBrowserProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const fileData = await getEntityFiles(entityType, entityId, category);
      setFiles(fileData);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      setError(error.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFile(fileToDelete.id);
      
      // Update the file list
      setFiles(files.filter(file => file.id !== fileToDelete.id));
      toast.success('File deleted successfully');
      
      // Call the onFileDelete callback if provided
      if (onFileDelete) onFileDelete();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(error.message || 'Failed to delete file');
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  useEffect(() => {
    if (entityId) {
      fetchFiles();
    }
  }, [entityType, entityId, category]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No files found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.mime_type)}
                      <span className="max-w-[200px] truncate">
                        {file.original_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{file.file_type_name}</TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFileToDelete(file)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete File</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{fileToDelete?.original_name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setFileToDelete(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteFile}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 