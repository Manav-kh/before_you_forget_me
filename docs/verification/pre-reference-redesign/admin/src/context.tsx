import { createContext, useContext } from 'react';
import type { AdminSession } from '@byfm/contracts';
import { request } from './api';

export type StudioContextValue = { session: AdminSession; notify: (message: string) => void; mutate: <T>(path: string, method: string, body?: unknown) => Promise<T> };
export const StudioContext = createContext<StudioContextValue | null>(null);
export function useStudio() { const value = useContext(StudioContext); if (!value) throw new Error('Studio session required.'); return value; }
export function makeMutation(csrf: string) { return <T,>(path: string, method: string, body?: unknown) => request<T>(path, { method, body, csrf }); }
