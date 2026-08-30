"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return <main className="app-error-page"><section><p>Something went wrong</p><h1>We could not load this page.</h1><span>Please try again. If the problem continues, return to Sentinel&apos;s dashboard.</span><div><button type="button" onClick={reset}>Try again</button><Link href="/dashboard">Go to dashboard</Link></div></section></main>;
}
