import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  StringsService,
  type CreateTennisStringRequest,
  type UpdateTennisStringRequest,
} from '@/api';

// Query Keys
export const stringKeys = {
  all: ['strings'] as const,
  detail: (id: string) => ['strings', id] as const,
  usage: (id: string) => ['strings', id, 'usage'] as const,
};

export function useStrings() {
  return useQuery({
    queryKey: stringKeys.all,
    queryFn: () => StringsService.getApiStrings(),
  });
}

export function useString(id: string) {
  return useQuery({
    queryKey: stringKeys.detail(id),
    queryFn: () => StringsService.getApiStrings1(id),
    enabled: !!id,
  });
}

export function useStringUsage(id: string) {
  return useQuery({
    queryKey: stringKeys.usage(id),
    queryFn: () => StringsService.getApiStringsUsage(id),
    enabled: !!id,
  });
}

export function useCreateString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTennisStringRequest) =>
      StringsService.postApiStrings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stringKeys.all });
    },
  });
}

export function useUpdateString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTennisStringRequest }) =>
      StringsService.putApiStrings(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: stringKeys.all });
      queryClient.invalidateQueries({ queryKey: stringKeys.detail(id) });
    },
  });
}

export function useDeleteString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StringsService.deleteApiStrings(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stringKeys.all });
    },
  });
}

export function useRemoveString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StringsService.postApiStringsRemove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: stringKeys.all });
      queryClient.invalidateQueries({ queryKey: stringKeys.detail(id) });
    },
  });
}
