import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Використовуємо static export тільки для production build
  // В dev режимі це викликає проблеми з chunk завантаженням
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
