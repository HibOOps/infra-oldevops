# Guide : Contribution

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20
**Prérequis** : [getting-started.md](getting-started.md), [local-development.md](local-development.md)

---

## Table des Matières

1. [Workflow Git](#1-workflow-git)
2. [Conventions de Commit](#2-conventions-de-commit)
3. [Standards de Code](#3-standards-de-code)
4. [Checklist avant PR](#4-checklist-avant-pr)
5. [Process de Review](#5-process-de-review)
6. [Gestion des Branches de Protection](#6-gestion-des-branches-de-protection)

---

## 1. Workflow Git

```bash
# 1. Toujours partir d'un main à jour
git checkout main
git pull origin main

# 2. Créer une branche feature
git checkout -b feat/ma-fonctionnalite
# ou : fix/mon-bug, docs/ma-doc, chore/ma-tache

# 3. Développer + commiter régulièrement
git add [fichiers spécifiques]
git commit -m "feat(app): description courte"

# 4. Push et créer la PR
git push origin feat/ma-fonctionnalite
# → Ouvrir une PR sur GitHub vers main
```

> ⚠️ **Ne jamais** pousser directement sur `main`. Les branch protection rules l'exigent.

---

## 2. Conventions de Commit

Format **Conventional Commits** : `type(scope): description`

### Types

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `refactor` | Refactoring sans changement de comportement |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance (deps, config) |
| `ci` | Modifications CI/CD |

### Scopes courants

| Scope | Périmètre |
|-------|-----------|
| `app` | Application PriceSync (général) |
| `backend` | Backend Node.js/Express |
| `frontend` | Frontend React |
| `infra` | Terraform |
| `ansible` | Playbooks/rôles Ansible |
| `traefik` | Configuration Traefik |
| `ci` | GitHub Actions workflows |
| `docs` | Documentation |

### Exemples

```
feat(backend): add CSV export endpoint for price history
fix(traefik): correct path prefix priority for pricesync-api router
docs(runbooks): add troubleshooting section for Prisma errors
ci(app-docker): bump node base image to 22-alpine
chore(deps): update prisma to 5.23.0
```

---

## 3. Standards de Code

### Backend (Node.js)

- Validation des inputs avec **Zod** sur toutes les routes
- Gestion d'erreurs via `errorHandler.js` (ne pas renvoyer les stack traces en production)
- Authentification JWT sur toutes les routes sauf `/api/auth/*` et `/api/health`
- Tests Jest pour tout nouvel endpoint (happy path + cas d'erreur)

```javascript
// ✅ Bon — validation Zod + gestion erreur centralisée
router.post('/products', authenticate, validate(productSchema), async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});
```

### Frontend (React)

- Composants fonctionnels uniquement (pas de classes)
- `useApi` hook pour tous les appels API (gestion auth header automatique)
- `useAuth` hook pour l'état d'authentification
- Tests Vitest + React Testing Library pour les pages et composants

### Ansible

- Playbooks **idempotents** — peuvent être relancés sans effet de bord
- Secrets toujours via Ansible Vault ou variables `vault_*`
- `ansible-lint` doit passer sans erreur

### Terraform

- `terraform fmt` appliqué avant chaque commit
- `terraform validate` doit passer
- Pas de ressources sans `description` ou commentaire

---

## 4. Checklist avant PR

```markdown
- [ ] Les tests passent localement (`npm test`)
- [ ] `ansible-lint` passe (si changement Ansible)
- [ ] `terraform fmt` appliqué (si changement Terraform)
- [ ] Pas de secrets en clair dans le code
- [ ] Documentation mise à jour si comportement modifié
- [ ] Commit message en Conventional Commits
- [ ] `docker compose up` fonctionne (si changement app)
```

---

## 5. Process de Review

1. **Ouvrir la PR** vers `main` avec description des changements
2. **CI automatique** : les checks doivent être verts (lint, tests, security scan)
3. **Review** : 1 approbation requise (ou auto-merge si owner du repo)
4. **Merge** : squash and merge recommandé pour les features
5. **Déploiement** : automatique après merge si les checks passent

---

## 6. Gestion des Branches de Protection

`main` est protégé — les règles suivantes s'appliquent :
- PR obligatoire (pas de push direct)
- Status checks requis (CI doit passer)

Le bypass est possible pour le owner du repo (commits urgents), mais doit rester exceptionnel.

Pour les hotfixes urgents :
```bash
git checkout -b hotfix/description-courte
# ... corriger ...
git push origin hotfix/description-courte
# Créer une PR en urgent — merge rapide autorisé
```
