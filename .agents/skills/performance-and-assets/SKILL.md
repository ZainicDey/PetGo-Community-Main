---
name: performance-and-assets
description: "Image optimization, bundle size reduction, Next.js caching & revalidation rules, font loading, and media performance in PetGo Community"
---

# Performance & Assets Skill — PetGo Community

This skill governs **Image Optimization**, **Bundle Size Reduction**, and **Caching** in **PetGo Community** (`petgo-community`).

---

## 🖼️ 1. Image Optimization (`next/image`)

PetGo Community uses Next.js Image Optimization for responsive sizing, WebP conversion, and layout stability.

### 1. Static Local Images
Local brand assets (e.g. `Logo_PetGo.png`) should be imported from `@/assets/images/`:

```tsx
import Image from 'next/image';
import PetGoLogo from '@/assets/images/Logo_PetGo.png';

export function BrandLogo() {
  return (
    <Image
      src={PetGoLogo}
      alt="PetGo"
      width={100}
      height={32}
      priority
      className="select-none"
    />
  );
}
```

### 2. User & Post Media (Remote Images)
Allowed remote hostnames in `next.config.ts`:
```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};
```

---

## 📦 2. Bundle Size Reduction & Code Splitting

### 1. Lazy-Loading Modals (`next/dynamic`)
Modals like `NewThreadModal` can be dynamically imported to avoid bloating initial page load:

```tsx
import dynamic from 'next/dynamic';

const NewThreadModal = dynamic(() => import('./NewThreadModal'), {
  ssr: false,
  loading: () => null,
});
```

### 2. Tree-Shakeable Icon Imports (`lucide-react`)
Always use named imports for icons:
```tsx
// ✅ Correct
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
```

---

## ✅ Performance Checklist

- [ ] Static images use `<Image />` with `priority` for headers/logos.
- [ ] Post media includes proper `sizes` and `width`/`height` or `fill`.
- [ ] Remote domains are registered in `next.config.ts`.
- [ ] Lucide icons use named imports.
