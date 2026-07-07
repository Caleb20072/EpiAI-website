# EPI'AI Design System

> Inspired by [Refero Styles](https://styles.refero.design) — *Steep* (warm paper analytics) + *Linear* (dark precision).  
> AI-readable tokens for consistent UI across dashboard and public surfaces.

## Principles

1. **Semantic tokens only** in app/dashboard — never `text-white` on surfaces that change with theme.
2. **Marketing hero** stays dark (fixed imagery); theme toggle affects dashboard shell.
3. **One accent**: brand teal `#0d9488`. Admin highlights: amber.
4. **Density**: comfortable spacing, 12px radius cards, clear hierarchy.

## Color Tokens

| Token | Dark | Light |
|-------|------|-------|
| `--bg-page` | `#09090b` | `#f4f4f0` |
| `--bg-surface` | `#18181b` | `#ffffff` |
| `--bg-card` | `rgba(255,255,255,0.05)` | `#ffffff` |
| `--bg-input` | `rgba(0,0,0,0.35)` | `#f8f8f6` |
| `--text-primary` | `#fafafa` | `#18181b` |
| `--text-secondary` | `#a1a1aa` | `#52525b` |
| `--text-muted` | `#71717a` | `#a1a1aa` |
| `--border-default` | `rgba(255,255,255,0.1)` | `#e4e4e7` |
| `--brand` | `#0d9488` | `#0d9488` |

## Typography

- **Font**: system-ui stack (Geist sans on marketing).
- **Page title**: `text-2xl sm:text-3xl font-bold tracking-tight`
- **Section**: `text-lg font-semibold`
- **Body**: `text-sm leading-relaxed`
- **Label**: `text-xs font-medium uppercase tracking-wide`

## Components

Use `@/components/ui/*`:

- `PageHeader` — title + description + actions
- `Card` — elevated surface with border
- `ListRow` — admin list item
- `Input`, `Textarea`, `Select` — form fields
- `Button` — primary / secondary / ghost / danger
- `Modal` — overlay dialogs
- `EmptyState` — zero-data placeholder

## Layout

- Sidebar: 288px (`w-72`), full height, `bg-surface` + `border-r`
- Main: `bg-page`, padding `p-4 sm:p-6 lg:p-8`
- Mobile: bottom nav + collapsible sidebar

## Responsiveness

- Stack filters/actions on `< sm`
- Tables → cards on mobile
- Modal: full-width on mobile with `p-4`
