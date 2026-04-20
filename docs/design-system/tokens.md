# Design Tokens

Canonical design tokens for every review game built on `review-game-core`. The Tailwind preset at [`review-game-core/theme.css`](../../theme.css) realizes this spec; where the shipped preset renamed or adjusted values, this doc is aligned to match (see `rollout-alignment.md` for the diff history).

**Consumers:** the Tailwind preset, in-app CSS that still escapes the preset, shared UI components (`review-game-core/src/ui`), WCAG audits.

**Non-goals:** component-level styles (see `theme-switcher.md`, `a11y-baseline.md`, `quiz-chrome-typography.md`). Focus and pressed states live in `focus-states.md`.

## Two-layer variable model (as shipped)

The preset uses a two-layer indirection that every app-level token flows through:

- **`--rg-*`** — runtime CSS variables toggled by the `[data-theme="light"]` / `[data-theme="dark"]` attribute. These hold the raw color values and switch at runtime without rebuilding Tailwind.
- **`--color-*`** (plus `--text-*`, `--spacing-*`, `--radius-*`, etc.) — Tailwind `@theme` variables that reference the `--rg-*` layer. These are what Tailwind utility classes resolve against at build.

Every row below gives the runtime var (`--rg-*`) where one exists. App-level CSS should prefer the `--rg-*` form for values that must respond to theme switching; use `--color-*` inside `@apply`-style utility composition.

---

## 1. Color tokens

Sourced from `math-1111-review-game/app/globals.css` lines 1–166, which matches `stats-exam-prep-game/app/globals.css` for every token except `--learning-panel-heading` dark (resolved in §2 below). The `:root, html[data-theme='light']` block defines the light palette; `html[data-theme='dark']` overrides for dark. This selector contract is preserved by the shared preset so the existing `THEME_INIT_SCRIPT` FOUC pattern keeps working unchanged.

### 1.1 Neutral + brand

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--bg` | `#f7f7f2` | `#0d1418` | Page background |
| `--surface` | `#fffef8` | `#142026` | Card / panel surface |
| `--surface-2` | `#f2efe5` | `#1c2a31` | Subtle surface variant |
| `--text` | `#1b1f24` | `#e5eff1` | Primary text |
| `--muted` | `#5b6773` | `#a4b6bf` | Secondary / supporting text |
| `--accent` | `#0e7a72` | `#53c8bb` | Primary accent (CTAs, active states) |
| `--accent-2` | `#004f59` | `#9be9df` | Secondary accent (active-emphasis text) |
| `--accent-contrast` | `#ffffff` | `#07211f` | Foreground on accent surfaces |
| `--good` | `#1e7d3f` | `#91e0ab` | Positive / correct |
| `--bad` | `#ab2d2d` | `#ff9d9d` | Negative / incorrect |
| `--border` | `#d5d8db` | `#2a3a43` | Default borders |

### 1.2 Gradients + shadows

| Token | Light | Dark |
|---|---|---|
| `--page-background` | `radial-gradient(circle at top right, #ecf7f5 0%, var(--bg) 45%, #f4f2ea 100%)` | `radial-gradient(circle at top right, #16343a 0%, var(--bg) 50%, #0a1013 100%)` |
| `--card-gradient` | `linear-gradient(155deg, var(--surface) 0%, #f0faf8 90%)` | `linear-gradient(155deg, var(--surface) 0%, #102c30 90%)` |
| `--shadow-soft` | `0 10px 24px rgba(0, 79, 89, 0.12)` | `0 10px 24px rgba(0, 0, 0, 0.28)` |
| `--shadow-strong` | `0 10px 24px rgba(0, 79, 89, 0.16)` | `0 12px 30px rgba(0, 0, 0, 0.36)` |

### 1.3 Pills, warnings, tutor

| Token | Light | Dark |
|---|---|---|
| `--pill-bg` | `#d8f1ee` | `#173d41` |
| `--warning-bg` | `#fff2d7` | `#3b2a17` |
| `--warning-text` | `#6d3b00` | `#ffd79a` |
| `--warning-border` | `#e6c48c` | `#7d5b2f` |
| `--tutor-pill-bg` | `#e6eefc` | `#20314b` |
| `--tutor-pill-text` | `#21467d` | `#c7dbff` |

### 1.4 Form inputs

