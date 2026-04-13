import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static HTML export — generates the `out/` directory on `next build`
  // Cloudflare Pages: set build command to `next build`, output dir to `out`
  output: 'export',

  // Required for static export: disables Next.js image optimisation
  // (Cloudflare Pages doesn't run a Node server to optimise images at runtime)
  images: {
    unoptimized: true,
  },

  // Optional: if you deploy to a subdirectory, set basePath and assetPrefix
  // basePath: '/my-subdir',
  // assetPrefix: '/my-subdir',
}

export default nextConfig
