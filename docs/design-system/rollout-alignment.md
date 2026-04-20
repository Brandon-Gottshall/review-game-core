# Rollout Alignment — this spec vs shipped `theme.css`

Spot check: does the shipped [`review-game-core/theme.css`](../../theme.css) match the design tokens and focus treatments this spec family committed to? Where it diverges, is the divergence intentional? This doc records the reconciliation for future audits.

**Consumers:** UX and the fork agent. Read this before changing either the spec or the preset.

---

## 1. Summary

| Area | Aligned | Divergences |
|---|---|---|
| Color tokens | ✅ Values match | Naming convention changed (`--bg` → `--rg-brand` / `--color-surface`) |
| Typography | ✅ Scale matches | Font family still defaulted to Avenir Next — the open decision in `tokens.md` §3 is still open |
| Spacing | ⚠️ Partial | Different scale model — `tokens.md` lists named pixel steps; `theme.css` uses rem-based `--spacing-1..12` on the Tailwind spacing convention |
| Radius | ✅ Semantically aligned | Preset uses `--radius-sm/md/lg/pill`; spec listed more named steps (xs, sm, md, lg, xl, 2xl, full). Preset covers the core cases |
| Shadow | ✅ Aligned | Renamed `--shadow-soft/strong` → `--shadow-elevation-1/2` |
| Motion | ✅ Aligned | Added explicit `--ease-standard` cubic-bezier vs the CSS-default `ease` — preset is stricter/better |
| Focus-visible | ⚠️ Unified not hybrid | Spec recommended category-based hybrid (outline for inputs, box-shadow for surfaces); preset applies both universally. Preset is simpler and adequate |
| Learning-panel-heading dark | ✅ `#d4e07a` | Matches |

**Net:** spec and preset are substantively aligned. The naming divergences are deliberate (Tailwind v4 tokens use `--color-*` / `--rg-*` conventions to avoid clashing with Tailwind's own vars). Update the spec to reference the preset's names where appropriate.

---

## 2. Color token naming reconciliation

Spec used the current-apps naming (`--bg`, `--surface`, `--text`, etc.). Preset introduces a two-layer model:

- `--rg-*` — **runtime CSS variables** toggled by `data-theme` attribute (light / dark). These are the raw color values.
- `--color-*` — **Tailwind @theme variables** that reference `--rg-*`. These are what Tailwind utility classes resolve against.

This indirection is good — it lets themes switch at runtime (by flipping `data-theme`) without rebuilding Tailwind. The runtime vars are the stable contract; the Tailwind vars are the build contract.

### Rename map

| `tokens.md` name | `theme.css` runtime var | `theme.css` Tailwind var | Notes |
|---|---|---|---|
| `--bg` | (not in preset) | — | Preset has `--rg-background` as a gradient, not a flat fill |
| `--surface` | `--rg-surface` | `--color-surface` | |
| `--surface-2` | `--rg-surface-raised` | `--color-surface-raised` | Renamed for semantic clarity |
| `--text` | `--rg-text` | `--color-text` | |
| `--muted` | `--rg-muted` | `--color-muted` | |
| `--accent` | `--rg-accent` | `--color-accent` | |
| `--accent-2` | `--rg-accent-2` | `--color-accent-2` | |
| `--accent-contrast` | (not in preset) | — | Preset omits; reintroduce if components need it |
| `--good` / `--bad` | `--rg-good` / `--rg-bad` | `--color-good` / `--color-bad` | |
| `--border` | `--rg-border` | `--color-border` | |
| `--learning-panel-*` | `--rg-learning-panel-*` | `--color-learning-panel-*` | |
| `--warn` (new in preset) | `--rg-warn` | `--color-warn` | Spec called this `--warning-text`; preset generalizes |
| `--accent-soft` (spec §1.10) | `--rg-focus-ring` | — | Preset renamed; see §5 |

### Tokens `tokens.md` listed that are NOT in the preset yet

The preset covers the most-used tokens but hasn't ported the long tail of panel-specific vars (`--stage-panel-*`, `--tutor-panel-*`, `--signal-panel-*`, `--step-*`, `--choice-*`, `--walkthrough-*`, `--ordered-*`, `--inline-note-*`, `--theme-toggle-*`, etc.). These still exist in each app's per-app `globals.css` as escape-hatch rules.

**Recommendation:** port these into `theme.css` in the same two-layer pattern (`--rg-*` + `--color-*`) as components that consume them move into `review-game-core/ui`. Incremental migration is correct — no need to bulk-port.

### Action

Update `tokens.md` with a note referencing the preset's renames. Keep the values in `tokens.md` (they're still the source of truth) but link each row to the preset var name where one exists.

---

## 3. Typography

| Spec value | Preset value | Match? |
|---|---|---|
| h1 `clamp(2.1rem, 4vw, 3rem)` | `--text-h1: clamp(2.1rem, 4vw, 3rem)` | ✓ |
| h2 `clamp(1.65rem, 3vw, 2.2rem)` | `--text-h2: clamp(1.65rem, 3vw, 2.2rem)` | ✓ |
| h3 `1.25rem` | `--text-h3: 1.25rem` | ✓ |
| body `17px / 1.5` | `--text-body: 1rem` (= 16px) | ⚠️ divergence |
| Font family | `"Avenir Next", "Segoe UI", sans-serif` | ⚠️ open decision — `tokens.md` §3 proposed migrating to Space Grotesk + Inter |

### Divergences

