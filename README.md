# Epi'AI Website

Plateforme web officielle de l'association **Epi'AI** (Epitech) : site vitrine bilingue (FR/EN) + espace membre (ressources, forum, chat, événements, intranet, administration).

## Prérequis

- Node.js 20+
- PostgreSQL (local via Docker ou [Neon](https://neon.tech) en production)
- Compte [Clerk](https://clerk.com) (authentification)
- Optionnel : [Resend](https://resend.com) (emails), [Stream](https://getstream.io) (chat temps réel)

## Installation locale

```bash
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
docker compose up -d          # PostgreSQL local
npm run db:push && npm run db:seed
npm run dev
```

Le site démarre sur [http://localhost:3002](http://localhost:3002) (locale par défaut : `/fr`).

## Variables d'environnement

Voir `.env.example` pour la liste complète.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URI PostgreSQL (Prisma) — Neon en prod |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `CLERK_SECRET_KEY` | Clé secrète Clerk |
| `CLERK_WEBHOOK_SECRET` | Secret webhook Clerk (Svix) |
| `RESEND_API_KEY` | API Resend pour les emails d'adhésion |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (ex. `https://epiai.netlify.app` ou `https://epiai.eu`) |
| `CRON_SECRET` | Secret pour le cron (rappels événements) |
| `NEXT_PUBLIC_STREAM_API_KEY` | Clé publique Stream Chat (optionnel) |
| `STREAM_API_SECRET` | Secret Stream Chat (optionnel) |
| `OPENAI_API_KEY` | Chatbot + génération blog depuis events (optionnel) |

## Déploiement Netlify (recommandé)

Le projet est prêt pour Netlify (`netlify.toml` + cron Scheduled Function). Next.js 16 App Router est supporté via l’adapter OpenNext (auto-détecté).

### 1. Base PostgreSQL (Neon)

1. Crée / réutilise un projet sur [neon.tech](https://neon.tech)
2. Copie la `DATABASE_URL` (connection string, SSL)
3. Initialise le schéma une fois (en local, avec l’URL Neon) :

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run db:seed
# Talks / projets / ressources si besoin :
DATABASE_URL="postgresql://..." npm run db:seed:talks:prod
```

### 2. Projet Netlify

1. Va sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Connecte le repo GitHub `EpiAI-website` (branche `main`)
3. Build settings (déjà dans `netlify.toml`) :
   - **Build command** : `npm run build`
   - **Publish directory** : `.next`
   - **Node** : 20
4. **Site configuration → Environment variables** — ajoute au minimum :

| Key | Notes |
|-----|--------|
| `DATABASE_URL` | Neon prod |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` en prod |
| `CLERK_SECRET_KEY` | `sk_live_...` |
| `CLERK_WEBHOOK_SECRET` | après config webhook |
| `NEXT_PUBLIC_SITE_URL` | URL Netlify (`https://xxx.netlify.app`) puis domaine custom |
| `CRON_SECRET` | chaîne aléatoire longue |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | si emails |
| Stream / VAPID / OpenAI | selon les features utilisées |

5. Deploy

Netlify exécute `prisma generate` via `postinstall` puis `next build`.

### 3. Clerk (production)

Dans le dashboard Clerk, ajoute le domaine Netlify :

- Allowed origins / redirect URLs : `https://ton-site.netlify.app`, `/fr/sign-in`, `/fr/dashboard`, etc.
- Webhook endpoint : `https://ton-site.netlify.app/api/webhooks/clerk` → copie le secret dans `CLERK_WEBHOOK_SECRET`
- Après domaine custom (`epiai.eu`), mets à jour Clerk + `NEXT_PUBLIC_SITE_URL`

### 4. Domaine custom (optionnel)

Netlify → Domain management → Add domain → configure les DNS chez ton registrar.

### 5. Cron (rappels événements J-1)

Configuré dans `netlify.toml` + `netlify/functions/event-reminders.mts` (tous les jours à **08:00 UTC**).

- Définis `CRON_SECRET` dans Netlify
- Test manuel : Netlify → Functions → `event-reminders` → **Run now**

### Checklist rapide

- [ ] `DATABASE_URL` → Neon
- [ ] Clerk en mode **production** (`pk_live_...`) + domaine Netlify autorisé
- [ ] `NEXT_PUBLIC_SITE_URL` = URL réelle Netlify
- [ ] `db:push` (+ seeds) exécutés sur la base prod
- [ ] Webhook Clerk configuré
- [ ] `CRON_SECRET` défini

> **Note :** les uploads admin (PDF, photos) dans `public/uploads/` ne persistent pas entre builds sur Netlify (filesystem éphémère). Préférer des URLs ou des assets commités dans `public/assets/`.

### Ancien déploiement Vercel

`vercel.json` (cron Vercel) reste dans le repo pour référence, mais le chemin recommandé est **Netlify**. Si tu reviens sur Vercel plus tard, le cron Vercel continue de pointer vers `/api/cron/event-reminders`.

## Premier administrateur

1. Démarrer l'app et aller sur `/fr/setup-admin`
2. Utiliser `POST /api/admin/invite` pour créer le premier compte président (route publique une seule fois)

## Structure

- `src/app/[locale]/` — Pages publiques et dashboard membre
- `src/app/api/` — Routes API (Prisma, Clerk, Stream)
- `src/proxy.ts` — Auth Clerk + i18n (Next.js 16)
- `src/lib/` — Repositories, rôles, permissions
- `prisma/schema.prisma` — Schéma PostgreSQL
- `messages/` — Traductions FR/EN
- `netlify.toml` + `netlify/functions/` — Build & cron Netlify

## Scripts

```bash
npm run dev              # Développement (port 3002)
npm run build            # Build production
npm run start            # Serveur production
npm run lint             # ESLint
npm test                 # Tests Vitest
npm run db:push          # Appliquer le schéma Prisma
npm run db:seed          # Données initiales (partenaires, équipe, etc.)
npm run db:migrate-roles # Migration rôles legacy (une fois si besoin)
```

## Rôles

Hiérarchie de 9 rôles (`membre` → `president`) avec permissions granulaires. Les adhérents classiques ont le rôle `membre` (niveau 1) ; la période d'essai est gérée via `memberStatus` (`pending` → `active`). Définis dans `src/lib/roles/definitions.ts`, stockés dans `publicMetadata.role` (Clerk).

## Licence

Projet privé — Epi'AI © 2025
