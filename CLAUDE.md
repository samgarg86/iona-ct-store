# Iona Store

Take-home assignment for IONA Commerce. Full brief: `docs/assignment.pdf` (gitignored).

## Requirements (from the brief)

- Next.js + TypeScript, commercetools 60-day trial project with sample data
- PLP: list of products
- PDP: product details, add to cart
- Cart: remove item, update quantity
- Use Next.js routing/navigation
- Product data must be fetched server-side in Server Components
- UI/UX polish is encouraged; reviewers judge clean, high-quality code and UX
- Delivered as a private GitHub repo; reviewers get the commercetools credentials, so the README setup must work from a fresh clone

## Conventions

- All commercetools access goes through `src/lib/commercetools/` and is `server-only`
- Config comes from `src/lib/env.ts`; never read `process.env` elsewhere
- commercetools responses are mapped to `src/lib/types.ts` in `mappers.ts`; UI never imports SDK types
- Next.js 16 App Router with `cacheComponents`: catalog fetchers use `'use cache'` + `cacheLife`; anything reading `searchParams`/`cookies` sits inside `<Suspense>`. Check `node_modules/next/dist/docs/` before using unfamiliar Next APIs
- Use the Product Search API (`apiRoot.products().search()`), not `productProjections().search()`
- The commercetools plugin (skills + Knowledge MCP) is installed locally; use it to confirm API details
- Keep `npm run lint` warning-free (e.g. no `a && fn()` statements)

## Project state

- Store context: `en-US` / `USD` / `US`. The sample data has no Finland prices or `en-FI` locale, so a Finland store would need data changes (decided against for now)
- API client has `manage_orders`, so carts can be server-side (cart ID in an httpOnly cookie). Before submitting, create a narrower client for reviewers
- Done: PLP at `/products` (category filter, search, sort, pagination) on branch `feat/plp`
- Next: PDP at `/p/[slug]` with add to cart, then cart page (remove item, update quantity), then polish the home page

## Workflow

- One feature branch + PR per feature, so the user can review. `gh` is not installed; open PRs via the app or GitHub
- Don't add design-rationale notes to the README unless asked
- Dev server: `npm run dev` on port 3000
