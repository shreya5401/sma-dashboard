'use client';

import * as React from 'react';

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

  React.useEffect(() => {
    if (!keyword) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ keyword, ...extraParams });
    fetch(`${API_BASE}/api/${endpoint}?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [endpoint, keyword, JSON.stringify(extraParams)]);

  return { data, loading, error };
}
