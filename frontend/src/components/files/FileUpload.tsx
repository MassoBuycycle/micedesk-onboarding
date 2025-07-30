import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FilePlus, File, Check, FolderOpen, Loader2, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { uploadFile, getFileTypesByCategory, FileType } from '@/apiClient/filesApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  entityType: string;
  entityId?: number | string; // May be undefined until entity is created
  category: string;
  fileTypeCode?: string;
  onSuccess?: (files: any[]) => void;
  maxFiles?: number;
  className?: string;
  autoUpload?: boolean; // If true, upload automatically when entityId is available
}

interface FileToUpload {
  file: File;
  fileTypeCode: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: any;
}

export default function FileUpload({
  entityType,
  entityId,
  category,
  fileTypeCode: initialFileTypeCode,
  onSuccess,
  maxFiles = 10, // Increased default max to support multiple files
  className = '',
  autoUpload = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [isLoadingFileTypes, setIsLoadingFileTypes] = useState<boolean>(false);
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Fetch available file types for this category
  useEffect(() => {
    const fetchFileTypes = async () => {
      setIsLoadingFileTypes(true);
      try {
        // Remove temp suffix (e.g., "-hotels-temp") if present so we query the real category
        const cleanCategory = category.replace(/-[^-]+-temp$/, '');
        console.log('[FileUpload] Fetching file types for category:', cleanCategory);
        const types = await getFileTypesByCategory(cleanCategory);
        console.log('[FileUpload] Found file types:', types);
        setFileTypes(types);
      } catch (error) {
        console.error('Error fetching file types:', error);
        toast.error('Failed to load file types');
      } finally {
        setIsLoadingFileTypes(false);
      }
    };

    fetchFileTypes();
  }, [category]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('[FileUpload] Files dropped:', acceptedFiles.length, 'files');
    console.log('[FileUpload] File names:', acceptedFiles.map(f => f.name));
    
    // Create file entries for each dropped file
    const newFiles = acceptedFiles.map(file => ({
      file,
      fileTypeCode: initialFileTypeCode || '',
      progress: 0,
      status: 'pending' as const
    }));
    
    console.log('[FileUpload] Created file entries:', newFiles);
    setFilesToUpload(prev => [...prev, ...newFiles]);
  }, [initialFileTypeCode]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles,
    multiple: true, // Allow multiple files
    noClick: false, // Ensure clicks are handled
    noKeyboard: false, // Ensure keyboard events are handled
  });

  // Manual click handler as fallback
  const handleManualClick = () => {
    console.log('[FileUpload] Manual click triggered');
    open();
  };

  const handleRemoveFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileTypeCode = (index: number, newFileTypeCode: string) => {
    setFilesToUpload(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, fileTypeCode: newFileTypeCode } : item
      )
    );
  };

  const handleUploadFiles = async () => {
    // Use 'new' as temporary entityId if not available
    const effectiveEntityId = entityId || 'new';
    
    // Check if any files are missing file types
    const missingTypes = filesToUpload.some(file => !file.fileTypeCode);
    if (missingTypes) {
      toast.error('Please select a file type for each file');
      return;
    }

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    const updatedFiles = [...filesToUpload];
    const successfulUploads: any[] = [];

    for (let i = 0; i < updatedFiles.length; i++) {
      // Skip already uploaded or errored files
      if (updatedFiles[i].status === 'success' || updatedFiles[i].status === 'error') {
        continue;
      }

      updatedFiles[i].status = 'uploading';
      setFilesToUpload([...updatedFiles]);

      try {
        const response = await uploadFile(
          entityType,
          effectiveEntityId,
          category,
          updatedFiles[i].fileTypeCode,
          updatedFiles[i].file,
          (progress) => {
            updatedFiles[i].progress = progress;
            setFilesToUpload([...updatedFiles]);
          }
        );

        updatedFiles[i].status = 'success';
        updatedFiles[i].response = response;
        successfulUploads.push(response);
      } catch (error: any) {
        console.error(`Error uploading file ${updatedFiles[i].file.name}:`, error);
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = error.message || 'Error uploading file';
      }

      setFilesToUpload([...updatedFiles]);
    }

    setIsUploading(false);
    
    if (successfulUploads.length > 0) {
      if (!entityId) {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s). They will be associated with the record when saved.`);
      } else {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      }
      setUploadedFiles(prev => [...prev, ...successfulUploads]);
      
      // Clear successfully uploaded files from the upload list
      setFilesToUpload(prev => prev.filter(file => file.status !== 'success'));
      
      if (onSuccess) {
        onSuccess(successfulUploads);
      }
    }
  };

  // Auto-upload effect: when autoUpload is enabled and we have pending/error files
  useEffect(() => {
    if (!autoUpload) return;

    const hasPending = filesToUpload.some(f => f.status === 'pending' || f.status === 'error');
    if (hasPending && !isUploading) {
      handleUploadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpload, filesToUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeExtensions = (code: string) => {
    const fileType = fileTypes.find(type => type.code === code);
    return fileType ? fileType.allowed_extensions.join(', ') : '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className={`border-dashed ${isDragActive ? 'border-primary' : 'border-muted-foreground/20'}`}>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            } ${className}`}
            onClick={handleManualClick}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="max-w-xs text-center">
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop the files here' : 'Drag and drop your files here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse files
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {filesToUpload.length > 0 && (
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Files to Upload</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filesToUpload.map((fileItem, index) => (
                  <div 
                    key={`${fileItem.file.name}-${index}`}
                    className="flex flex-col rounded-lg border border-muted bg-background p-2"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <File className="h-5 w-5 text-primary" />
                        <div>
                          <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                            {fileItem.file.name}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(fileItem.file.size)}
                          </span>
                        </div>
                      </div>
                      {fileItem.status !== 'uploading' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Status Badges */}
                    {fileItem.status === 'error' && (
                      <Badge variant="destructive" className="self-start mb-2">
                        {fileItem.error || 'Upload failed'}
                      </Badge>
                    )}
                    {fileItem.status === 'success' && (
                      <Badge variant="outline" className="self-start mb-2 bg-green-50 text-green-700 border-green-200">
                        Upload successful
                      </Badge>
                    )}

                    {/* Type Selection & Progress */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1">
                        <Select 
                          value={fileItem.fileTypeCode} 
                          onValueChange={(value) => updateFileTypeCode(index, value)}
                          disabled={isLoadingFileTypes || fileItem.status === 'uploading' || fileItem.status === 'success'}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Select document type">
                              {isLoadingFileTypes 
                                ? 'Loading...' 
                                : fileItem.fileTypeCode 
                                  ? `${fileTypes.find(t => t.code === fileItem.fileTypeCode)?.name || fileItem.fileTypeCode} (${getFileTypeExtensions(fileItem.fileTypeCode)})`
                                  : 'Select document type'
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {fileTypes.map(type => (
                              <SelectItem key={`${index}-${type.id}`} value={type.code}>
                                <div className="flex items-center text-xs">
                                  <FolderOpen className="mr-2 h-3 w-3" />
                                  <span>{type.name}</span>
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    ({type.allowed_extensions.join(', ')})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {fileItem.status === 'uploading' && (
                      <div className="mt-2 w-full space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Uploading...</span>
                          <span>{fileItem.progress}%</span>
                        </div>
                        <Progress value={fileItem.progress} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button (hidden in autoUpload mode) */}
          {filesToUpload.length > 0 && !isUploading && !autoUpload && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUploadFiles();
              }}
              className="mt-4"
              disabled={filesToUpload.length === 0 || filesToUpload.every(f => f.status === 'success')}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              {filesToUpload.some(f => f.status === 'error') 
                ? 'Retry Failed Uploads' 
                : 'Upload All Files'}
            </Button>
          )}

          {/* Loading Indicator */}
          {isUploading && (
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Uploading files...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recently Uploaded</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <Card key={`uploaded-${index}`} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.original_name}</p>
                        <div className="flex items-center text-xs text-muted-foreground space-x-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.file_type_name}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(file.url, '_blank');
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setUploadedFiles([]);
            }}
            className="w-full mt-2"
          >
            Clear Upload History
          </Button>
        </div>
      )}
    </div>
  );
} 