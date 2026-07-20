'use client';

import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

/**
 * True only after the component has mounted in the browser. Used to defer
 * `createPortal` calls (document.body doesn't exist during SSR) without the
 * `useState(false) + useEffect(() => setState(true))` pattern, which trips
 * the react-hooks set-state-in-effect rule.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
