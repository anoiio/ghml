# Cyberpunk Theme — Design Spec

**Date:** 2026-05-02  
**Status:** Approved  
**Scope:** GHML renderer (`renderer/src/`)

---

## Problem

The renderer has a single clean white/gray theme. The GHML concept — links that dispatch LLM prompts and generate reality in real time — has a natural cyberpunk character. Users should be able to switch to a full Neo-Noir/Neon visual style.

---

## Design

### Theme model

- Two themes: `'clean'` (existing) and `'cyberpunk'`
- Stored in `localStorage['ghml-theme']`, default `'clean'`
- Applied as `data-theme="cyberpunk"` attribute on the root `<div>` in `App.tsx`
- CSS in `index.css` uses `[data-theme="cyberpunk"]` selectors — no `!important`, higher specificity wins

### Color palette — Cyberpunk (Neo-Noir/Neon)

| Role | Value |
|---|---|
| Page background | `#08080f` |
| Surface (header, modal) | `#0d0d1a` |
| Border / glow | `rgba(0, 255, 255, 0.15)` |
| Primary text | `#b0cce0` |
| Muted text | `#4a6070` |
| Headings | `#00ffff` (cyan), monospace font |
| `[render]` links | cyan (`#00ffff`) |
| `[nav]` links | magenta / fuchsia (`#ff00ff`) |
| `[action]` links | neon green (`#00ff88`) |
| `[embed]` links | yellow (`#ffee00`) |
| Code text | `#00ff41` |
| Code background | `#010108` |

### CSS scope — what changes in cyberpunk mode

All overrides live in `src/index.css` under `[data-theme="cyberpunk"]`:

- **Page:** background, text color, scrollbar (if styled)
- **Header:** dark surface, cyan border, logo badge color
- **Content (`.ghml-content`):** headings → cyan + monospace; paragraphs → `#b0cce0`; `code` → green-on-dark; `pre` → dark bg + faint cyan border; `table` headers → cyan; `hr` → faint cyan; `blockquote` → cyan left border
- **Settings modal:** dark surface, cyan border
- **Source view (`pre.source-view`):** near-black bg, cyan border, green text
- **Buttons (Source, Load .ghml, Settings):** dark bg, cyan border/text

### GHML link buttons

`GHMLLink` receives a `theme: 'clean' | 'cyberpunk'` prop and switches between two color maps:

```typescript
const TYPE_COLORS_CYBERPUNK = {
  render: 'border-cyan-400/50 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/50',
  nav:    'border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-950/20 hover:bg-fuchsia-950/50',
  action: 'border-green-400/50 text-green-300 bg-green-950/20 hover:bg-green-950/50',
  embed:  'border-yellow-400/50 text-yellow-300 bg-yellow-950/20 hover:bg-yellow-950/50',
};
```

Disabled state in cyberpunk: `opacity-30 cursor-not-allowed`.

### Settings modal UI

Add a **Theme** row at the top of Settings (above Provider), same radio-button pattern:

```
Theme:  ● Clean   ○ Cyberpunk
```

`onSave` signature extends to include `theme`:
```typescript
onSave(theme: Theme, provider: Provider, apiKey: string, vars: Record<string, unknown>)
```

### Type definition

```typescript
export type Theme = 'clean' | 'cyberpunk';
```

Exported from a new `src/types.ts` (avoids circular imports between App ↔ components).

---

## Files Modified

| File | Change |
|---|---|
| `src/types.ts` | New — exports `Theme` type |
| `src/index.css` | Add `[data-theme="cyberpunk"]` CSS block |
| `src/App.tsx` | `theme` state + localStorage + `data-theme` on root div; pass to Settings + GHMLViewer |
| `src/components/Settings.tsx` | Theme radio row; `theme` in `onSave` |
| `src/components/GHMLViewer.tsx` | Pass `theme` to GHMLLink |
| `src/components/GHMLLink.tsx` | `theme` prop + cyberpunk color map |

---

## Verification

1. `npm run dev`
2. Settings → Theme: Cyberpunk → Save → full page goes dark with neon accents
3. Click a `[render]` link — cyan button, response renders in dark document with cyan headings
4. Click `[action]` link — green inline result on dark background
5. Settings → Theme: Clean → Save → reverts to original white/gray design
6. Refresh page → theme persists from localStorage
7. `npx tsc --noEmit` passes
