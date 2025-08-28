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
        
        // Set default file type code if not provided and we have file types
        if (!initialFileTypeCode && types.length > 0) {
          console.log('[FileUpload] Setting default file type code:', types[0].code);
        }
        
        setFileTypes(types);
        
        // If we have existing files without file types, update them with the first available type
        if (types.length > 0) {
          setFilesToUpload(prev => prev.map(file => ({
            ...file,
            fileTypeCode: file.fileTypeCode || types[0].code
          })));
          console.log('[FileUpload] Auto-assigned default file types to existing files');
        }
      } catch (error) {
        console.error('Error fetching file types:', error);
        toast.error('Failed to load file types');
      } finally {
        setIsLoadingFileTypes(false);
      }
    };

    fetchFileTypes();
  }, [category, initialFileTypeCode]);

  // Helper function to get the default file type code
  const getDefaultFileTypeCode = useCallback(() => {
    const defaultCode = initialFileTypeCode || (fileTypes.length > 0 ? fileTypes[0].code : '');
    console.log('[FileUpload] getDefaultFileTypeCode called:', {
      initialFileTypeCode,
      availableFileTypes: fileTypes.map(t => ({ code: t.code, name: t.name })),
      defaultCode
    });
    return defaultCode;
  }, [initialFileTypeCode, fileTypes]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('[FileUpload] onDrop called with:', {
      acceptedFilesCount: acceptedFiles.length,
      rejectedFilesCount: rejectedFiles.length,
      totalFiles: acceptedFiles.length + rejectedFiles.length
    });
    console.log('[FileUpload] Files dropped:', acceptedFiles.length, 'accepted files');
    console.log('[FileUpload] Accepted file names:', acceptedFiles.map(f => f.name));
    if (rejectedFiles.length > 0) {
      console.log('[FileUpload] Rejected files:', rejectedFiles.length, 'files');
      console.log('[FileUpload] Rejected file names:', rejectedFiles.map(f => f.file.name));
      console.log('[FileUpload] Rejection reasons:', rejectedFiles.map(f => f.errors));
      toast.error(`${rejectedFiles.length} file(s) were rejected. Please check file types and sizes.`);
    }
    
    // Create file entries for each dropped file with default file type
    const defaultFileTypeCode = getDefaultFileTypeCode();
    console.log('[FileUpload] Using default file type code:', defaultFileTypeCode);
    
    const newFiles = acceptedFiles.map(file => ({
      file,
      fileTypeCode: defaultFileTypeCode,
      progress: 0,
      status: 'pending' as const
    }));
    
    console.log('[FileUpload] Created file entries:', newFiles);
    setFilesToUpload(prev => [...prev, ...newFiles]);
    
    if (acceptedFiles.length > 0) {
      toast.success(`${acceptedFiles.length} file(s) added to upload queue`);
    }
  }, [getDefaultFileTypeCode]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles,
    multiple: true, // Allow multiple files
    noClick: false, // Ensure clicks are handled
    noKeyboard: false, // Ensure keyboard events are handled
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    onDropAccepted: (files) => {
      console.log('[FileUpload] Dropzone onDropAccepted called with:', files.length, 'files');
    },
    onDropRejected: (fileRejections) => {
      console.log('[FileUpload] Dropzone onDropRejected called with:', fileRejections.length, 'rejections');
      fileRejections.forEach(rejection => {
        console.log('[FileUpload] File rejected:', rejection.file.name, 'Errors:', rejection.errors);
      });
    }
  });

  // Manual click handler as fallback - ensure it opens the file picker with multiple support
  const handleManualClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[FileUpload] Manual click triggered');
    
    // Create a temporary file input with multiple attribute
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.txt';
    
    // Add debugging
    console.log('[FileUpload] Created file input with attributes:', {
      type: input.type,
      multiple: input.multiple,
      accept: input.accept
    });
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      console.log('[FileUpload] File input change event:', {
        files: target.files,
        fileCount: target.files?.length || 0
      });
      
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files);
        console.log('[FileUpload] Manual file selection:', files.length, 'files');
        console.log('[FileUpload] Selected files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
        
        // Use the same logic as onDrop for consistency
        const defaultFileTypeCode = getDefaultFileTypeCode();
        console.log('[FileUpload] Manual selection using default file type code:', defaultFileTypeCode);
        
        onDrop(files, []); // No rejected files for manual selection
      } else {
        console.log('[FileUpload] No files selected in manual picker');
      }
    };
    
    input.click();
  };

  const handleRemoveFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFilesToUpload([]);
    toast.info('Upload queue cleared');
  };

  // Function to assign default file types to files that don't have them
  const assignDefaultFileTypes = useCallback(() => {
    if (fileTypes.length === 0) return;
    
    const defaultCode = getDefaultFileTypeCode();
    if (!defaultCode) return;
    
    setFilesToUpload(prev => prev.map(file => ({
      ...file,
      fileTypeCode: file.fileTypeCode || defaultCode
    })));
    
    console.log('[FileUpload] Assigned default file type to files without types');
  }, [fileTypes.length, getDefaultFileTypeCode]);

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
    
    console.log(`[FileUpload] Starting upload for entityType: ${entityType}, entityId: ${effectiveEntityId}, category: ${category}`);
    
    // Check if any files are missing file types and assign defaults
    const updatedFiles = filesToUpload.map(file => ({
      ...file,
      fileTypeCode: file.fileTypeCode || getDefaultFileTypeCode()
    }));
    
    const stillMissingTypes = updatedFiles.some(file => !file.fileTypeCode);
    if (stillMissingTypes) {
      toast.error('Unable to determine file types. Please try refreshing the page.');
      return;
    }
    
    // Update the state with the corrected file types
    if (JSON.stringify(updatedFiles) !== JSON.stringify(filesToUpload)) {
      setFilesToUpload(updatedFiles);
    }

    if (updatedFiles.length === 0) return;

    setIsUploading(true);
    const successfulUploads: any[] = [];

    // Process files sequentially to avoid race conditions when using temporary entity IDs
    for (let i = 0; i < updatedFiles.length; i++) {
      // Skip already uploaded or errored files
      if (updatedFiles[i].status === 'success' || updatedFiles[i].status === 'error') {
        continue;
      }

      updatedFiles[i].status = 'uploading';
      setFilesToUpload([...updatedFiles]);

      try {
        console.log(`[FileUpload] Uploading file ${i + 1}/${updatedFiles.length}: ${updatedFiles[i].file.name}`);
        console.log(`[FileUpload] File details:`, {
          name: updatedFiles[i].file.name,
          size: updatedFiles[i].file.size,
          type: updatedFiles[i].file.type,
          fileTypeCode: updatedFiles[i].fileTypeCode
        });
        console.log(`[FileUpload] Upload target: ${entityType}/${effectiveEntityId}/${category}`);
        
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
        
        console.log(`[FileUpload] Successfully uploaded file ${updatedFiles[i].file.name}`);
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
        console.log(`[FileUpload] ${successfulUploads.length} files uploaded with temporary entityId 'new' - will be assigned when entity is created`);
      } else {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
        console.log(`[FileUpload] ${successfulUploads.length} files uploaded successfully to entity ${entityId}`);
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
      console.log('[FileUpload] Auto-upload triggered with pending files:', filesToUpload.filter(f => f.status === 'pending' || f.status === 'error').length);
      handleUploadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpload, filesToUpload]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('[FileUpload] State updated:', {
      filesToUploadCount: filesToUpload.length,
      uploadedFilesCount: uploadedFiles.length,
      isUploading,
      entityId,
      category
    });
  }, [filesToUpload.length, uploadedFiles.length, isUploading, entityId, category]);

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
      {/* File Type Summary */}
      {fileTypes.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Default File Type:</span>
            <Badge variant="secondary" className="text-xs">
              {fileTypes[0]?.name} ({fileTypes[0]?.code})
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {fileTypes[0]?.allowed_extensions?.join(', ')}
          </div>
        </div>
      )}
      
      <Card className={`border-dashed ${isDragActive ? 'border-primary' : 'border-muted-foreground/20'}`}>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            } ${className}`}
            onClick={handleManualClick}
          >
            <input {...getInputProps()} multiple />
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
                <p className="text-xs text-primary mt-1">
                  ✓ Multiple files supported (up to {maxFiles})
                </p>
                {fileTypes.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Default type: {fileTypes[0]?.name || 'Loading...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File List */}
          {filesToUpload.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Files to Upload</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {filesToUpload.length} file{filesToUpload.length !== 1 ? 's' : ''} in queue
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={assignDefaultFileTypes}
                    className="h-6 px-2 text-xs"
                    disabled={fileTypes.length === 0}
                  >
                    Assign Default Types
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFiles}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
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
                        {/* Show if this is using the default file type */}
                        {fileItem.fileTypeCode === getDefaultFileTypeCode() && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Using default file type
                          </p>
                        )}
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
            <div className="mt-4 space-y-2">
              {/* Upload Status Summary */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {filesToUpload.filter(f => f.status === 'pending').length} pending,{' '}
                  {filesToUpload.filter(f => f.status === 'success').length} uploaded,{' '}
                  {filesToUpload.filter(f => f.status === 'error').length} failed
                </span>
              </div>
              
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUploadFiles();
                }}
                className="w-full"
                disabled={filesToUpload.length === 0 || filesToUpload.every(f => f.status === 'success')}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                {filesToUpload.some(f => f.status === 'error') 
                  ? 'Retry Failed Uploads' 
                  : 'Upload All Files'}
              </Button>
            </div>
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