| Token | Light | Dark |
|---|---|---|
| `--input-bg` | `#ffffff` | `#0f1a1f` |
| `--input-border` | `#c6cbcf` | `#35505a` |

### 1.5 Feedback / success / danger

| Token | Light | Dark |
|---|---|---|
| `--feedback-bg` | `#f8f9f9` | `#172127` |
| `--success-bg` | `#edf9f1` | `#14281b` |
| `--success-border` | `#9ed9b0` | `#4f8f65` |
| `--danger-bg` | `#fff2f2` | `#2b1818` |
| `--danger-border` | `#e8b2b2` | `#8a4a4a` |

### 1.6 Learning / stage / tutor / signal panels

| Token | Light | Dark |
|---|---|---|
| `--learning-panel-bg` | `#f8fbe9` | `#1c2313` |
| `--learning-panel-border` | `#d8e0c9` | `#58653c` |
| `--learning-panel-heading` | `#587035` | **`#d4e07a`** (resolved — see §2) |
| `--stage-panel-bg` | `linear-gradient(180deg, #f9fcfc 0%, #eef6f5 100%)` | `linear-gradient(180deg, #172328 0%, #111b20 100%)` |
| `--stage-panel-border` | `#d3dee2` | `#30474d` |
| `--stage-panel-heading` | `#24555f` | `#8fd4ca` |
| `--tutor-panel-bg` | `linear-gradient(180deg, #f7faff 0%, #eef4ff 100%)` | `linear-gradient(180deg, #172235 0%, #111a28 100%)` |
| `--tutor-panel-border` | `#c9d6ee` | `#30456c` |
| `--tutor-heading-color` | `#264a7a` | `#c4d8ff` |
| `--signal-panel-bg` | `#fbfdea` | `#202715` |
| `--signal-panel-border` | `#dce5be` | `#59663b` |
| `--signal-heading-color` | `#5b7028` | `#cbde86` |

### 1.7 Steps / choices / walkthrough

| Token | Light | Dark |
|---|---|---|
| `--step-bg` | `rgba(255, 255, 255, 0.8)` | `rgba(19, 27, 31, 0.92)` |
| `--step-border` | `#d1dae8` | `#30404a` |
| `--step-active-border` | `#4c78b8` | `#73a7ff` |
| `--step-active-shadow` | `0 0 0 2px rgba(76, 120, 184, 0.08)` | `0 0 0 2px rgba(115, 167, 255, 0.16)` |
| `--step-correct-bg` | `#f3fbf5` | `#15271c` |
| `--step-correct-border` | `#abd6b7` | `#4f8f65` |
| `--step-revealed-bg` | `#fff8ec` | `#2a2115` |
| `--step-revealed-border` | `#e6c58f` | `#8a6a3b` |
| `--step-label-color` | `#5e6e80` | `#9db1bc` |
| `--step-kind-color` | `#2f4f74` | `#bad4ff` |
| `--step-result-correct-bg` | `#edf8f0` | `#15281b` |
| `--step-result-correct-border` | `#abd6b7` | `#4f8f65` |
| `--step-result-revealed-bg` | `#fff4dd` | `#302515` |
| `--step-result-revealed-border` | `#e6c58f` | `#8a6a3b` |
| `--choice-bg` | `#ffffff` | `#122027` |
| `--choice-border` | `#c8d1dd` | `#3a4a56` |
| `--choice-selected-bg` | `#eaf2ff` | `#18304a` |
| `--choice-selected-border` | `#4c78b8` | `#73a7ff` |
| `--choice-selected-text` | `#173a6a` | `#d7e7ff` |
| `--walkthrough-bg` | `#f4f8ff` | `#121c2d` |
| `--walkthrough-border` | `#cfd8e8` | `#334763` |
| `--walkthrough-heading` | `#35537a` | `#bfd4ff` |

### 1.8 Inline / stage-status / note / ordered

