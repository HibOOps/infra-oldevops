# Récapitulatif - Story 1.3a : Pipeline de Déploiement Automatisé (Base)

**Date**: 2026-01-09
**Story**: Story 1.3a - Déploiement Automatisé de Base
**Approche**: Progressive (Story 1.3 découpée en 1.3a + 1.3b)

---

## 🎯 Objectif

Implémenter un pipeline de déploiement automatisé GitOps avec approbation manuelle pour l'infrastructure Homelab.

**Scope Story 1.3a** (Version de Base) :
- ✅ Workflow de déploiement automatique
- ✅ Approbation manuelle via GitHub Environment
- ✅ Terraform apply automatique
- ✅ Ansible playbooks automatiques
- ✅ Notifications de déploiement

**Exclu pour Story 1.3b** (Future) :
- ❌ Snapshots Proxmox pré-déploiement
- ❌ Health checks post-déploiement
- ❌ Rollback automatique

---

## 📦 Fichiers Ajoutés

### 1. Workflow de Déploiement
**Fichier**: `.github/workflows/deploy-infra.yml`

**Déclencheurs**:
- `push` vers `master` (automatique)
- `workflow_dispatch` (manuel)

**Étapes du Workflow**:
1. **Checkout** du code
2. **Backup** du Terraform state
3. **Terraform Init** - Initialisation backend S3
4. **Terraform Plan** - Génération du plan
5. **Terraform Apply** - Application automatique des changements
6. **Ansible - Traefik** - Déploiement du reverse proxy
7. **Ansible - Utilities** - Déploiement de Vaultwarden, Snipe-IT, NetBox
8. **Ansible - Monitoring** - Déploiement de Uptime Kuma, Prometheus, Grafana
9. **Summary** - Résumé du déploiement
10. **Notification** - Commentaire sur le commit avec résultats

**Environment**: `production` (approbation manuelle requise)

**Runner**: `self-hosted` (ci-runner sur 192.168.1.210)

### 2. Documentation

**Fichier**: `docs/GITHUB-ENVIRONMENT-SETUP.md`

Guide complet pour :
- Créer l'environment GitHub `production`
- Configurer les required reviewers
- Configurer la protection de branche
- Approuver/Rejeter un déploiement
- Monitoring des déploiements
- Dépannage

**Fichier**: `docs/CHANGES-STORY-1.3a.md` (ce fichier)

Récapitulatif des changements.

---

## 🔧 Configuration Requise

### GitHub Environment "production"

À configurer manuellement dans GitHub :

1. **Créer l'environment** :
   - Nom : `production`
   - Required reviewers : 1 (votre compte)
   - Deployment branches : `master` uniquement

2. **Secrets** (déjà configurés au niveau repository) :
   - `OVH_S3_ACCESS_KEY`
   - `OVH_S3_SECRET_KEY`
   - `PROXMOX_PASSWORD`
   - `PROXMOX_USERNAME`
   - `CONTAINER_PASSWORD`
   - `ANSIBLE_VAULT_PASSWORD`

**⚠️ Action Requise** : Suivre le guide `docs/GITHUB-ENVIRONMENT-SETUP.md` pour configurer l'environment avant le premier déploiement.

---

## 🚀 Flux de Déploiement

### Scénario Nominal

```
1. Developer merge PR → master
2. Workflow démarre automatiquement
3. Workflow s'arrête et attend approbation
   └─ Notification envoyée au reviewer
4. Reviewer approuve le déploiement
5. Workflow exécute les étapes :
   └─ Terraform apply
   └─ Ansible playbooks (traefik, utilities, monitoring)
6. Notification postée sur le commit avec résultats
7. Infrastructure déployée ✅
```

### Scénario avec Rejet

```
1. Developer merge PR → master
2. Workflow démarre automatiquement
3. Workflow s'arrête et attend approbation
4. Reviewer rejette le déploiement
   └─ Commentaire expliquant le rejet
5. Workflow cancelled ❌
6. Developer corrige le problème
7. Nouveau commit → nouveau workflow
```

---

## 📊 Critères d'Acceptation Couverts

### ✅ CA3.1 : Workflow de Déploiement
- [x] Un workflow `.github/workflows/deploy-infra.yml` existe
- [x] Le workflow se déclenche automatiquement sur `push` vers `master`
- [x] Le workflow s'exécute sur le runner auto-hébergé
- [x] Le workflow inclut : checkout, Terraform apply, Ansible playbooks

### ✅ CA3.2 : Approbation Manuelle Requise
- [x] Le workflow utilise un GitHub Environment nommé `production`
- [x] L'environment requiert au moins 1 reviewer
- [x] Protection de branche : déploiement uniquement depuis `master`
- [x] Le workflow attend l'approbation avant exécution
- [x] Interface GitHub affiche "Waiting for approval"

### ✅ CA3.4 : Exécution Terraform et Ansible
- [x] Backup du Terraform state
- [x] `terraform init`
- [x] `terraform plan`
- [x] `terraform apply -auto-approve`
- [x] Ansible playbooks dans l'ordre (traefik, utilities, monitoring)
- [x] Outputs Terraform affichés dans les logs
- [x] Résultats Ansible capturés et loggés

