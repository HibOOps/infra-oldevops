# ADR-007 : Approche Monorepo

**Statut** : Accepté
**Date** : 2026-01-07
**Auteur** : Équipe DevOps

---

## Contexte

Le projet comprend du code infrastructure (Terraform, Ansible) et du code applicatif (React, Node.js). Deux approches sont possibles : un seul repository (monorepo) ou des repositories séparés (multi-repo).

## Décision

Utiliser un **monorepo** (`infra-oldevops`) contenant à la fois l'infrastructure et l'application.

## Justification

**Cohérence** : l'application PriceSync existe spécifiquement pour démontrer l'infrastructure — elles sont couplées par nature.

**Portfolio** : un seul lien GitHub montre l'ensemble du projet (infrastructure + app + CI/CD). Un recruteur voit tout en un coup d'œil.

**CI/CD unifié** : les workflows dans `.github/workflows/` gèrent infrastructure et application depuis le même endroit. Les path filters GitHub Actions (`paths: ['app-demo/**']`) isolent les déclencheurs.

**Changements atomiques** : une PR peut modifier à la fois `ansible/roles/traefik/` et `app-demo/docker-compose.yml` de façon cohérente.

**Alternatives considérées** :
- **Multi-repo** (infra-oldevops + pricesync-app) : deux repos à maintenir, deux pipelines CI, coordination des changements complexe, deux liens à partager aux recruteurs

## Conséquences

✅ Source unique de vérité
✅ Présentation portfolio simplifiée (1 lien = tout le projet)
✅ Changements infra + app dans la même PR
⚠️ Repository plus volumineux (node_modules ignorés via .gitignore)
⚠️ Workflows CI partagent le même namespace — résolu par path filters

## Implémentation

```yaml
# Isolation par path filters dans les workflows
on:
  push:
    paths:
      - 'app-demo/**'           # Workflow app uniquement
      # ou
      - 'terraform/**'          # Workflow infra uniquement
      - 'ansible/**'
```

Structure :
```
infra-oldevops/
├── terraform/       # Infrastructure Proxmox
├── ansible/         # Configuration services
├── app-demo/        # Application PriceSync
├── docs/            # Documentation
├── scripts/         # Utilitaires
└── .github/         # CI/CD workflows
```