| Token | Light | Dark |
|---|---|---|
| `--inline-code-bg` | `#f3f6f7` | `#152126` |
| `--stage-active-bg` | `#d8f1ee` | `#173d41` |
| `--stage-active-text` | `#004f59` | `#9be9df` |
| `--stage-done-bg` | `#edf9f1` | `#15271c` |
| `--stage-done-border` | `#9ed9b0` | `#4f8f65` |
| `--inline-note-bg` | `#fbfdea` | `#202715` |
| `--inline-note-border` | `#d6ddc0` | `#58653c` |
| `--completed-bg` | `#edf9f1` | `#15271c` |
| `--completed-border` | `#c4e5ce` | `#40674d` |
| `--ordered-panel-bg` | `linear-gradient(180deg, #fffaf0 0%, #f6f2df 100%)` | `linear-gradient(180deg, #2c2415 0%, #211a10 100%)` |
| `--ordered-panel-border` | `#e3d3a6` | `#7d6640` |
| `--ordered-label-color` | `#7a5a1b` | `#f2d18a` |
| `--ordered-chip-bg` | `rgba(255, 255, 255, 0.88)` | `rgba(21, 29, 22, 0.9)` |
| `--ordered-chip-border` | `#d7c18b` | `#8a7043` |

### 1.9 Theme toggle

| Token | Light | Dark |
|---|---|---|
| `--theme-toggle-bg` | `rgba(255, 254, 248, 0.86)` | `rgba(20, 32, 38, 0.9)` |
| `--theme-toggle-hover` | `#f4f7f0` | `#203038` |
| `--theme-toggle-border` | `#d5d8db` | `#35505a` |
| `--theme-toggle-shadow` | `0 12px 28px rgba(0, 79, 89, 0.12)` | `0 14px 32px rgba(0, 0, 0, 0.34)` |

### 1.10 Focus-ring glow

