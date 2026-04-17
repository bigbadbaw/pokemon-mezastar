---
globs: "src/components/**/*.tsx,src/app/**/*.tsx"
---

# React component rules

- All components are functional with hooks — no class components
- Every component that accepts props must have a named interface (e.g. `interface CardResultProps`)
- Always handle three states: loading, error, and success
- Use Tailwind CSS classes — no inline styles or CSS modules
- Touch targets must be minimum 44x44px (iPad)
- Use `next/image` for all images with proper width/height/alt
- Animations: prefer CSS transitions over JS. Keep under 300ms for interactions
- Accessibility: every interactive element needs aria labels, images need alt text
