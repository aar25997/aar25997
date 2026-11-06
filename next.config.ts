import type { NextConfig } from 'next';

// Static export: every page is pre-rendered to HTML at build time (good for SEO and
// speed) and can be hosted on any static host or CDN. Output goes to out/.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }, // responsive images come from scripts/optimize-images.mjs
  poweredByHeader: false,
};

export default nextConfig;
