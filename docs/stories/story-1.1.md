# Story 1.1 : GitHub Actions - Pipeline de Validation Infrastructure

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P0 (Bloquant)
**Points d'effort** : 5
**Dépendances** : Aucune

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** un pipeline GitHub Actions automatique validant mes changements Terraform et Ansible,
**Afin de** garantir la qualité du code infrastructure avant tout merge et démontrer des pratiques CI/CD professionnelles.

## Contexte

Cette story pose les fondations du pipeline CI/CD en implémentant la validation automatique du code infrastructure. C'est la première étape vers l'automatisation complète du workflow GitOps.

## Critères d'Acceptation

### CA1.1 : Workflow Terraform Validation
✅ **Terminé** : ⬜
- Un workflow `.github/workflows/terraform-validate.yml` existe
- Le workflow se déclenche sur chaque Pull Request modifiant des fichiers `terraform/**`
- Le workflow exécute les commandes suivantes dans l'ordre :
  1. `terraform fmt -check` (vérifie le formatage)
  2. `terraform init` (initialisation)
  3. `terraform validate` (validation syntaxe/références)
  4. `terraform plan` (génération du plan)
- Les sorties des commandes sont visibles dans les logs GitHub Actions
- Le workflow échoue si l'une des commandes retourne un code d'erreur

### CA1.2 : Workflow Ansible Validation
✅ **Terminé** : ⬜
- Un workflow `.github/workflows/ansible-lint.yml` existe
- Le workflow se déclenche sur chaque Pull Request modifiant des fichiers `ansible/**`
- Le workflow exécute :
  1. `ansible-lint` sur tous les fichiers YAML du dossier `ansible/`
  2. `ansible-playbook --syntax-check` sur tous les playbooks
- Les erreurs sont affichées clairement dans les logs
- Le workflow utilise une version fixée d'ansible-lint (ex: 6.x)

### CA1.3 : Workflow Security Scanning
✅ **Terminé** : ⬜
- Un workflow `.github/workflows/security-scan.yml` existe
- Le workflow se déclenche sur chaque Pull Request
- Le workflow exécute :
  1. `tfsec` sur le dossier `terraform/` (scan sécurité IaC)
  2. `git-secrets --scan` ou `trufflehog` (détection secrets)
- Le workflow échoue si des secrets sont détectés
- Les vulnérabilités critiques (HIGH/CRITICAL) de tfsec font échouer le workflow
- Les résultats sont disponibles en artifacts ou commentaires PR

### CA1.4 : Protection de Branche
✅ **Terminé** : ⬜
- La branche `main` est protégée sur GitHub avec :
  - Status checks requis : `terraform-validate`, `ansible-lint`, `security-scan`
  - Au moins 1 approbation de PR requise
  - Les admins ne peuvent pas bypass les protections (optionnel mais recommandé)
- Aucun push direct sur `main` n'est possible
- Les PRs ne peuvent être mergées que si tous les checks passent ✅

### CA1.5 : Commentaires Automatiques sur PRs
✅ **Terminé** : ⬜
- Le workflow `terraform-validate` poste automatiquement le résultat du `terraform plan` en commentaire sur la PR
- Le commentaire inclut :
  - Nombre de ressources à créer/modifier/détruire
  - Détails du plan (formaté avec code blocks)
  - Lien vers les logs complets du workflow
- Le commentaire est mis à jour sur chaque nouveau push vers la PR

### CA1.6 : Badge de Build Status
✅ **Terminé** : ⬜
- Un badge GitHub Actions est ajouté au README.md principal
- Le badge affiche le statut du workflow de validation (passing/failing)
- Le badge est cliquable et redirige vers la page des workflows
- Format : `[![Infrastructure CI](https://github.com/.../workflows/.../badge.svg)](lien)`

## Vérifications d'Intégration

### VI1 : Non-régression Infrastructure
✅ **Vérifié** : ⬜
- L'infrastructure existante (3 containers + 8 services) n'est pas modifiée par cette story
- Aucune ressource Proxmox n'est créée/modifiée/détruite
- Les workflows ajoutent uniquement des validations, pas de déploiement

### VI2 : Compatibilité avec Déploiement Manuel
✅ **Vérifié** : ⬜
- Le script `deploy.sh` existant continue de fonctionner sans modification
- Les workflows CI ne bloquent pas les déploiements manuels locaux
- Les deux workflows (automatique et manuel) coexistent

