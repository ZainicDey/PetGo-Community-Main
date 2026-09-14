---
name: env-variables
description: "Environment variable rules and active configuration for PetGo Community (FastAPI backend at localhost:8000, Cloudinary media storage, production routing)"
---

# Environment Variables — PetGo Community

This skill governs the configuration and conventions for environment variables in **PetGo Community** (`petgo-community`).

---

## 📋 Environment Configuration Files

- `.env.local`: Local development overrides (not checked into git).
- `.env.production`: Production deployment settings.
- `.env.example`: Sanitized template for team members.

---

## 📐 Public vs Private Variables

### Rule 1 — `NEXT_PUBLIC_` is for Client-Side Variables Only
Any variable prefixed with `NEXT_PUBLIC_` is embedded in the client JavaScript bundle. **Never store secret keys, database credentials, or server tokens behind this prefix.**

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public (Client) | PetGo Community FastAPI backend (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_APP_URL` | Public (Client) | Frontend URL (e.g. `http://localhost:3000` or production domain) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public (Client) | Cloudinary cloud identifier for direct media uploads |
| `CLOUDINARY_API_KEY` | Server Only | Cloudinary server authentication |
| `CLOUDINARY_API_SECRET` | Server Only | Cloudinary signing secret |

---

## 🛡️ Usage in Code

```ts
// Client & RTK Query
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```
