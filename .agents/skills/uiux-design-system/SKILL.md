---
name: uiux-design-system
description: "Mandatory UI/UX design system, PetGo Community color palette, dark mode aesthetics, avatar palette, navigation styles, and component styling flow"
---

# UI/UX Design System Skill — PetGo Community

This skill defines the mandatory **UI/UX Design System**, brand color palette, typography, dark theme aesthetics, and component styling flow for **PetGo Community**.

---

## 🎨 1. Core Color Palette

PetGo Community features a sleek, high-contrast, dark-mode-first aesthetic with warm PetGo brand accents.

### Brand Accent Colors
| Role | Color Name | Hex / Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Orange** | Brand Orange | `#F7941D` / `bg-[#F7941D]` | Post button, active navigation icon, highlight text |
| **Primary Red** | Brand Red | `#BE1E2D` / `bg-[#BE1E2D]` | Accent gradients, badges, heart like icon fill (`#e05c97` / `#be1e2d`) |
| **Hover Light Orange**| Accent Hover | `#FFE1BD` / `text-[#FFE1BD]` | Hover links, handle hover state, active pill hover |

### Dark Canvas & Surface Hierarchy
| Surface Level | Hex / Class | Description & Purpose |
| :--- | :--- | :--- |
| **Level 0 (Main Shell)** | `#101010` / `bg-[#101010]` | Global page background and desktop navigation sidebar |
| **Level 1 (Card & Modals)** | `#151515` / `#1c1919` / `#1e1e1e` | Thread cards, modal popups, comment boxes |
| **Level 2 (Hover Surface)** | `#242424` / `hover:bg-white/5` | Thread hover state, interactive row hover |
| **Borders & Dividers** | `border-white/10` / `border-[#2a2a2d]` | Container dividers, thread separation lines |

### Dynamic Avatar Color Palette
PetGo Community generates deterministic pastel avatar backgrounds using:
```ts
export const AVATAR_COLORS = [
  '#f7941d', // Orange
  '#e05c97', // Pink/Rose
  '#5c8ae0', // Blue
  '#5ce087', // Green
  '#e0c45c', // Yellow-Gold
  '#c45ce0', // Purple
  '#5ce0d8', // Teal
];
```

---

## 📐 2. Responsive Navigation Styles

Configured in `src/app/globals.css` and `CommunityLayout.tsx`:

- **Desktop (>= 1024px)**: Left fixed sidebar `w-[260px]`, full text labels, `--nav-btn-width: 195px`, `--nav-btn-height: 33px`.
- **Tablet (640px - 1023px)**: Compact icon-only rail `w-[80px]`, `--nav-btn-width: 42px`, `--nav-btn-height: 42px`.
- **Mobile (< 640px)**: Bottom sticky bar `h-[54px]`, horizontal icon layout.

### Utility Classes
- `.scrollbar-hide`: Hides scrollbar while retaining scrollability.
- `.skeleton-shimmer`: Shimmer animation for thread and comment skeleton placeholders.

---

## 🔤 3. Typography & Hierarchy

- **Post Author / Title**: `font-bold text-[15px] text-white`
- **User Handle**: `text-[14px] text-white/50 font-normal`
- **Post Body Text**: `text-[15px] text-white/90 leading-relaxed font-normal`
- **Interaction Counts**: `text-[13px] text-white/60 font-medium`

---

## 📐 4. UI/UX Component Styling Flow

When creating or modifying ANY component or thread element, follow this design flow:

### Step 1: Base Shell & Background
- Use `#101010` for main sections, `#151515` / `#1c1919` for cards.
- Apply `border-b border-white/10` or `border border-white/10 rounded-2xl`.

### Step 2: Micro-Interactions & Hover States
- Action buttons (Like, Comment, Repost, Share): `hover:text-[#F7941D]` or `hover:bg-white/5 transition-all duration-150`.
- New Post CTA: `#F7941D` with subtle active scale `active:scale-95`.

### Step 3: Class Merging with `cn()`
Always wrap element class strings in `cn(...)` from `@/lib/utils`:
```tsx
import { cn } from '@/lib/utils';

export function ThreadWrapper({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <article className={cn('p-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors', className)}>
      {children}
    </article>
  );
}
```

---

## ✅ Design System Checklist

- [ ] Uses PetGo Community color tokens (Brand Orange `#F7941D`, `#101010` dark canvas, `#1c1919` cards).
- [ ] Borders use `border-white/10` or `border-white/5`.
- [ ] Interactive icons use smooth hover transitions.
- [ ] Skeletons use `.skeleton-shimmer`.
- [ ] All dynamic classes wrapped in `cn()`.
