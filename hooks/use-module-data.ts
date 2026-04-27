'use client';

import * as React from 'react';
import { useAuth } from '@clerk/nextjs';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function useModuleData<T>(
  endpoint: string,
  keyword: string,
  fallback: T,
  extraParams?: Record<string, string>,
): { data: T; loading: boolean; error: string | null } {
  const [data, setData] = React.useState<T>(fallback);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { getToken } = useAuth();

  React.useEffect(() => {
    if (!keyword) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ keyword, ...extraParams });

    async function fetchData() {
      try {
        const token = await getToken();
        const r = await fetch(`${API_BASE}/api/${endpoint}?${params}`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        setData(d);
        setLoading(false);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message);
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, [endpoint, keyword, JSON.stringify(extraParams), getToken]);

  return { data, loading, error };
}
