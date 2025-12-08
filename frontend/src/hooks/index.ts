// Auth hooks
export { useAuth } from './useAuth';

// Session hooks
export {
  useSessions,
  useSession,
  useSessionWithString,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  sessionKeys,
} from './useSessions';

// String hooks
export {
  useStrings,
  useString,
  useStringUsage,
  useCreateString,
  useUpdateString,
  useDeleteString,
  useRemoveString,
  stringKeys,
} from './useStrings';

// Legacy export for backwards compatibility
export const queryKeys = {
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,
  sessionWithString: (id: string) => ['sessions', id, 'with-string'] as const,
  strings: ['strings'] as const,
  string: (id: string) => ['strings', id] as const,
  stringUsage: (id: string) => ['strings', id, 'usage'] as const,
};
