'use client';

import { useEffect, useRef, useState } from 'react';

/** Muted looping hero video. Never autoplays for reduced-motion users; always pausable (WCAG 2.2.2). */
export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current?.play().catch(() => {});
  }, []);
  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster || undefined}
        aria-hidden="true"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={() => (paused ? ref.current?.play() : ref.current?.pause())}
        aria-pressed={paused}
        className="absolute bottom-6 right-[max(1rem,env(safe-area-inset-right))] z-10 grid h-11 w-11 place-items-center rounded-full border border-ivory/60 bg-charcoal/50 text-ivory"
      >
        <span className="sr-only">{paused ? 'Play background video' : 'Pause background video'}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
        </svg>
      </button>
    </>
  );
}
