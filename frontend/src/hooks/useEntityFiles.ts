import { useQuery, UseQueryResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEntityFiles, deleteFile, FileData } from '@/apiClient/filesApi';

export const filesQueryKey = (entityType: string, entityId?: number | string, category?: string) =>
  ['entityFiles', entityType, entityId, category];

export const useEntityFiles = (
  entityType: string,
  entityId?: number | string,
  category?: string
): UseQueryResult<FileData[], unknown> => {
  return useQuery<FileData[]>({
    queryKey: filesQueryKey(entityType, entityId, category),
    queryFn: () => getEntityFiles(entityType, entityId!, category),
    enabled: !!entityId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDeleteFile = (
  entityType: string,
  entityId?: number | string,
  category?: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: number) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey(entityType, entityId, category) });
    },
  });
};

