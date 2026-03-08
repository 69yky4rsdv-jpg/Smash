const FAVICON_CDN = "https://Pull-Video-Load.b-cdn.net/logo/SP.png";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  async rewrites() {
    return [
      // Serve favicon from our domain so tabs and Google get it everywhere
      { source: "/favicon.ico", destination: FAVICON_CDN },
      { source: "/icon.png", destination: FAVICON_CDN },
    ];
  },
};

export default nextConfig;

