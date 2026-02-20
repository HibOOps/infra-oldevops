# ADR-004 : Node.js + Express / React pour l'application de démonstration

**Statut** : Accepté
**Date** : 2026-01-07
**Auteur** : Équipe DevOps

---

## Contexte

L'application de démonstration (PriceSync) doit illustrer des compétences full-stack tout en restant cohérente avec un portfolio DevOps. Le stack doit être reconnaissable par les recruteurs et facilement maintenable dans un contexte d'infrastructure-first.

## Décision

- **Frontend** : React 18 + Vite (JavaScript, pas TypeScript pour la simplicité)
- **Backend** : Node.js + Express + Prisma + PostgreSQL
- **Containerisation** : Docker multi-stage avec nginx pour le frontend

## Justification

| Critère | Node.js/React | Python FastAPI | Go |
|---------|--------------|---------------|-----|
| Reconnaissance recruteurs | ✅ Très courant | ✅ Courant | 🟡 Niche |
| Langage unique F+B | ✅ JavaScript | ❌ | ❌ |
| Écosystème Docker | ✅ node:alpine | ✅ | ✅ |
| CI/CD npm | ✅ Simple | 🟡 pip/poetry | 🟡 go build |
| ORM moderne | ✅ Prisma | ✅ SQLAlchemy | 🟡 GORM |

**Raisons principales** :
- JavaScript full-stack = pipeline CI unifié (`npm test`, `npm run build`)
- Prisma : ORM déclaratif, migrations via `db push`, client généré fortement typé
- React + Vite : build ultra-rapide, hot reload en dev
- nginx : serve statique + proxy `/api` → backend (pas de CORS à gérer)

**Alternatives considérées** :
- **Python + FastAPI** : viable, mais deux langages = deux pipelines CI, deux Dockerfiles différents
- **Go** : impressionnant mais le focus portfolio est l'infrastructure, pas le langage backend
- **Next.js** : SSR inutile ici (app interne), overhead non justifié
- **Vue.js** : moins demandé que React dans les offres DevOps/Platform Engineer

## Conséquences

✅ Stack mainstream, facilement compréhensible par les recruteurs
✅ Pipeline CI unifié (npm pour frontend et backend)
✅ Prisma `db push` = migration sans fichiers de migration (adapté aux démos)
⚠️ JavaScript peut sembler moins "impressionnant" que Go/Rust — compensé par la qualité de l'infra
⚠️ `db push` n'est pas adapté à la production long terme (pas de migrations versionnées)

## Implémentation

```dockerfile
# Build multi-stage backend — node:20-alpine
FROM node:20-alpine AS builder
RUN npm ci
RUN npx prisma generate
FROM node:20-alpine AS runner
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/server.js"]
```

```nginx
# nginx.conf — proxy /api vers backend
location /api/ {
    proxy_pass http://backend:5000/api/;
}
```