As shipped in the preset (renamed from the spec's earlier `--accent-soft`):

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--rg-focus-ring` | `rgba(14, 122, 114, 0.22)` | `rgba(83, 200, 187, 0.28)` | Focus-ring glow applied by the universal `:focus-visible` rule (see `focus-states.md`) |

---

## 2. Resolved: `--learning-panel-heading` dark

**Canonical value: `#d4e07a`** (the current 1401 value; 1111 will be updated to match).

**Rationale:** 1111 and 1401 diverged at this single token (1111 shipped `#c7df86`, 1401 shipped `#d4e07a`). Both pass WCAG AA and AAA for normal text against `--learning-panel-bg` dark `#1c2313`:

| Candidate | sRGB relative luminance of foreground | Contrast ratio vs `#1c2313` (L = 0.01498) | AA 4.5:1 | AAA 7:1 |
|---|---|---|---|---|
| `#c7df86` (1111) | 0.6663 | **11.02 : 1** | ✓ | ✓ |
| `#d4e07a` (1401) | 0.6873 | **11.34 : 1** | ✓ | ✓ |

Both pass. Picked `#d4e07a` because (a) it earns a marginally higher AAA margin, (b) its slightly warmer tone reads better against the teal-leaning dark surface, and (c) converging in the one-file direction (update 1111) is cheaper than the other direction.

**Action:** in-app polish item #8 updates `math-1111-review-game/app/globals.css:116` from `#c7df86` to `#d4e07a`. Dark-mode visual verification required per WF doctrine.

---

## 3. Typography

As shipped in [`theme.css`](../../theme.css) `@theme` block:

| Role | Preset var | Value |
|---|---|---|
| Sans family | `--font-sans` | `"Avenir Next", "Segoe UI", sans-serif` |
| Display family | `--font-display` | `"Avenir Next", "Segoe UI", sans-serif` |
| Mono family | `--font-mono` | `"SFMono-Regular", "SF Mono", "Consolas", monospace` |
| Body | `--text-body` | `1rem` |
| Lede | `--text-lede` | `1.0625rem` |
| `h3` | `--text-h3` | `1.25rem` |
| `h2` | `--text-h2` | `clamp(1.65rem, 3vw, 2.2rem)` |
| `h1` | `--text-h1` | `clamp(2.1rem, 4vw, 3rem)` |
| Display | `--text-display` | `clamp(2.5rem, 6vw, 4rem)` |
| Pill tracking | `--tracking-pill` | `0.14em` |

Heading letter-spacing: `-0.02em` (global rule on `h1/h2/h3/h4/h5/h6`). Heading line-height: `1.14`. Body line-height: `1.5`.

**Component-scoped typography** (still lives in per-app globals or component CSS):

| Role | Size | Line-height | Letter-spacing | Weight |
|---|---|---|---|---|
| `.pill` / `.rg-kicker` | `0.75rem` | inherit | `var(--tracking-pill)` (0.14em) | `700`, uppercase |
| `.detail-label` | `13px` | inherit | `0.04em` uppercase | `800` |
| `.tutor-step-label` | `13px` | inherit | `0.04em` uppercase | `700` |
| `.tutor-step-prompt` | `1.08rem` | `1.55` | — | inherit |
| `.session-progress-summary` | `15px` | inherit | — | inherit |
| `.quiz-breadcrumb` | `0.92rem` | inherit | — | inherit |
| `.richtext` | inherit | `1.55` | — | inherit |

### Font stack note

The shipped preset uses Avenir Next + Segoe UI (system-serving). ASTR and CS continue to load Space Grotesk + Inter + JetBrains Mono via `next/font/google` at the app level (they're set as `--font-heading` / `--font-sans` / `--font-mono` CSS vars in the app's own globals, distinct from the preset's `--font-sans` etc.). This layering is accepted — apps can opt into different fonts without re-spec'ing tokens. If full cross-app typographic convergence becomes a goal, revisit the preset's `--font-sans` / `--font-display` values in a follow-up.

---

## 4. Spacing scale

As shipped in the preset (Tailwind convention, rem-based):

| Preset var | Value |
|---|---|
| `--spacing-1` | `0.25rem` (4px) |
| `--spacing-2` | `0.5rem` (8px) |
| `--spacing-3` | `0.75rem` (12px) |
| `--spacing-4` | `1rem` (16px) |
| `--spacing-5` | `1.25rem` (20px) |
| `--spacing-6` | `1.5rem` (24px) |
| `--spacing-8` | `2rem` (32px) |
| `--spacing-10` | `2.5rem` (40px) |
| `--spacing-12` | `3rem` (48px) |

Tailwind's default steps `7`, `9`, `11` are available via `spacing-*` classes but not explicitly overridden. Use `p-3`, `gap-4`, etc. in utilities.

The earlier spec listed 14px as a distinct step; in the preset, use `p-[14px]` or the Tailwind-standard `p-3.5` when that precise value is required.

Shell padding reference (per-app escape hatch, still valid): `.shell { padding: 24px 20px 40px; max-width: 1080px }`.

---

## 5. Radius scale

As shipped in the preset:

| Preset var | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.5rem` (8px) | Inline code, small chips |
| `--radius-md` | `0.875rem` (14px) | Default for cards, buttons, inputs |
| `--radius-lg` | `1.25rem` (20px) | Quiz cards, identity-float panels |
| `--radius-pill` | `999px` | `.rg-chip`, `.rg-kicker`, status badges |

The earlier spec's xs/xl/2xl sub-steps collapse to these four. Per-component CSS that needs a different radius should use an arbitrary value (`rounded-[12px]`) rather than re-introducing a named token.

---

## 6. Shadow scale

As shipped in the preset, two elevation tiers:

| Preset var | Light value | Dark adjustment |
|---|---|---|
| `--shadow-elevation-1` | `0 10px 24px rgba(0, 79, 89, 0.12)` | same token, honors runtime `--rg-*` |
| `--shadow-elevation-2` | `0 12px 30px rgba(0, 79, 89, 0.16)` | same |

Renamed from the earlier spec's `--shadow-soft` / `--shadow-strong`. Per-component shadow overrides (`.rg-step--active`, `.rg-theme-switcher__trigger`, etc.) use these base tokens.

---

## 7. Motion

As shipped in the preset:

| Preset var | Value | Used for |
|---|---|---|
| `--duration-fast` | `120ms` | Transforms, border, box-shadow |
| `--duration-base` | `200ms` | Background, color transitions on `body` / controls |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default curve for all transitions |

The preset's `--ease-standard` is a sharper custom easing than the CSS `ease` default — provides a crisp "landing" at the end of the transition that reads as more purposeful.

### 7.3 Keyframes

Retained as-is from current globals:

```css
@keyframes cram-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes ordered-data-enter {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)  scale(1); }
}
```

---

## 8. Spec-era name → preset-shipped name

Quick lookup for consumers migrating off hand-written `globals.css` onto the preset. The left column is what the original apps / early spec used; the right column is what the preset ships today.

| Spec-era name | Runtime var (`--rg-*`) | Tailwind `@theme` var | Notes |
|---|---|---|---|
| `--bg` | (n/a — gradient) | `--rg-background` | Preset uses a radial gradient, not a flat fill |
| `--surface` | `--rg-surface` | `--color-surface` | |
| `--surface-2` | `--rg-surface-raised` | `--color-surface-raised` | Semantic rename |
| `--text` | `--rg-text` | `--color-text` | |
| `--muted` | `--rg-muted` | `--color-muted` | |
| `--accent` | `--rg-accent` | `--color-accent` | |
| `--accent-2` | `--rg-accent-2` | `--color-accent-2` | |
| `--good` / `--bad` | `--rg-good` / `--rg-bad` | `--color-good` / `--color-bad` | |
| `--warn` / `--warning-text` | `--rg-warn` | `--color-warn` | Generalized |
| `--border` | `--rg-border` | `--color-border` | |
| `--learning-panel-*` | `--rg-learning-panel-*` | `--color-learning-panel-*` | |
| `--accent-soft` (spec) | `--rg-focus-ring` | n/a | Renamed + alpha lowered |
| `--shadow-soft` | `--shadow-elevation-1` | `--shadow-elevation-1` | Renamed |
| `--shadow-strong` | `--shadow-elevation-2` | `--shadow-elevation-2` | Renamed |

Long-tail tokens (`--stage-panel-*`, `--tutor-panel-*`, `--signal-panel-*`, `--step-*`, `--choice-*`, `--walkthrough-*`, `--ordered-*`) still live in each app's `globals.css` as escape-hatch rules. They'll migrate into `theme.css` as their consuming components move into `review-game-core/ui` — see `rollout-alignment.md` §8.

### Historical mapping (for reference only)

Proposed naming from the earlier draft before the preset was built:
| `--muted` | `text-muted` |
| `--accent` | `bg-accent` / `text-accent` / `border-accent` |
| `--accent-2` | `text-accent-2` |
| `--accent-contrast` | `text-accent-contrast` |
| `--good` | `text-good` / `bg-good` |
| `--bad` | `text-bad` / `bg-bad` |
| `--border` | `border` (default border color) |
| `--card-gradient` | `bg-card` (arbitrary, via preset) |
| `--shadow-soft` | `shadow-soft` |
| `--shadow-strong` | `shadow-strong` |
| `--learning-panel-bg` | `bg-learning-panel` |
| `--learning-panel-border` | `border-learning-panel` |
| `--learning-panel-heading` | `text-learning-heading` |
| `--pill-bg` | `bg-pill` |
| ... (apply the same mechanical transform to the rest of §1) ... | ... |
| `--accent-soft` (new) | `ring-accent-soft` |

The fork agent's preset should generate these utilities automatically from the CSS-var list rather than hand-authoring each one. Tailwind v4's `@theme` directive makes this a one-pass mapping.

---

## 9. Migration notes

### 9.1 ASTR + CS

These two apps currently use a completely different styling stack (Space Grotesk / Inter / JetBrains Mono; hardcoded `<html className="dark">`; no `data-theme` contract; no ThemeToggle). The Tailwind preset migration (fork agent B-9 / B-10) must:

1. Replace `<html className="dark">` with `<html data-theme="light" suppressHydrationWarning>` + `THEME_INIT_SCRIPT` so the data-theme contract is consistent across all four apps.
2. Remove the Space Grotesk / Inter / JetBrains Mono `next/font` imports unless the preset canonical stack (see §3 open decision) keeps them.
3. Swap the per-app `globals.css` for preset utilities + one escape-hatch file.
4. Adopt the ThemeSwitcher (`theme-switcher.md`) — these apps have no theme toggle today.

### 9.2 Icon assets

ASTR ships `/icon-light-32x32.png`, `/icon-dark-32x32.png`, `/icon.svg`, `/apple-icon.png`. MATH 1111 / 1401 ship `/icon.svg` only. The metadata helper (`metadata-voice.md`) defines the canonical icon contract; per-app PNG variants remain permitted but not required.

---

## 10. Cross-references

- Focus-visible / `:hover` / `:active` state rules: `focus-states.md`
- Metadata voice + `buildGameMetadata()` helper: `metadata-voice.md`
- ThemeSwitcher component spec: `theme-switcher.md`
- Accessibility baseline + gap list: `a11y-baseline.md`
- Quiz-chrome typography: `quiz-chrome-typography.md`
