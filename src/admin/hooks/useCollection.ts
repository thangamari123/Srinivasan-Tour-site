import { useEffect, useState } from 'react';
import { backend } from '../data/backend';
import { errorMessage } from '../services/content';

interface Options {
  orderBy?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
}

/** Realtime subscription to a whole collection (admins can read every document). */
export function useCollection<T extends { id: string }>(name: string, options: Options = {}) {
  const { orderBy, direction = 'asc', limit } = options;
  const [reloadKey, setReloadKey] = useState(0);
  const subKey = `${name}|${orderBy ?? ''}|${direction}|${limit ?? ''}|${reloadKey}`;
  const [state, setState] = useState<{ key: string; data: T[]; error: string | null }>({
    key: '',
    data: [],
    error: null,
  });

  useEffect(() => {
    let active = true;
    const unsub = backend().subscribe(
      name,
      { orderBy, direction, limit },
      (docs) => {
        if (active) setState({ key: subKey, data: docs as unknown as T[], error: null });
      },
      (err) => {
        if (active) setState((s) => ({ ...s, key: subKey, error: errorMessage(err) }));
      },
    );
    return () => {
      active = false;
      unsub();
    };
  }, [name, orderBy, direction, limit, subKey]);

  return {
    data: state.data,
    loading: state.key !== subKey,
    error: state.key === subKey ? state.error : null,
    reload: () => setReloadKey((k) => k + 1),
  };
}
