'use client';

import { useEffect } from 'react';

// Strips a one-shot query param (e.g. ?saved=1) from the URL bar after it's
// been read for the success banner, so reloading the list page doesn't
// keep re-showing a stale "saved" confirmation.
export function ClearQueryParam({ param }: { param: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(param)) return;
    url.searchParams.delete(param);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }, [param]);

  return null;
}
