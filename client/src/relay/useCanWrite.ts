import { useSyncExternalStore } from 'react';
import { getSessionSnapshot, subscribeSession } from '@/lib/session';

export function useCanWrite() {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot).canWrite;
}
