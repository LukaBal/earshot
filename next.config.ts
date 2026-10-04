import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app runs on 127.0.0.1 (Spotify requires it for redirect URIs); dev mode only trusts localhost by default.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Spotify album / artist art
    remotePatterns: [
      { protocol: "https", hostname: "**.scdn.co" },
      { protocol: "https", hostname: "**.spotifycdn.com" },
    ],
  },
};

export default nextConfig;
