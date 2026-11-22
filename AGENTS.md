# Speak Freely — agent notes

Personal PWA for stuttering practice based on Lee Lovett's *Stop Stuttering Short Course*.
Design: `docs/plans/2026-11-22-stop-stuttering-app-design.md`.

## Commands

- `npm run dev` — dev server
- `npm test` — Vitest (jsdom + fake-indexeddb)
- `npm run build` — `tsc -b` + Vite build (PWA). `BASE_PATH=/<repo>/` for GitHub Pages
- `npm run lint` — oxlint

Verify with test, build, and lint before committing.

## Conventions

- All UI text and content in English. Affirmations: present tense, positive, short; no negative statements.
- Data is local only (IndexedDB via `src/lib/storage.ts`). No backend.
- Built-in content lives in `src/content/`, low-level helpers in `src/lib/`, pages in `src/features/`.
- Deploy: `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main`.
