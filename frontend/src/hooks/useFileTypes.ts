import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllFileTypes, getFileTypesByCategory, FileType } from '@/apiClient/filesApi';

export const useFileTypes = (category?: string): UseQueryResult<FileType[], unknown> => {
  const enabled = category === undefined || !!category;
  return useQuery<FileType[]>({
    queryKey: category ? ['fileTypes', category] : ['fileTypes', 'all'],
    queryFn: async () => {
      if (!category) {
        return getAllFileTypes();
      }
      // Normalize any temp suffixes used during drafts (e.g., "-hotels-temp")
      const cleanCategory = category.replace(/-[^-]+-temp$/, '');
      return getFileTypesByCategory(cleanCategory);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDefaultFileTypeCode = (fileTypes?: FileType[], initialCode?: string): string => {
  if (initialCode) return initialCode;
  if (fileTypes && fileTypes.length > 0) return fileTypes[0].code;
  return '';
};

