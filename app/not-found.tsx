import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page Not Found | NEFRA', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="on-dark flex min-h-[60svh] items-center bg-emerald text-ivory">
      <div className="container-site py-24 text-center">
        <span className="eyebrow">404</span>
        <h1 className="text-h1 text-ivory">This Page Has Been Lost to History</h1>
        <p className="mx-auto mt-5 max-w-lg text-lead text-stone">The page you&rsquo;re looking for doesn&rsquo;t exist. Let&rsquo;s get you back to the table.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="/" className="btn btn-light">Return Home</a>
          <a href="/menu/" className="btn btn-outline-light">View the Menu</a>
        </div>
      </div>
    </section>
  );
}
