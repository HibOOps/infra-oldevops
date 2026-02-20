# Guide : Développement Local

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20
**Prérequis** : [getting-started.md](getting-started.md) complété

---

## Table des Matières

1. [Application PriceSync en Local](#1-application-pricesync-en-local)
2. [Modifier le Backend](#2-modifier-le-backend)
3. [Modifier le Frontend](#3-modifier-le-frontend)
4. [Modifier le Schéma de Base de Données](#4-modifier-le-schéma-de-base-de-données)
5. [Modifier l'Infrastructure Ansible](#5-modifier-linfrastructure-ansible)
6. [Modifier Terraform](#6-modifier-terraform)
7. [Variables d'Environnement](#7-variables-denvironnement)

---

## 1. Application PriceSync en Local

```bash
cd app-demo

# Premier démarrage
cp .env.example .env
# Éditer .env : mettre CORS_ORIGIN=* pour le dev local

docker compose up -d

# Vérifier que les 3 services sont healthy
docker compose ps
# pricesync-db       healthy
# pricesync-backend  healthy
# pricesync-frontend healthy

# Logs en temps réel
docker compose logs -f backend
```

**URLs locales** :
- Frontend : http://localhost
- API : http://localhost/api/health
- Swagger : http://localhost/api/docs

---

## 2. Modifier le Backend

Workflow recommandé : éditer les fichiers sources localement, reconstruire l'image.

```bash
cd app-demo/backend

# Installer les dépendances
npm install

# Lancer en mode dev (hot reload avec nodemon)
npm run dev
# → Accessible sur http://localhost:5000

# Lancer les tests
npm test

# Vérifier la couverture
npm test -- --coverage
```

> En mode dev (`npm run dev`), le backend tourne en local sur le port 5000, pas dans Docker. Assurez-vous que la base de données est accessible :
> ```bash
> # Démarrer uniquement la DB
> docker compose up db -d
> # DATABASE_URL dans .env doit pointer vers localhost:5432
> ```

**Ajouter un endpoint** :
1. Créer/modifier le fichier dans `src/routes/`
2. Monter la route dans `src/server.js`
3. Ajouter les tests dans `__tests__/`
4. Mettre à jour le schéma Swagger si nécessaire

---

## 3. Modifier le Frontend

```bash
cd app-demo/frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement (hot reload)
npm run dev
# → Accessible sur http://localhost:5173
# → Proxy /api → http://localhost:5000 (configuré dans vite.config.js)

# Lancer les tests
npm test

# Build de production
npm run build
# → Sortie dans dist/
```

**Structure des pages** :
```
src/
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProductsPage.jsx
│   ├── PricesPage.jsx
│   ├── RulesPage.jsx
│   └── HistoryPage.jsx
├── components/      # Composants réutilisables
└── hooks/           # useAuth, useApi
```

---

## 4. Modifier le Schéma de Base de Données

```bash
cd app-demo/backend

# 1. Modifier prisma/schema.prisma

# 2. Appliquer les changements en dev (sans migrations versionnées)
npx prisma db push

# 3. Régénérer le client Prisma
npx prisma generate

# 4. Mettre à jour le seed si nécessaire
# Éditer prisma/seed.js

# 5. Relancer le seed
node prisma/seed.js

# 6. Visualiser la base de données
npx prisma studio
# → Interface web sur http://localhost:5555
```

---

## 5. Modifier l'Infrastructure Ansible

```bash
# Prérequis : avoir le mot de passe Ansible Vault

# Vérifier la syntaxe d'un rôle
ansible-lint ansible/roles/[role-name]/

# Tester un playbook en dry-run (--check)
ansible-playbook -i ansible/inventory.ini ansible/playbooks/app-demo.yml \
  --ask-vault-pass --check

# Appliquer sur un container spécifique (--limit)
ansible-playbook -i ansible/inventory.ini ansible/playbooks/app-demo.yml \
  --ask-vault-pass --limit 192.168.1.250

# Éditer les secrets vault
ansible-vault edit ansible/vars/proxmox-1_vault.yml
```

---

## 6. Modifier Terraform

```bash
cd terraform

# Initialiser (première fois ou après changement de provider)
terraform init

# Voir les changements prévus
terraform plan

# ⚠️ N'appliquer qu'après revue du plan
terraform apply

# Formater le code
terraform fmt -recursive

# Valider la syntaxe
terraform validate
```

> La modification d'un container existant (proxy, utilities, monitoring) est rare et risquée. Préférer `--target` pour limiter la portée.

---

## 7. Variables d'Environnement

### Application PriceSync (app-demo/.env)

```env
# Base de données
DATABASE_URL=postgresql://pricesync:pricesync_password@db:5432/pricesync_db

# JWT
JWT_SECRET=dev_secret_change_in_prod
JWT_EXPIRES_IN=24h

# Serveur
PORT=5000
NODE_ENV=development

# CORS — mettre * en dev local, domaine précis en production
CORS_ORIGIN=*
```

### Secrets CI/CD (GitHub Secrets — ne pas stocker localement)

| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | Clé SSH pour accès aux containers |
| `PROXMOX_API_TOKEN` | Token API Proxmox |
| `ANSIBLE_VAULT_PASSWORD` | Mot de passe Ansible Vault |
| `JWT_SECRET` | Secret JWT production |
