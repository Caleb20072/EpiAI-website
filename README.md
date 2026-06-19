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
| `DATABASE_URL` | URI PostgreSQL (Prisma) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk |
| `CLERK_SECRET_KEY` | Clé secrète Clerk |
| `CLERK_WEBHOOK_SECRET` | Secret webhook Clerk (Svix) |
| `RESEND_API_KEY` | API Resend pour les emails d'adhésion |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (ex. `https://epiai.eu`) |
| `CRON_SECRET` | Secret pour le cron Vercel (rappels événements) |
| `NEXT_PUBLIC_STREAM_API_KEY` | Clé publique Stream Chat (optionnel) |
| `STREAM_API_SECRET` | Secret Stream Chat (optionnel) |

## Déploiement Vercel (recommandé)

### 1. Base PostgreSQL (Neon)

1. Crée un projet sur [neon.tech](https://neon.tech)
2. Copie la `DATABASE_URL` (connection string)
3. Initialise le schéma une fois :

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run db:seed
```

### 2. Projet Vercel

1. Va sur [vercel.com/new](https://vercel.com/new) → importe le repo GitHub `EpiAI-website`
2. Framework : **Next.js** (détecté automatiquement)
3. Ajoute les variables d'environnement (Settings → Environment Variables) — reprends `.env.example`
4. Deploy

Vercel exécute `prisma generate && next build` automatiquement (`postinstall` + script `build`).

### 3. Clerk (production)

Dans le dashboard Clerk :

- Domaine : ton URL Vercel ou `epiai.eu`
- Redirect URLs : `https://ton-domaine/fr/sign-in`, `/fr/dashboard`, etc.
- Webhook : `https://ton-domaine/api/webhooks/clerk` → copie le secret dans `CLERK_WEBHOOK_SECRET`

### 4. Domaine custom (optionnel)

Vercel → Project → Domains → ajoute `epiai.eu` et configure les DNS chez ton registrar.

### 5. Cron (rappels événements J-1)

Déjà configuré dans `vercel.json` (tous les jours à 8h UTC). Définis `CRON_SECRET` dans Vercel.

### Checklist rapide

- [ ] `DATABASE_URL` → Neon
- [ ] Clerk en mode **production** (`pk_live_...`)
- [ ] `NEXT_PUBLIC_SITE_URL` = URL réelle
- [ ] `db:push` + `db:seed` exécutés sur la base prod
- [ ] Webhook Clerk configuré

> **Note :** les uploads admin (PDF, photos équipe) vont dans `public/uploads/` et ne persistent pas entre redéploiements sur Vercel. Le contenu seedé et les assets dans `public/assets/` fonctionnent normalement.

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
