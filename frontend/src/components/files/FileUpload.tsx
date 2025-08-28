import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image, PlusCircle, Lightbulb, FolderOpen, ArrowUp, Loader2, Check } from 'lucide-react';
import { uploadFile } from '@/apiClient/filesApi';
import { getFileTypesByCategory, FileType } from '@/apiClient/filesApi';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  entityType: string;
  entityId?: number | string; // May be undefined until entity is created
  category: string;
  fileTypeCode?: string; // This should be used as initialFileTypeCode
  maxFiles?: number;
  className?: string;
  onSuccess?: (files: any[]) => void;
  autoUpload?: boolean; // If true, upload automatically when entityId is available
  onFileChange?: (files: FileToUpload[]) => void; // Callback to expose file state
}

interface FileToUpload {
  file: File;
  fileTypeCode: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: any;
}

export interface FileUploadRef {
  isUploadComplete: () => boolean;
  getUploadStatus: () => { pending: number; uploading: number; success: number; error: number };
  waitForUploads: () => Promise<void>;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({
  entityType,
  entityId,
  category,
  fileTypeCode,
  maxFiles = 20,
  className = '',
  autoUpload = false,
  onSuccess,
  onFileChange,
}, ref) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [isLoadingFileTypes, setIsLoadingFileTypes] = useState<boolean>(false);
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [batchSize, setBatchSize] = useState<number>(5); // Default batch size for large uploads

