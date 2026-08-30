"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return <html lang="en"><body><main className="app-error-page"><section><p>Sentinel is unavailable</p><h1>Something prevented the app from loading.</h1><span>Please try again in a moment.</span><div><button type="button" onClick={reset}>Try again</button></div></section></main></body></html>;
}
