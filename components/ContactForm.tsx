'use client';

import { useFormSubmit } from './useFormSubmit';

export function ContactForm({ endpoint, instagram, cateringEnabled }: { endpoint: string; instagram: string; cateringEnabled: boolean }) {
  const { status, onSubmit } = useFormSubmit({
    endpoint,
    event: 'generate_lead',
    success: "Thank you. Your message was sent and we'll reply soon.",
    notConfigured: `Our contact form isn't connected yet, so this message was not sent. Please message us on Instagram at ${instagram}.`,
  });
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div>
        <label htmlFor="contact-name" className="field-label">Name</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required className="field-input" />
      </div>
      <div>
        <label htmlFor="contact-email" className="field-label">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required className="field-input" />
      </div>
      <div>
        <label htmlFor="contact-topic" className="field-label">Topic</label>
        <select id="contact-topic" name="topic" className="field-input">
          <option>General question</option>
          <option>{cateringEnabled ? 'Catering' : 'Catering (future interest)'}</option>
          <option>Partnerships &amp; press</option>
          <option>Careers</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="field-label">Message</label>
        <textarea id="contact-message" name="message" rows={5} required className="field-input" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={status.kind === 'sending'}>Send Message</button>
      </div>
      <p role="status" aria-live="polite" className={`min-h-6 text-[0.95rem] ${status.kind === 'error' ? 'text-error' : 'text-emerald'}`}>
        {status.message}
      </p>
    </form>
  );
}
