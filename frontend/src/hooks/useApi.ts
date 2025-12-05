import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SessionsService, 
  StringsService,
  type TennisSession,
  type TennisString,
  type CreateTennisSessionRequest,
  type UpdateTennisSessionRequest,
  type CreateTennisStringRequest,
  type UpdateTennisStringRequest,
} from '../api';

// Query Keys
export const queryKeys = {
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,
  sessionWithString: (id: string) => ['sessions', id, 'with-string'] as const,
  strings: ['strings'] as const,
  string: (id: string) => ['strings', id] as const,
  stringUsage: (id: string) => ['strings', id, 'usage'] as const,
};

// Sessions Hooks
export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => SessionsService.getApiSessions(),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: queryKeys.session(id),
    queryFn: () => SessionsService.getApiSessions1(id),
    enabled: !!id,
  });
}

export function useSessionWithString(id: string) {
  return useQuery({
    queryKey: queryKeys.sessionWithString(id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTennisSessionRequest }) =>
      SessionsService.putApiSessions(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.session(id) });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SessionsService.deleteApiSessions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

// Strings Hooks
export function useStrings() {
  return useQuery({
    queryKey: queryKeys.strings,
    queryFn: () => StringsService.getApiStrings(),
  });
}

export function useString(id: string) {
  return useQuery({
    queryKey: queryKeys.string(id),
    queryFn: () => StringsService.getApiStrings1(id),
    enabled: !!id,
  });
}

export function useStringUsage(id: string) {
  return useQuery({
    queryKey: queryKeys.stringUsage(id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.strings });
    },
  });
}

export function useUpdateString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTennisStringRequest }) =>
      StringsService.putApiStrings(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strings });
      queryClient.invalidateQueries({ queryKey: queryKeys.string(id) });
    },
  });
}

export function useDeleteString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StringsService.deleteApiStrings(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strings });
    },
  });
}

export function useRemoveString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StringsService.postApiStringsRemove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strings });
      queryClient.invalidateQueries({ queryKey: queryKeys.string(id) });
    },
  });
}

export function useRestoreString() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => StringsService.postApiStringsRestore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strings });
      queryClient.invalidateQueries({ queryKey: queryKeys.string(id) });
    },
  });
}
