const FAVICON_CDN = "https://Pull-Video-Load.b-cdn.net/logo/SPLARGE.png";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  async rewrites() {
    return [
      // Serve favicon from our domain so tabs and Google get it everywhere (larger asset for crisp tabs)
      { source: "/favicon.ico", destination: FAVICON_CDN },
      { source: "/icon.png", destination: FAVICON_CDN },
      { source: "/apple-touch-icon.png", destination: FAVICON_CDN },
    ];
  },
};

export default nextConfig;