- **Body size:** spec wrote `17px` (carried from the existing apps' rules); preset uses `1rem` which is `16px` by default. Small but visible difference.
  - Either: set `html { font-size: 17px }` to preserve the current size, or accept `1rem = 16px` as the new baseline.
  - **Recommendation:** accept `1rem`; standard rem baseline is more maintainable and the 1px difference is not material. Update `tokens.md` §3 to `1rem`.
- **Font family:** spec §3 flagged this as an open decision (Avenir Next vs Space Grotesk + Inter). Preset shipped with Avenir Next. The decision can still be made later — swapping fonts in `theme.css` is one line.

### Action

Update `tokens.md` §3 to note `body = 1rem` and to reiterate the font decision as still open.

---

## 4. Spacing

Spec listed named pixel steps 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 40.

Preset uses rem-based `--spacing-1..12` in Tailwind's convention (0.25rem / 0.5rem / 0.75rem / 1rem / 1.25rem / 1.5rem / 2rem / 2.5rem / 3rem — skipping 7, 9, 11 which default to Tailwind's).

**Divergence:** the specific step values don't line up 1:1 (spec had 14px, preset doesn't). In practice this is fine — Tailwind's spacing scale is the industry default and components using utilities (`p-3`, `gap-4`, etc.) compose against it. Apps' escape-hatch CSS can still use the spec's pixel values via arbitrary values (`p-[14px]`).

### Action

Update `tokens.md` §4 to align with the Tailwind spacing scale. Note that 14px (previously between `space-5` and `space-6`) becomes `space-3` in the Tailwind mapping (0.75rem = 12px) or arbitrary where 14px specifically is required.

---

## 5. Focus-visible

**Spec (`focus-states.md`) proposed a hybrid:**

- Form inputs: `outline: 2px solid var(--accent); outline-offset: 2px`
- Cards / buttons: `box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-soft)`

**Preset ships a unified rule applied to all `:focus-visible` targets:**

```css
:focus-visible {
  outline: 2px solid var(--rg-accent);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px var(--rg-focus-ring);
}
```

### Assessment

The preset applies *both* outline and box-shadow universally, which combines the two treatments the spec split by category. This is:
- **Simpler** — one rule, no category decision.
- **At least as visible** — every focused element gets both the outline ring and the soft glow.
- **Slightly heavier visually** — on a simple input, the rule lays down outline + outline-offset + 4px box-shadow, which can feel loud on some surfaces.

In practice the loud-feeling case is rare (you only see the focus ring when tabbing) and the simplification is worth it. The preset's treatment is the better spec.

### Action

Update `focus-states.md` to adopt the unified preset treatment as canonical, and note the spec's original hybrid recommendation as the earlier proposal (informational).

---

## 6. `--accent-soft` → `--rg-focus-ring`

`tokens.md` §1.10 introduced `--accent-soft` with:
- Light: `rgba(14, 122, 114, 0.32)`
- Dark: `rgba(83, 200, 187, 0.38)`

Preset ships `--rg-focus-ring` with:
- Light: `rgba(14, 122, 114, 0.22)`
- Dark: `rgba(83, 200, 187, 0.28)`

Same color, slightly lower alpha. The preset's values are better — the ring is visible but less loud.

### Action

Update `tokens.md` §1.10 to rename to `--rg-focus-ring` and adopt the lower alpha values.

---

## 7. Things in the preset that the spec didn't cover

| Preset token | Purpose | Should it be in the spec? |
|---|---|---|
| `--tracking-pill` (0.14em) | Letter-spacing for the `.rg-kicker` (formerly `.pill`) | Yes — add to `tokens.md` §3 typography |
| `--text-display` (clamp 2.5–4rem) | Landing hero display size | Yes — add to `tokens.md` §3 if landing heroes use it |
| `.rg-button--primary`, `.rg-button--secondary` | Primary / secondary button pattern | Yes — move the button spec (currently implicit) into a new `buttons.md` or amend `focus-states.md` |
| `.rg-state-dot--{not_started,learning,...}` | The phase-state dot palette | Matches the deferred `state-legend.md` spec — unblock and author now that the component ships |

### Action

- Add `--tracking-pill` and `--text-display` to `tokens.md` §3.
- Plan a `buttons.md` (small — just primary/secondary variants + states) if more button variation is likely.
- Author the deferred `state-legend.md` spec now that `StateDot` / `StateLegend` have shipped.

---

## 8. Missing the other way — things the spec covered that aren't in the preset yet

These are still per-app `globals.css` rules and will move as their components migrate:

- `--stage-panel-*`, `--tutor-panel-*`, `--signal-panel-*`
- `--step-*`, `--choice-*`, `--walkthrough-*`
- `--ordered-panel-*`, `--ordered-chip-*`
- `--inline-note-*`, `--completed-*`, `--stage-active-*`, `--stage-done-*`
- `--theme-toggle-*` (mostly superseded by `.rg-theme-switcher__*`)
- All `--feedback-*`, `--success-*`, `--danger-*` (used in quiz-shell components)

**Recommendation:** port these in waves as the fork agent's B-10 launcher/quiz-shell migration progresses. Each wave's PR moves a component + its consumed tokens together.

---

## 9. Bottom line

The preset realizes the spec faithfully at the high-signal level — colors, typography scale, radius, motion, focus — and makes sensible simplifications (unified focus, Tailwind spacing convention, `--color-*` / `--rg-*` separation). The spec should be updated to reflect the preset's names and the few accepted divergences.

The outstanding spec work: finish porting the long-tail tokens as their consuming components migrate; author the deferred `state-legend.md` now that `StateDot` / `StateLegend` have shipped in `review-game-core/ui`.

---

## 10. Cross-references

- Shipped preset: [`review-game-core/theme.css`](../../theme.css)
- Spec source: [`tokens.md`](./tokens.md), [`focus-states.md`](./focus-states.md)
- Audit driver: `header-audit.md`
