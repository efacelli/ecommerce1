import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Permite cualquier dominio externo — útil para maqueta/demo
    // En producción reemplazar por dominios específicos
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
};

export default nextConfig;
