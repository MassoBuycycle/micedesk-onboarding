import { apiGet, apiPost, apiDelete } from './apiClient';
import { getAuthToken } from './authApi';

// Types
export interface FileType {
  id: number;
  name: string;
  code: string;
  category: string;
  allowed_extensions: string[];
  max_size: number;
  created_at?: string;
  updated_at?: string;
}

export interface FileData {
  id: number;
  original_name: string;
  size: number;
  mime_type: string;
  created_at: string;
  url: string;
  file_type_name: string;
  file_type_code: string;
}

// Get all file types
export const getAllFileTypes = async (): Promise<FileType[]> => {
  return apiGet('/files/types', 'Failed to fetch file types');
};

// Get file types by category
export const getFileTypesByCategory = async (category: string): Promise<FileType[]> => {
  return apiGet(`/files/types/category/${category}`, `Failed to fetch file types for category ${category}`);
};

// Create a new file type
export const createFileType = async (fileType: Omit<FileType, 'id' | 'created_at' | 'updated_at'>): Promise<FileType> => {
  return apiPost('/files/types', fileType, 'Failed to create file type');
};

// Delete a file type
export const deleteFileType = async (id: number): Promise<{ success: boolean }> => {
  return apiDelete(`/files/types/${id}`, `Failed to delete file type ${id}`);
};

// Get files for an entity
export const getEntityFiles = async (entityType: string, entityId: number | string, category?: string): Promise<FileData[]> => {
  const url = category
    ? `/files/${entityType}/${entityId}/${category}`
    : `/files/${entityType}/${entityId}`;
  
  return apiGet(url, `Failed to fetch files for ${entityType} ${entityId}`);
};

// Delete a file
export const deleteFile = async (fileId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/files/id/${fileId}`, `Failed to delete file ${fileId}`);
};

// Upload a file (special case, needs FormData and upload progress)
export const uploadFile = async (
  entityType: string,
  entityId: number | string,
  category: string,
  fileTypeCode: string,
  file: File,
  onUploadProgress?: (progress: number) => void
): Promise<FileData> => {
  const formData = new FormData();
  formData.append('file', file);

  // Use custom implementation for file uploads to handle progress
  const token = getAuthToken();
  
  const urlPath = `/files/upload/${entityType}/${entityId}/${category}/${fileTypeCode}`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || ''}/api${urlPath}`);
    
    // Debug authentication
    console.log('Upload request details:', {
      url: `${import.meta.env.VITE_API_URL || ''}/api${urlPath}`,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
    });
    
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    } else {
      console.warn('No authentication token found - this may cause a 401/405 error');
    }
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onUploadProgress) {
        const progress = Math.round((e.loaded * 100) / e.total);
        onUploadProgress(progress);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        // Enhanced error handling for debugging
        let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`;
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage = errorResponse.error || errorResponse.message || errorMessage;
        } catch (e) {
          // If response isn't JSON, include the raw response text for debugging
          if (xhr.responseText) {
            errorMessage += ` - Response: ${xhr.responseText.substring(0, 200)}`;
          }
        }
        
        console.error('Upload failed:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          url: `${import.meta.env.VITE_API_URL || ''}/api${urlPath}`
        });
        
        reject(new Error(errorMessage));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error during file upload'));
    };
    
    xhr.send(formData);
  });
};

// Assign temporary files to an entity
export const assignTemporaryFiles = async (
  entityType: string,
  entityId: number | string
): Promise<{ message: string; updatedCount: number }> => {
  return apiPost(`/files/assign/${entityType}/${entityId}`, {});
}; 