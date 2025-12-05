import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SessionsService,
  type CreateTennisSessionRequest,
  type UpdateTennisSessionRequest,
} from '@/api';

// Query Keys
export const sessionKeys = {
  all: ['sessions'] as const,
  detail: (id: string) => ['sessions', id] as const,
  withString: (id: string) => ['sessions', id, 'with-string'] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: () => SessionsService.getApiSessions(),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => SessionsService.getApiSessions1(id),
    enabled: !!id,
  });
}

export function useSessionWithString(id: string) {
  return useQuery({
    queryKey: sessionKeys.withString(id),
    queryFn: () => SessionsService.getApiSessionsWithString(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTennisSessionRequest) => 
      SessionsService.postApiSessions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTennisSessionRequest }) =>
      SessionsService.putApiSessions(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SessionsService.deleteApiSessions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}