### VI3 : Tests sur Branche de Feature
✅ **Vérifié** : ⬜
- Les workflows sont testés sur une branche `feature/ci-setup` avant merge vers `main`
- Au moins 1 PR de test est créée et mergée avec succès
- Tous les checks passent sur la PR de test

## Tâches Techniques

### Phase 1 : Setup Initial
- [ ] Créer le dossier `.github/workflows/`
- [ ] Configurer les secrets GitHub nécessaires (TERRAFORM_TOKEN, SSH_KEY, etc.)
- [ ] Créer une branche `feature/ci-validation-pipeline`

### Phase 2 : Workflow Terraform
- [ ] Créer `.github/workflows/terraform-validate.yml`
- [ ] Configurer le trigger sur paths `terraform/**`
- [ ] Implémenter les steps : fmt check, init, validate, plan
- [ ] Configurer le backend Terraform (accès OVH S3 state)
- [ ] Ajouter l'action pour commenter le plan sur la PR

### Phase 3 : Workflow Ansible
- [ ] Créer `.github/workflows/ansible-lint.yml`
- [ ] Configurer le trigger sur paths `ansible/**`
- [ ] Installer ansible-lint (version 6.x)
- [ ] Implémenter les steps : lint, syntax-check
- [ ] Configurer l'inventaire Ansible pour validation

### Phase 4 : Workflow Security
- [ ] Créer `.github/workflows/security-scan.yml`
- [ ] Intégrer tfsec avec configuration personnalisée
- [ ] Intégrer git-secrets ou trufflehog
- [ ] Configurer les seuils de sévérité (fail on CRITICAL)
- [ ] Exporter les résultats en artifacts

### Phase 5 : Configuration GitHub
- [ ] Activer la protection de branche sur `main`
- [ ] Configurer les status checks requis
- [ ] Ajouter le badge au README.md
- [ ] Documenter le workflow dans CONTRIBUTING.md (si existe)

### Phase 6 : Tests et Validation
- [ ] Créer une PR de test modifiant un fichier Terraform
- [ ] Vérifier que tous les workflows se déclenchent
- [ ] Vérifier les commentaires automatiques
- [ ] Corriger les erreurs détectées
- [ ] Merger la PR de setup

## Définition of Done

- [ ] Tous les critères d'acceptation (CA1.1 à CA1.6) sont validés ✅
- [ ] Toutes les vérifications d'intégration (VI1 à VI3) sont passées ✅
- [ ] Au moins 1 PR complète a été testée avec succès (création → validation → merge)
- [ ] Le badge de status apparaît dans le README et affiche "passing"
- [ ] La documentation est mise à jour (si CONTRIBUTING.md existe)
- [ ] Code review effectué et approuvé
- [ ] PR mergée vers `main`

## Risques et Mitigations

### Risque 1 : Échec d'accès au Terraform State (OVH S3)
**Probabilité** : Moyenne | **Impact** : Bloquant
**Mitigation** :
- Configurer les credentials OVH S3 dans GitHub Secrets
- Tester l'accès au state via un workflow simple avant implémentation complète
- Plan B : Utiliser un state local en read-only pour validation uniquement

### Risque 2 : Faux positifs de git-secrets
**Probabilité** : Moyenne | **Impact** : Moyen
**Mitigation** :
- Configurer des patterns d'exclusion pour les faux positifs connus
- Utiliser `.gitignore` et `.secretsignore` correctement
- Documenter les exclusions justifiées

### Risque 3 : Workflows lents ralentissant les PRs
**Probabilité** : Faible | **Impact** : Moyen
**Mitigation** :
- Optimiser l'initialisation Terraform (cache des providers)
- Limiter ansible-lint aux fichiers modifiés uniquement
- Définir un timeout maximum (10 minutes)

## Ressources et Références

### Documentation
- [GitHub Actions - Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Terraform in CI/CD](https://developer.hashicorp.com/terraform/tutorials/automation/automate-terraform)
- [Ansible Lint Documentation](https://ansible-lint.readthedocs.io/)

### Outils
- [tfsec - Terraform Security Scanner](https://github.com/aquasecurity/tfsec)
- [git-secrets](https://github.com/awslabs/git-secrets)
- [terraform-plan-comment Action](https://github.com/marketplace/actions/terraform-pr-commenter)

### Exemples
- Voir des repos similaires sur GitHub pour inspiration workflows
- Templates GitHub Actions pour Terraform et Ansible

## Notes et Commentaires

_Cette section sera complétée pendant l'implémentation avec des notes importantes, décisions prises, problèmes rencontrés, etc._

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-01-07
**Assigné à** : _À définir_
**Sprint** : _À définir_
