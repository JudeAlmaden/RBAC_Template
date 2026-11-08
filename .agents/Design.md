# Design System & Theme Tokens

The visual system for this starter kit. Every colour, surface and border is a **CSS custom
property** defined in `resources/css/app.css` and mapped to Tailwind utilities in
`tailwind.config.js`. Components consume utilities only — no hardcoded hex values.

Source of truth: [`resources/css/app.css`](../resources/css/app.css) → `:root`, `.dark`, and the
`[data-theme="…"]` preset blocks. If this document and the CSS disagree, the CSS wins.

---

## 1. Colour Tokens

### Default palette

| Token | Light | Dark | Tailwind utilities | Used for |
|---|---|---|---|---|
| `--brand-primary` | `#5B5FC7` | `#5B5FC7` | `bg-brand`, `text-brand`, `ring-brand` | Primary buttons, active nav, focus rings |
| `--brand-hover` | `#484CB8` | `#6E72D6` | `bg-brand-hover` | Hovered primary actions |
| `--brand-accent` | `#8A8DE2` | `#8A8DE2` | `brand-accent`, `brand-400` | Accents, chart highlights |
| `--bg-page` | `#FBFBFC` | `#0D0D12` | `bg-canvas-page` | Application canvas |
| `--bg-card` | `#FFFFFF` | `#15151A` | `bg-canvas-card` | Cards, sidebar, top bar |
| `--bg-surface` | `#FAFAFC` | `#1C1C24` | `bg-canvas-surface` | Nested panels, table headers |
| `--bg-surface-raised` | `#FFFFFF` | `#1E1E26` | `bg-canvas-raised` | Popovers, menus, modals |
| `--bg-hover` | `#F3F4F6` | `#22222B` | `bg-canvas-hover` | Row / nav hover |
| `--bg-muted` | `#F3F4F6` | `#22222C` | `bg-canvas-muted` | Disabled or muted fills |
| `--border-subtle` | `#E8E8EC` | `#26262D` | `border-line` | Hairlines, card borders |
| `--border-strong` | `#D1D5DB` | `#34343E` | `border-line-strong` | Input borders, dividers with emphasis |
| `--text-main` | `#111111` | `#F8F9FD` | `text-body-main` | Headings, primary text |
| `--text-muted` | `#6B7280` | `#9CA3AF` | `text-body-muted` | Secondary text, labels |
| `--text-subtle` | `#9CA3AF` | `#6B7280` | `text-body-subtle` | Metadata, placeholders |

`brand.50 … brand.950` are fixed hex stops (not tokenised) for tints and gradients.

### Opacity modifiers

`withOpacity()` in `tailwind.config.js` turns every token into a `color-mix()` expression, so
`bg-brand/10`, `border-line/60` and `text-body-muted/80` all work in both modes.

### Presets

Each preset is a pair of blocks: `[data-theme="x"]` (brand only, light) and `[data-theme="x"].dark`
(brand **plus** surfaces, borders). Bundled presets: `default`, `emerald`, `ocean`, `sunset`.

| Preset | Light brand | Dark page / card |
|---|---|---|
| default | `#5B5FC7` | `#0D0D12` / `#15151A` |
| emerald | `#059669` | `#061A14` / `#0B2920` |
| ocean | `#2563EB` | `#091220` / `#0E1D33` |
| sunset | `#E11D48` | `#1A0B10` / `#281018` |

A preset that changes the background hue **must** also set the surface, border and text tokens —
otherwise text contrast and panel separation are inherited from the default palette and no longer
match.

---

## 2. Typography

| Role | Family | Notes |
|---|---|---|
| Sans | Plus Jakarta Sans (300–800) | Loaded from Google Fonts in `resources/views/app.blade.php`; set as `fontFamily.sans` |
| Mono | JetBrains Mono (400–500) | `fontFamily.mono`, for IDs, code, tokens |
| Fallback | Inter, then Tailwind's default stack | |

Scale in use: `text-xs` (10–12px labels, uppercase + tracking), `text-sm` (14px body/metadata),
`text-base` (16px), `text-2xl` (page titles), `text-3xl`+ (marketing/`Welcome`). Headings use
`font-semibold`; interactive labels `font-medium`.

---

## 3. Elevation, Radius, Spacing

- Shadows: `shadow-soft` (raised chips), `shadow-card` (cards, guest panels), `shadow-btn` (buttons).
  They are tuned for light mode; in dark mode separation comes from the `border-line` hairline, not
  from shadow.
- Radius: `rounded-panel` = `8px` (the design baseline), `rounded-xl` for cards and modals,
  `rounded-full` for pills/avatars.
- Spacing: multiples of 4px; card padding `p-6 sm:p-8`, section gaps `gap-4`/`gap-6`, page gutters
  `px-4 sm:px-6 lg:px-8`.

---

## 4. Theme Wiring

| Concern | Where |
|---|---|
| Token definitions | `resources/css/app.css` (`:root`, `.dark`, `[data-theme]`) |
| Utility mapping | `tailwind.config.js` (`colors.brand/canvas/line/body`, `darkMode: 'class'`) |
| State + persistence | `resources/js/hooks/useTheme.jsx` — `ThemeProvider`, `THEME_PRESETS`, `localStorage` keys `theme_mode` and `theme_preset` |
| DOM contract | `<html class="dark">` plus `data-theme="<preset>"` |
| Flash prevention | inline script in `resources/views/app.blade.php` (reads the same localStorage keys before paint) |
| Switcher UI | user menu in `resources/js/Layouts/AuthenticatedLayout.jsx` |

Adding a preset: define `[data-theme="new"]` + `[data-theme="new"].dark` in `app.css`, then add
`{ id, label, primaryColor }` to `THEME_PRESETS` so it appears in the picker.

---

## 5. Accessibility Baseline

Measured contrast against the default palette:

| Pair | Ratio | AA (4.5:1) |
|---|---|---|
| `text-body-main` on `bg-canvas-card` (dark) | 17.3:1 | pass |
| `text-body-muted` on `bg-canvas-card` (dark) | 7.17:1 | pass |
| `text-body-subtle` on `bg-canvas-card` (dark) | 3.76:1 | **fail** |
| `text-body-subtle` on `bg-canvas-page` (light) | 2.45:1 | **fail** |
| white on `bg-brand` | 5.38:1 | pass |

Consequences:

- Do not use `text-body-subtle` for text a user must read (nav section labels, form hints, metadata
  at small sizes). Prefer `text-body-muted`, or bump size/weight if subtle is required visually.
- Card on page is only ≈1.1:1 in dark mode. Panel separation depends on `border-line`; don't remove
  borders from dark surfaces.
- Status colours (`success`, `warning`, `danger`) are **not** tokenised yet — they live as raw
  utilities in components (`Toast`, badges, banners). Pick values deliberately when adding a preset
  so they stay legible on your surfaces.

---

## 6. Known Gaps

- Several files still bypass the tokens and will not follow a theme or preset change:
  `Pages/Roles/Index.jsx` and `Pages/Welcome.jsx` (raw gray scale), `Pages/Auth/Login.jsx`
  (`slate`/`indigo`), `Components/ActivityLogTable.jsx`, `NotificationPanel.jsx`,
  `Pages/Notifications/Index.jsx` (hardcoded `#1F1F26` / `#2A2A35`), and the indigo badges in
  `Pages/Users/**`. Migrate these to `canvas-*`, `line-*`, `body-*` before relying on theming.
- The Inertia progress bar colour is set in `resources/js/app.jsx` and is not tokenised.
- Only the default palette has been contrast-checked; presets need their own pass after changing
  surfaces.
