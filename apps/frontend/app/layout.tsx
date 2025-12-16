import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GeoLogger - Location Tracker",
  description: "Track your location with offline support",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GeoLogger",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Script id="service-worker-register" strategy="lazyOnload">
          {`
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              // Only register in production or if explicitly enabled
              const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              const enableSW = !isDev || window.localStorage.getItem('enable_sw') === 'true';
              
              if (enableSW) {
                // Register service worker after page load to avoid blocking
                window.addEventListener('load', () => {
                  // Small delay to ensure page is fully loaded
                  setTimeout(() => {
                    navigator.serviceWorker
                      .register('/sw.js', { scope: '/' })
                      .then((registration) => {
                        console.log('Service Worker registered:', registration);
                      })
                      .catch((error) => {
                        console.warn('Service Worker registration failed (non-critical):', error);
                      });
                  }, 100);
                });
              } else {
                // Unregister any existing service workers in dev mode
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  registrations.forEach((registration) => {
                    registration.unregister().then(() => {
                      console.log('Service Worker unregistered for dev mode');
                    });
                  });
                });
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}
