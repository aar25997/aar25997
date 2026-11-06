'use client';

import { useId } from 'react';
import { useFormSubmit } from './useFormSubmit';

/** Email signup for opening news, launches, events and offers. */
export function NewsletterForm({ endpoint, source, instagram, tone = 'dark', privacyHref = '/privacy-policy/' }: {
  endpoint: string;
  source: string;
  instagram: string;
  tone?: 'dark' | 'light';
  privacyHref?: string;
}) {
  const id = useId();
  const { status, onSubmit } = useFormSubmit({
    endpoint,
    event: 'sign_up',
    success: "Thank you. You're on the list, and we'll be in touch before we open.",
    notConfigured: `Our email list isn't connected yet, so we couldn't add you. Follow ${instagram} on Instagram for opening news in the meantime.`,
  });
  const dark = tone === 'dark';
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Your email address"
          className={`min-h-13 flex-1 rounded-card border px-4 text-base outline-none transition ${dark ? 'border-ivory/50 bg-ivory/10 text-ivory placeholder:text-stone focus:border-ivory focus:bg-ivory/15' : 'border-stone bg-white text-charcoal placeholder:text-muted focus:border-emerald'}`}
        />
        <button type="submit" className={`btn ${dark ? 'btn-light' : 'btn-primary'} min-h-13`} disabled={status.kind === 'sending'}>
          Sign Up
        </button>
      </div>
      <p role="status" aria-live="polite" className={`mt-3 min-h-6 text-[0.92rem] ${status.kind === 'error' ? (dark ? 'text-[#F6D7CB]' : 'text-error') : dark ? 'text-ivory' : 'text-emerald'}`}>
        {status.message}
      </p>
      <p className={`text-[0.8rem] ${dark ? 'text-stone' : 'text-muted'}`}>
        Opening news, new dishes, events and occasional offers. Unsubscribe anytime. See our{' '}
        <a href={privacyHref} className={dark ? 'text-ivory underline' : 'text-emerald underline'}>Privacy Policy</a>.
      </p>
    </form>
  );
}
