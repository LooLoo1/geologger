This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Project Structure

This project follows **Feature-Sliced Design (FSD)** architecture:

```
apps/frontend/
├── app/              # Next.js app directory (pages, layout, providers)
├── entities/         # Business entities (user, location)
├── features/         # Business features (auth, location logging)
├── widgets/          # Complex UI blocks (location-logger, route-map)
└── shared/           # Shared resources
    ├── api/          # API client (axios-based)
    ├── config/       # Configuration
    └── lib/          # Utilities (map providers, storage, query client)
```

### Map Providers

The project supports multiple map providers with a pluggable architecture:

- **Leaflet** (default) - Open-source, no API key required
- **Google Maps** - Requires API key

You can switch providers via environment variable `NEXT_PUBLIC_MAP_PROVIDER`:
- `leaflet` (default)
- `google-maps`

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MAP_PROVIDER=leaflet
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here  # Optional, only for Google Maps
```

To get a Google Maps API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:1420](http://localhost:1420) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
