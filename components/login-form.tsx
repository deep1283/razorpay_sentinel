"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const client = createBrowserSupabaseClient();
    if (!client) { setError("Add your Supabase URL and anon key to .env.local before signing in."); setLoading(false); return; }
    const { error: authError } = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (authError) { setError(authError.message); setLoading(false); return; }
    router.replace("/dashboard"); router.refresh();
  }
  return <main className="auth-page"><div className="auth-orbit one"/><div className="auth-orbit two"/><section className="auth-card"><Link href="/" className="auth-brand"><span>◈</span> Sentinel</Link><p className="auth-eyebrow">MERCHANT INVESTIGATOR ACCESS</p><h1>Review signals.<br/><em>Keep control.</em></h1><p className="auth-copy">Sign in to your merchant workspace. Sentinel is observation-only: it prioritizes cases but never changes customer outcomes.</p><form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@merchant.com"/></label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="••••••••"/></label>{error && <p className="auth-error" role="alert">{error}</p>}<button disabled={loading}>{loading ? "Signing in…" : "Sign in to workspace"} <span>→</span></button></form><p className="auth-foot">Supabase Auth · Encrypted session handling</p></section><aside className="auth-aside"><div className="auth-signal">5 <span>accounts</span></div><div className="auth-lines"><i/><i/><i/><i/></div><p>Independent at first glance.<br/><b>Connected under investigation.</b></p><small>READ-ONLY RISK INTELLIGENCE</small></aside></main>;
}
