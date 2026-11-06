'use client';

import { useState } from 'react';

type Status = { kind: 'idle' | 'sending' | 'success' | 'error'; message: string };

/**
 * Shared submit logic. Posts FormData to the configured endpoint (Formspree, Getform,
 * Basin, an email provider's form URL, or your own API). With no endpoint configured
 * it says so plainly: nothing is ever reported as sent unless the endpoint accepted it.
 */
export function useFormSubmit({ endpoint, notConfigured, success, event }: { endpoint: string; notConfigured: string; success: string; event: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    let firstBad: HTMLInputElement | HTMLTextAreaElement | null = null;
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not([type=hidden]), textarea').forEach((f) => {
      const bad = !f.checkValidity();
      f.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      (firstBad as HTMLElement).focus();
      setStatus({ kind: 'error', message: 'Please check the highlighted fields. A valid email address is required.' });
      return;
    }
    if (!endpoint) {
      setStatus({ kind: 'error', message: notConfigured });
      return;
    }
    setStatus({ kind: 'sending', message: 'Sending…' });
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      window.gtag?.('event', event);
      setStatus({ kind: 'success', message: success });
    } catch {
      setStatus({ kind: 'error', message: 'Something went wrong and your message was not sent. Please try again in a moment.' });
    }
  }

  return { status, onSubmit };
}

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }
}
