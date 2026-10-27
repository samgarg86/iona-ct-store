# Iona Store

A small commercetools storefront built with Next.js (App Router) and TypeScript: product listing page (PLP), product detail page (PDP) and cart.

## Setup

1. Create a commercetools project (free trial works) with the **B2C sample data**.
2. In Merchant Center, go to **Settings > Developer settings** and create an API client.
3. Copy `.env.example` to `.env.local` and fill in the client's credentials.
4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000.

## Structure

```
src/
  app/                    routes (server components by default)
  lib/env.ts              validated server-side config
  lib/commercetools/      SDK client and data access (server-only)
```

All commercetools calls happen on the server. Credentials never reach the browser.
