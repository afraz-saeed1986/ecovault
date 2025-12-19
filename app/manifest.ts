import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EcoVault – Sustainable E-Commerce Platform',          // مثلاً "My Awesome App"
    short_name: 'EcoVault',                 // مثلاً "MyApp"
    description: 'A full-stack sustainable e-commerce platform built with Next.js 16',
    start_url: '/',                         // صفحه شروع (نسبت به basePath اگر داری)
    display: 'standalone',                  // مثل اپ native نمایش داده شود
    background_color: '#ffffff',             // رنگ پس‌زمینه هنگام لود
    theme_color: '#05400aff',                  // رنگ تم (برای status bar)
    orientation: 'portrait',                 // یا 'any'
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '388x388',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',            // maskable برای اندروید بهتر است
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  };
}