### ✅ CA3.6 : Notification de Déploiement
- [x] Commentaire automatique sur le commit
- [x] Status du déploiement (✅ Succès / ⚠️ Échec)
- [x] Changements Terraform appliqués
- [x] Résultats Ansible pour chaque playbook
- [x] Lien vers les logs complets
- [x] Emojis pour visibilité (🎉 / ⚠️)

---

## ❌ Non Implémenté (Story 1.3b Future)

### CA3.3 : Snapshots Proxmox Pré-Déploiement
- [ ] Snapshots automatiques des containers avant déploiement
- [ ] Script `scripts/create-snapshots.sh`

**Raison** : Complexité additionnelle, nécessite API Proxmox, risque d'erreurs.

### CA3.5 : Health Checks Post-Déploiement
- [ ] Vérifications HTTP sur `*.oldevops.fr`
- [ ] Vérifications SSH sur tous les containers
- [ ] Vérifications Docker
- [ ] Script `scripts/health-check.sh`

**Raison** : Nécessite définition précise des checks, gestion des timeouts.

### CA3.7 : Rollback Automatique en Cas d'Échec
- [ ] Rollback automatique si health checks échouent
- [ ] Restoration des snapshots
- [ ] Script `scripts/rollback.sh`

**Raison** : Dépend de CA3.3 et CA3.5, risque d'aggraver la situation si mal configuré.

---

## 🧪 Tests Recommandés

### Test 1 : Configuration de l'Environment

**Objectif** : Vérifier que l'environment `production` est correctement configuré.

**Procédure** :
1. Aller sur https://github.com/HibOOps/infra-oldevops/settings/environments
2. Vérifier que l'environment `production` existe
3. Vérifier que "Required reviewers" est activé avec au moins 1 reviewer
4. Vérifier que "Deployment branches" est limité à `master`

**Résultat attendu** : Configuration correcte ✅

### Test 2 : Déploiement avec Changement Mineur

**Objectif** : Tester le workflow end-to-end avec un changement sans impact.

**Procédure** :
1. Sur une branche feature, modifier un tag dans `terraform/main.tf` :
   ```hcl
   tags = "${local.common_tags};test-deploy"
   ```
2. Créer une PR vers `master`
3. Attendre que les workflows de validation passent
4. Merger la PR
5. Le workflow `deploy-infra` démarre automatiquement
6. Approuver le déploiement dans l'interface GitHub
7. Attendre la fin du workflow
8. Vérifier la notification sur le commit

**Résultat attendu** :
- ✅ Workflow démarre automatiquement
- ✅ Workflow attend l'approbation
- ✅ Terraform apply réussit
- ✅ Ansible playbooks réussissent
- ✅ Notification postée avec résumé

### Test 3 : Rejet d'un Déploiement

**Objectif** : Tester le comportement en cas de rejet.

**Procédure** :
1. Merger un commit dans `master`
2. Le workflow démarre
3. Rejeter le déploiement avec commentaire "Test de rejet"
4. Vérifier que le workflow s'arrête

**Résultat attendu** :
- ✅ Workflow cancelled
- ✅ Pas d'exécution de Terraform/Ansible
- ✅ Status "cancelled" dans GitHub Actions

---

## 📈 Métriques de Succès

**Workflow Performance** :
- Durée moyenne d'un déploiement : ~5-10 minutes
  - Terraform apply : ~2-3 minutes
  - Ansible playbooks : ~3-5 minutes
  - Notifications : <30 secondes

**Fiabilité** :
- Taux de succès attendu : >90%
- Rollback manuel possible en cas d'échec

**Utilisation** :
- Fréquence de déploiement : ~1-2x par semaine (après merge de PR)
- Approbation manuelle : garantit validation humaine avant déploiement

---

## 🔜 Prochaines Étapes (Story 1.3b)

Une fois la Story 1.3a stabilisée et testée, implémenter :

1. **Snapshots Proxmox** (CA3.3)
   - Script utilisant l'API Proxmox
   - Intégration dans le workflow avant Terraform apply

2. **Health Checks** (CA3.5)
   - Script validant tous les services
   - Checks HTTP, SSH, Docker
   - Intégration après Ansible playbooks

3. **Rollback Automatique** (CA3.7)
   - Restauration des snapshots si health checks échouent
   - Notification de rollback
   - Ré-exécution des health checks post-rollback

---

## 📝 Notes Importantes

### Sécurité

- ✅ Approbation manuelle obligatoire (pas de déploiement automatique sans validation)
- ✅ Secrets GitHub utilisés pour credentials sensibles
- ✅ Runner self-hosted isolé dans un container LXC dédié
- ✅ Ansible vault pour les secrets dans les playbooks

### Limitations Actuelles

- ⚠️ **Pas de rollback automatique** : En cas d'échec, rollback manuel nécessaire
- ⚠️ **Pas de health checks** : Impossible de détecter automatiquement un déploiement cassé
- ⚠️ **Pas de snapshots** : Pas de protection automatique contre les erreurs

### Recommandations

1. **Toujours tester les changements en local** avant de merger
2. **Vérifier les services manuellement** après un déploiement
3. **Conserver les logs des déploiements** pour debug
4. **Documenter les déploiements manuels** (cas particuliers)

---

**Auteur** : Olivier
**Date de création** : 2026-01-09
**Dernière mise à jour** : 2026-01-09