  // Use fileTypeCode as initialFileTypeCode if provided
  const initialFileTypeCode = fileTypeCode;

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    isUploadComplete: () => {
      const allFiles = [...filesToUpload, ...uploadedFiles];
      return allFiles.length === 0 || allFiles.every(f => f.status === 'success');
    },
    getUploadStatus: () => ({
      pending: filesToUpload.filter(f => f.status === 'pending').length,
      uploading: filesToUpload.filter(f => f.status === 'uploading').length,
      success: filesToUpload.filter(f => f.status === 'success').length + uploadedFiles.length,
      error: filesToUpload.filter(f => f.status === 'error').length
    }),
    waitForUploads: async () => {
      if (isUploading) {
        // Wait for current upload to complete
        return new Promise<void>((resolve) => {
          const checkUpload = () => {
            if (!isUploading) {
              resolve();
            } else {
              setTimeout(checkUpload, 100);
            }
          };
          checkUpload();
        });
      }
      return Promise.resolve();
    }
  }), [filesToUpload, uploadedFiles, isUploading]);

  // Notify parent component of file changes
  const lastNotifiedState = useRef<string>('');
  
  useEffect(() => {
    if (onFileChange) {
      const allFiles = [...filesToUpload, ...uploadedFiles];
      
      // Don't notify if there are no files and we've already notified about empty state
      if (allFiles.length === 0 && lastNotifiedState.current === 'empty') {
        return;
      }
      
      const currentState = allFiles.length === 0 ? 'empty' : JSON.stringify({
        filesToUploadCount: filesToUpload.length,
        uploadedFilesCount: uploadedFiles.length,
        totalFiles: allFiles.length,
        statuses: allFiles.map(f => f.status)
      });
      
      // Only call onFileChange if the state has actually changed
      if (currentState !== lastNotifiedState.current) {
        lastNotifiedState.current = currentState;
        
        console.log('[FileUpload] Calling onFileChange with:', {
          filesToUpload: filesToUpload.length,
          uploadedFiles: uploadedFiles.length,
          totalFiles: allFiles.length,
          hasUnfinishedUploads: allFiles.some(f => f.status === 'pending' || f.status === 'uploading'),
          hasErrors: allFiles.some(f => f.status === 'error'),
          uploadStatus: {
            pending: filesToUpload.filter(f => f.status === 'pending').length,
            uploading: filesToUpload.filter(f => f.status === 'uploading').length,
            success: filesToUpload.filter(f => f.status === 'success').length + uploadedFiles.length,
            error: filesToUpload.filter(f => f.status === 'error').length
          }
        });
        
        onFileChange(allFiles);
      }
    }
  }, [filesToUpload, uploadedFiles, onFileChange]);

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
            fileTypeCode: file.fileTypeCode || initialFileTypeCode || types[0].code
          })));
          console.log('[FileUpload] Auto-assigned default file types to existing files. Used:', {
            initialFileTypeCode,
            fallbackType: types[0].code
          });
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
    // First priority: use the prop value if provided
    if (initialFileTypeCode) {
      console.log('[FileUpload] Using file type from props:', initialFileTypeCode);
      return initialFileTypeCode;
    }
    
    // Second priority: use the first available file type for this category
    if (fileTypes.length > 0) {
      const defaultType = fileTypes[0];
      console.log('[FileUpload] Using first available file type:', defaultType);
      return defaultType.code;
    }
    
    console.warn('[FileUpload] No file types available, cannot determine default');
    return '';
  }, [initialFileTypeCode, fileTypes]);

  // Enhanced file type validation
  const validateFileType = useCallback((fileTypeCode: string) => {
    if (!fileTypeCode) {
      console.error('[FileUpload] No file type code provided');
      return false;
    }
    
    const availableTypes = fileTypes.map(t => t.code);
    if (!availableTypes.includes(fileTypeCode)) {
      console.error('[FileUpload] Invalid file type code:', fileTypeCode, 'Available types:', availableTypes);
      return false;
    }
    
    return true;
  }, [fileTypes]);

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
    console.log('[FileUpload] Available file types:', fileTypes.map(t => ({ code: t.code, name: t.name })));
    console.log('[FileUpload] initialFileTypeCode from props:', initialFileTypeCode);
    
    // Validate the default file type
    if (!validateFileType(defaultFileTypeCode)) {
      toast.error(`Invalid file type: ${defaultFileTypeCode}. Available types: ${fileTypes.map(t => t.code).join(', ')}`);
      return;
    }
    
    // If we don't have a default yet, use the first available file type
    const effectiveDefaultCode = defaultFileTypeCode || (fileTypes.length > 0 ? fileTypes[0].code : '');
    console.log('[FileUpload] Effective default code:', effectiveDefaultCode);
    
    if (!effectiveDefaultCode) {
      toast.error('No valid file type available. Please try refreshing the page.');
      return;
    }
    
    const newFiles = acceptedFiles.map(file => ({
      file,
      fileTypeCode: effectiveDefaultCode,
      progress: 0,
      status: 'pending' as const
    }));
    
    console.log('[FileUpload] Created file entries:', newFiles);
    setFilesToUpload(prev => [...prev, ...newFiles]);
    
    if (acceptedFiles.length > 0) {
      toast.success(`${acceptedFiles.length} file(s) added to upload queue`);
    }
  }, [getDefaultFileTypeCode, fileTypes, initialFileTypeCode, validateFileType]);

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

  // Function to upload files in batches
  const handleBatchUpload = async (startIndex: number, endIndex: number) => {
    const batchFiles = filesToUpload.slice(startIndex, endIndex);
    console.log(`[FileUpload] Processing batch ${startIndex + 1}-${endIndex} with ${batchFiles.length} files`);
    
    const effectiveEntityId = entityId || 'new';
    const successfulUploads: any[] = [];
    
    for (let i = 0; i < batchFiles.length; i++) {
      const fileIndex = startIndex + i;
      const fileItem = batchFiles[i];
      
      if (fileItem.status === 'success' || fileItem.status === 'error') {
        continue;
      }
      
      // Update status to uploading
      setFilesToUpload(prev => prev.map((f, idx) => 
        idx === fileIndex ? { ...f, status: 'uploading' as const } : f
      ));
      
      try {
        const response = await uploadFile(
          entityType,
          effectiveEntityId,
          category,
          fileItem.fileTypeCode,
          fileItem.file,
          (progress) => {
            setFilesToUpload(prev => prev.map((f, idx) => 
              idx === fileIndex ? { ...f, progress } : f
            ));
          }
        );
        
        // Update status to success
        setFilesToUpload(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'success' as const, response } : f
        ));
        
        successfulUploads.push(response);
        console.log(`[FileUpload] Successfully uploaded file ${fileItem.file.name}`);
      } catch (error: any) {
        console.error(`Error uploading file ${fileItem.file.name}:`, error);
        
        // Extract specific error message
        let errorMessage = 'Error uploading file';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Show specific error for file type issues
        if (errorMessage.includes('File type not found')) {
          errorMessage = `File type "${fileItem.fileTypeCode}" not found for category "${category}". Available types: ${fileTypes.map(t => t.code).join(', ')}`;
        }
        
        setFilesToUpload(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'error' as const, error: errorMessage } : f
        ));
        
        toast.error(`Failed to upload ${fileItem.file.name}: ${errorMessage}`);
      }
    }
    
    return successfulUploads;
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
    
    console.log(`[FileUpload] Starting upload for entityType: ${entityType}, entityId: ${effectiveEntityId}, category: ${category}`);
    
    // Check if any files are missing file types and assign defaults
    const updatedFiles = filesToUpload.map(file => ({
      ...file,
      fileTypeCode: file.fileTypeCode || getDefaultFileTypeCode()
    }));
    
    // Validate all file types before proceeding
    const invalidFiles = updatedFiles.filter(file => !validateFileType(file.fileTypeCode));
    if (invalidFiles.length > 0) {
      const invalidTypes = [...new Set(invalidFiles.map(f => f.fileTypeCode))];
      toast.error(`Invalid file types: ${invalidTypes.join(', ')}. Available types: ${fileTypes.map(t => t.code).join(', ')}`);
      return;
    }
    
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

    // Use batch upload for large numbers of files
    if (updatedFiles.length > batchSize) {
      console.log(`[FileUpload] Large upload detected (${updatedFiles.length} files), using batch upload with batch size ${batchSize}`);
      
      const totalBatches = Math.ceil(updatedFiles.length / batchSize);
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, updatedFiles.length);
        
        console.log(`[FileUpload] Processing batch ${batchIndex + 1}/${totalBatches} (files ${startIndex + 1}-${endIndex})`);
        
        const batchResults = await handleBatchUpload(startIndex, endIndex);
        successfulUploads.push(...batchResults);
        
        // Small delay between batches to avoid overwhelming the server
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      // Process files sequentially for smaller uploads
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

  // Auto-upload files when entityId is 'new' to ensure they're available for assignment
  useEffect(() => {
    if (entityId === 'new' && filesToUpload.length > 0 && !isUploading) {
      console.log('[FileUpload] Auto-uploading files for new entity');
      handleUploadFiles();
    }
  }, [entityId, filesToUpload.length, isUploading]);

  // Expose upload status to parent component
  useEffect(() => {
    if (onFileChange) {
      const allFiles = [...filesToUpload, ...uploadedFiles];
      const hasUnfinishedUploads = allFiles.some(f => f.status === 'pending' || f.status === 'uploading');
      const hasErrors = allFiles.some(f => f.status === 'error');
      
      console.log('[FileUpload] Calling onFileChange with:', {
        filesToUpload: filesToUpload.length,
        uploadedFiles: uploadedFiles.length,
        totalFiles: allFiles.length,
        hasUnfinishedUploads,
        hasErrors,
        uploadStatus: {
          pending: filesToUpload.filter(f => f.status === 'pending').length,
          uploading: filesToUpload.filter(f => f.status === 'uploading').length,
          success: filesToUpload.filter(f => f.status === 'success').length + uploadedFiles.length,
          error: filesToUpload.filter(f => f.status === 'error').length
        }
      });
      
      onFileChange(allFiles);
    }
  }, [filesToUpload, uploadedFiles, onFileChange]);

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

  const retryFailedUploads = async () => {
    const failedFiles = filesToUpload.filter(f => f.status === 'error');
    if (failedFiles.length === 0) {
      toast.info('No failed uploads to retry');
      return;
    }
    
    console.log(`[FileUpload] Retrying ${failedFiles.length} failed uploads`);
    
    // Reset failed files to pending status
    setFilesToUpload(prev => prev.map(file => 
      file.status === 'error' ? { ...file, status: 'pending' as const, error: undefined } : file
    ));
    
    // Start upload process
    await handleUploadFiles();
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
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Tip: For best performance, upload 10-15 files at a time
                </p>
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
              
              {/* File Count Summary */}
              {filesToUpload.length > 10 && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <div className="flex items-center justify-between">
                    <span><strong>Large upload queue:</strong> {filesToUpload.length} files. Consider uploading in smaller batches for better performance.</span>
                    <div className="flex items-center gap-2">
                      <span>Batch size:</span>
                      <Select value={String(batchSize)} onValueChange={(value) => setBatchSize(Number(value))}>
                        <SelectTrigger className="h-6 w-16 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-2">
                {filesToUpload.map((fileItem, index) => (
                  <div 
                    key={`${fileItem.file.name}-${index}`}
                    className="flex flex-col rounded-lg border border-muted bg-background p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                            {fileItem.file.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(fileItem.file.size)}</span>
                            <span>•</span>
                            <span>{fileItem.file.type}</span>
                          </div>
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
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mb-1">
                      {fileItem.status === 'error' && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          {fileItem.error || 'Upload failed'}
                        </Badge>
                      )}
                      {fileItem.status === 'success' && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200">
                          Upload successful
                        </Badge>
                      )}
                      {fileItem.status === 'uploading' && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                          Uploading...
                        </Badge>
                      )}
                    </div>

                    {/* Type Selection & Progress */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select 
                          value={fileItem.fileTypeCode} 
                          onValueChange={(value) => updateFileTypeCode(index, value)}
                          disabled={isLoadingFileTypes || fileItem.status === 'uploading' || fileItem.status === 'success'}
                        >
                          <SelectTrigger className="w-full h-7 text-xs">
                            <SelectValue placeholder="Select document type">
                              {isLoadingFileTypes 
                                ? 'Loading...' 
                                : fileItem.fileTypeCode 
                                  ? `${fileTypes.find(t => t.code === fileItem.fileTypeCode)?.name || fileItem.fileTypeCode}`
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
                      <div className="mt-1 w-full space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Uploading...</span>
                          <span>{fileItem.progress}%</span>
                        </div>
                        <Progress value={fileItem.progress} className="h-1" />
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
                  : filesToUpload.length > batchSize
                    ? `Upload All ${filesToUpload.length} Files (in batches)`
                    : `Upload All ${filesToUpload.length} Files`}
              </Button>
                {/* Retry failed uploads button */}
                {filesToUpload.some(f => f.status === 'error') && (
                  <Button
                    onClick={retryFailedUploads}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isUploading}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Retry Failed Uploads
                  </Button>
                )}
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
      {/* Debug info for file types */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div className="font-medium">Debug Info:</div>
          <div>Available file types: {fileTypes.map(t => `${t.code} (${t.name})`).join(', ')}</div>
          <div>Selected file type: {getDefaultFileTypeCode()}</div>
          <div>Category: {category}</div>
        </div>
      )}
    </div>
  );
});

export default FileUpload; 