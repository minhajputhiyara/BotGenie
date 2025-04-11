import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'media.istockphoto.com',
      'upload.wikimedia.org',
      'via.placeholder.com',
      'www.cio.com', // Added this domain
    ],
  },
};

export default nextConfig;
