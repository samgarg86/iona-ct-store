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
