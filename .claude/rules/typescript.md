---
globs: "**/*.ts,**/*.tsx"
---

# TypeScript rules

- Always use strict mode
- Prefer `interface` over `type` for object shapes
- Never use `any` — use `unknown` and narrow with type guards
- All API responses must be validated with Zod schemas
- Use barrel exports from `index.ts` in each directory
- Server-only code goes in files named `*.server.ts` or inside server actions
- Client components must have `"use client"` directive at top
- Keep components under 150 lines — extract hooks and utilities
