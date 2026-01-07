# Transformation Portfolio Infrastructure Professionnelle - PRD

**Projet**: Infra-OlDevOps Vitrine Professionnelle
**Type**: Amélioration Brownfield
**Version**: 1.0
**Date**: 2026-01-07
**Statut**: Brouillon - Prêt pour Revue

---

## Table des Matières

1. [Analyse et Contexte du Projet](#1-analyse-et-contexte-du-projet)
2. [Objectifs et Contexte](#2-objectifs-et-contexte)
3. [Exigences](#3-exigences)
4. [Contraintes Techniques et Intégration](#4-contraintes-techniques-et-intégration)
5. [Structure Epic et Stories](#5-structure-epic-et-stories)

---

## 1. Analyse et Contexte du Projet

### 1.1 Source de l'Analyse

**Analyse complète basée sur l'IDE** réalisée le 2026-01-07

### 1.2 État Actuel du Projet

**Projet existant** : `infra-oldevops` - Homelab Infrastructure-as-Code

**Capacités actuelles** :
- 3 containers LXC déployés sur Proxmox VE (proxy, utilities, monitoring)
- 8 services en production via Docker Compose
- Automatisation de l'infrastructure via Terraform + Ansible
- Script de déploiement automatisé (`deploy.sh`)
- Domaine : oldevops.fr avec SSL via Let's Encrypt (challenge DNS-01)

**Services déployés** :
| Service | URL | Description |
|---------|-----|-------------|
| Traefik | https://proxy.oldevops.fr | Reverse proxy avec SSL automatique |
| Vaultwarden | https://vault.oldevops.fr | Gestionnaire de mots de passe (compatible Bitwarden) |
| Snipe-IT | https://inventory.oldevops.fr | Gestion des actifs IT |
| NetBox | https://netbox.oldevops.fr | Documentation réseau & DCIM |
| Uptime Kuma | https://status.oldevops.fr | Monitoring et uptime des services |
| Zabbix | https://monitoring.oldevops.fr | Plateforme de monitoring avancée |
| Prometheus | https://prometheus.oldevops.fr | Collection de métriques |
| Grafana | https://grafana.oldevops.fr | Visualisation de métriques |

**Stack technologique** :
- **Infrastructure** : Proxmox VE, containers LXC (Debian 12)
- **IaC** : Terraform 1.0+, Ansible 2.10+
- **Containerisation** : Docker CE, Docker Compose
- **Réseau** : Traefik v3, DNS OVH
- **Monitoring** : Prometheus, Grafana, Zabbix, Uptime Kuma
- **Gestion d'état** : OVH S3 (Terraform state)

### 1.3 Documentation Disponible

✅ **Documentation Stack Technique** (README.md)
✅ **Vue d'ensemble Architecture** (README.md, MAINTENANCE.md)
✅ **Guide de Déploiement** (README.md, deploy.sh)
✅ **Dette Technique** (MAINTENANCE.md)
❌ **Pipeline CI/CD** (inexistant)
❌ **Tests Automatisés** (inexistant)
❌ **Application de Démonstration** (inexistant)
❌ **Diagrammes d'Architecture Formels**
❌ **Runbooks Opérationnels**

### 1.4 Périmètre de l'Amélioration

**Type d'amélioration** :
- ✅ Ajout de Nouvelles Fonctionnalités (Application frontend + CI/CD)
- ✅ Intégration avec Nouveaux Systèmes (GitHub Actions)
- ✅ Amélioration de la Stack Technique (Monitoring avancé)

**Description de l'amélioration** :

Transformer l'infrastructure homelab existante en **vitrine professionnelle** pour les recruteurs, démontrant une maîtrise complète DevOps/Infrastructure à travers :
- Pipeline CI/CD complet avec GitHub Actions
- Application frontend moderne déployée sur l'infrastructure
- Monitoring et observabilité avancés
- Documentation professionnelle exhaustive
- Démonstration des pratiques DevOps modernes

**Évaluation de l'impact** : ✅ **Impact Modéré à Significatif**
- Nouveaux composants ajoutés (container d'application)
- Intégration de GitHub Actions (nouveau workflow)
- Modifications des processus de déploiement existants
- Pas de changements architecturaux majeurs de l'infrastructure existante

---

## 2. Objectifs et Contexte

### 2.1 Objectifs

**Critères de succès** - Cette amélioration permettra de :

- Démontrer une maîtrise complète de la stack DevOps moderne aux recruteurs
- Prouver la capacité à gérer une infrastructure professionnelle end-to-end
- Montrer l'automatisation complète du cycle de vie (CI/CD)
- Illustrer les compétences fullstack (infrastructure + application)
- Établir un portfolio technique concret et démontrable

### 2.2 Contexte

Ce projet d'infrastructure existe actuellement comme laboratoire de test personnel avec une base solide (Terraform, Ansible, services déployés). L'objectif est de le transformer en **vitrine professionnelle** démontrant :

1. **Pratiques DevOps Modernes** : CI/CD automatisé, GitOps, infrastructure immutable
2. **Compétences Fullstack** : De l'infrastructure au déploiement d'applications réelles
3. **Excellence Opérationnelle** : Monitoring, observabilité, disaster recovery
4. **Standards Professionnels** : Documentation, sécurité, bonnes pratiques

Le projet s'adresse à des recruteurs DevOps/SRE/Platform Engineer cherchant à valider des compétences concrètes au-delà d'un CV traditionnel.

### 2.3 Journal des Modifications

| Modification | Date | Version | Description | Auteur |
|--------------|------|---------|-------------|--------|
| PRD Initial | 2026-01-07 | 1.0 | Création du PRD d'amélioration brownfield | Agent PM |

---

## 3. Exigences

### 3.1 Exigences Fonctionnelles

**EF1** : Le système doit implémenter un pipeline GitHub Actions pour valider automatiquement les changements Terraform (fmt, validate, plan, tfsec) sur chaque Pull Request.

**EF2** : Le système doit implémenter un pipeline GitHub Actions pour valider les playbooks Ansible (ansible-lint, syntax-check) sur chaque Pull Request.

**EF3** : Le système doit déployer automatiquement l'infrastructure via GitHub Actions lors d'un merge vers la branche main, avec approbation manuelle obligatoire.

**EF4** : Une application frontend moderne (React/Vue + TypeScript) doit être déployée sur un nouveau container LXC dédié avec son pipeline CI/CD complet (build, test, deploy).

**EF5** : L'application frontend doit exposer une API backend (Node.js/FastAPI) avec base de données PostgreSQL, démontrant une architecture microservices.

**EF6** : Le système doit intégrer Loki pour l'agrégation centralisée des logs de tous les containers et services.

**EF7** : Des dashboards Grafana préconfigurés doivent être versionnés dans le repository et déployés automatiquement, couvrant : infrastructure (CPU/RAM/Disk), services (uptime, latence), application (métriques métier).

**EF8** : Le système doit implémenter une segmentation réseau améliorée avec isolation par zone :
- Zone DMZ (proxy, application publique)
- Zone Backend (services internes, bases de données)
- Zone Monitoring (stack observabilité)

**EF9** : Un système de backup automatisé doit être déployé avec :
- Snapshots quotidiens Proxmox
- Backup bases de données
- Export Terraform state
- Rétention 7 jours local + copie offsite

**EF10** : La documentation technique doit inclure :
- Diagrammes d'architecture (réseau, CI/CD, applicatif)
- Runbooks opérationnels (déploiement, rollback, troubleshooting)
- Architecture Decision Records (ADRs)
- Guide contributeur avec standards de code

**EF11** : Le système doit implémenter un scanning de sécurité automatisé :
- Scan des images Docker (Trivy)
- Scan Terraform (tfsec/checkov)
- Scan des dépendances (OWASP Dependency Check)
- Détection de secrets (git-secrets/trufflehog)

**EF12** : Un système de gestion des secrets professionnel doit remplacer Ansible Vault manuel :
- GitHub Secrets pour CI/CD
- Rotation documentée des secrets
- Accès aux secrets depuis l'application via variables d'environnement

**EF13** : Le README principal doit être transformé en vitrine professionnelle avec :
- Badges de build/security status
- Diagrammes interactifs
- Section "Compétences Démontrées" pour recruteurs
- Liens vers démonstration live

---

### 3.2 Exigences Non-Fonctionnelles

**ENF1 - Performance** : Le pipeline CI/CD complet (validation + déploiement) ne doit pas excéder 10 minutes d'exécution.

**ENF2 - Performance** : L'application frontend doit répondre en moins de 200ms (p95) sous charge normale.

**ENF3 - Performance** : Les dashboards Grafana doivent se charger en moins de 3 secondes avec 7 jours de métriques.

**ENF4 - Disponibilité** : L'infrastructure doit supporter un déploiement sans interruption des services critiques (zero-downtime deployment).

**ENF5 - Disponibilité** : Le monitoring doit détecter une panne de service en moins de 1 minute et envoyer une alerte.

**ENF6 - Sécurité** : Toutes les communications entre containers doivent être chiffrées (TLS interne avec Traefik).

**ENF7 - Sécurité** : Aucun secret ne doit être committé dans Git (validation via pre-commit hooks et GitHub Actions).

**ENF8 - Sécurité** : Les images Docker déployées ne doivent contenir aucune vulnérabilité critique (CVSS ≥ 9.0).

**ENF9 - Maintenabilité** : Le code Infrastructure-as-Code doit être modulaire avec réutilisation maximale (principe DRY).

**ENF10 - Maintenabilité** : Chaque composant déployé doit être documenté avec sa configuration, ses dépendances et sa procédure de rollback.

**ENF11 - Observabilité** : Chaque service déployé doit exposer des métriques Prometheus et envoyer des logs vers Loki.

**ENF12 - Observabilité** : Les logs doivent être structurés (JSON) avec contexte (timestamp, service, level, trace_id).

**ENF13 - Scalabilité** : L'architecture doit permettre l'ajout de nouveaux services sans modification majeure de l'infrastructure existante.

**ENF14 - Coût** : La solution complète ne doit générer aucun coût cloud récurrent (utilisation de tiers gratuits uniquement : GitHub Free, Docker Hub Free, etc.).

**ENF15 - Récupération** : Le système doit permettre une restauration complète de l'infrastructure en moins de 30 minutes via backup + Terraform/Ansible.

---

### 3.3 Exigences de Compatibilité

**EC1 - Infrastructure Existante** : Les 3 containers LXC existants (proxy, utilities, monitoring) doivent rester opérationnels pendant la transition, avec migration progressive vers la nouvelle architecture de segmentation.

**EC2 - Services Existants** : Les 8 services actuellement déployés (Traefik, Vaultwarden, Snipe-IT, NetBox, Uptime Kuma, Zabbix, Prometheus, Grafana) doivent continuer à fonctionner avec leurs URLs existantes (*.oldevops.fr).

**EC3 - Réseau** : La nouvelle segmentation réseau doit être compatible avec la topologie Bbox actuelle (192.168.1.0/24) et ne pas nécessiter de matériel réseau supplémentaire.

**EC4 - Terraform State** : Le backend Terraform existant (OVH S3) doit être préservé avec continuité du state file.

**EC5 - Ansible Inventory** : Les playbooks Ansible existants doivent être compatibles avec la nouvelle structure, avec migration incrémentale.

**EC6 - DNS et SSL** : Les certificats Let's Encrypt existants via DNS-01 (OVH) doivent continuer à fonctionner sans interruption.

**EC7 - Authentification SSH** : Les clés SSH existantes (Ed25519) doivent rester valides pour l'accès aux containers.

**EC8 - Proxmox** : L'infrastructure doit rester compatible avec Proxmox VE sans nécessiter de mise à jour majeure de l'hyperviseur.

---

## 4. Contraintes Techniques et Intégration

### 4.1 Stack Technologique Existante

**Langages** :
- HCL (Terraform)
- YAML (Ansible, Docker Compose, GitHub Actions)
- Bash (scripts de déploiement)
- Jinja2 (templates Ansible)

**Frameworks & Outils** :
- Terraform v1.0+ avec provider Proxmox v2.9.14
- Ansible v2.10+ avec pipelining
- Docker CE + Docker Compose Plugin
- Traefik v3 (reverse proxy)
- Prometheus + Grafana (monitoring)

**Bases de données** :
- Actuelles : MySQL (Snipe-IT), PostgreSQL (NetBox), SQLite (Vaultwarden)
- Nouvelle : PostgreSQL pour l'application de démonstration

**Infrastructure** :
- Proxmox VE (hyperviseur)
- Containers LXC (Debian 12)
- Réseau : Bridge vmbr0 sur 192.168.1.0/24
- Stockage : local-lvm sur Proxmox

**Dépendances Externes** :
- OVH S3 (Terraform state)
- OVH DNS (Let's Encrypt DNS-01)
- GitHub (version control)
- Docker Hub (images publiques)

---

### 4.2 Stratégie d'Intégration

#### Stratégie d'Intégration Base de Données
**Approche** : Isolation par container
- Chaque application conserve sa base de données dédiée
- Nouvelle app frontend : PostgreSQL dans le même container (Docker Compose)
- Backup centralisé via Ansible pour toutes les bases

#### Stratégie d'Intégration API
**Approche** : Gateway unifié via Traefik
- Toutes les APIs exposées via Traefik avec routing par hostname
- Nouvelle app : `https://app.oldevops.fr` (frontend) + `https://api.oldevops.fr` (backend)
- Authentification : JWT pour l'API de demo, préservation des auth existantes

#### Stratégie d'Intégration Frontend
**Approche** : Container dédié + build moderne
- Nouveau container LXC (VMID 210) pour l'application
- Pipeline de build : Vite/Webpack → Image Docker → Deploy via Ansible
- Assets statiques servis par Nginx dans le container

#### Stratégie d'Intégration Testing
**Approche** : Multi-niveaux dans CI/CD
- **Infrastructure** : terraform validate, tfsec, ansible-lint
- **Application** : Jest (unit), Cypress (E2E), Lighthouse (performance)
- **Intégration** : Health checks post-déploiement
- **Sécurité** : Scans Trivy, checks OWASP

---

### 4.3 Organisation du Code et Standards

#### Approche Structure de Fichiers

```
infra-oldevops/
├── .github/
│   └── workflows/              # NOUVEAU : Pipelines CI/CD
│       ├── terraform-validate.yml
│       ├── ansible-lint.yml
│       ├── deploy-infra.yml
│       └── deploy-app.yml
├── terraform/
│   ├── modules/                # EXISTANT : Préservé
│   │   ├── lxc_container/
│   │   ├── network/            # NOUVEAU : Segmentation réseau
│   │   └── monitoring/         # NOUVEAU : Config monitoring
│   ├── environments/           # NOUVEAU : Support multi-env
│   │   └── production/
│   ├── main.tf                 # MODIFIÉ : Ajout nouveau container
│   ├── network.tf              # NOUVEAU : Segmentation
│   └── app-demo.tf             # NOUVEAU : Container application
├── ansible/
│   ├── roles/                  # EXISTANT : Préservé + nouveaux
│   │   ├── [rôles existants...]
│   │   ├── app-demo/           # NOUVEAU : Application démo
│   │   ├── loki/               # NOUVEAU : Agrégation logs
│   │   ├── backup/             # NOUVEAU : Automation backup
│   │   └── network-segmentation/  # NOUVEAU : Config VLAN
│   ├── playbooks/
│   │   ├── [existants...]
│   │   ├── app-demo.yml        # NOUVEAU
│   │   └── monitoring-advanced.yml  # NOUVEAU
│   └── group_vars/             # NOUVEAU : Variables par groupe
├── app-demo/                   # NOUVEAU : Code application
│   ├── frontend/               # React + TypeScript + Vite
│   ├── backend/                # Node.js/Express ou Python/FastAPI
│   ├── docker-compose.yml
│   └── .github/workflows/      # Pipeline app spécifique
├── docs/                       # NOUVEAU : Documentation formelle
│   ├── architecture/
│   ├── runbooks/
│   ├── adrs/                   # Architecture Decision Records
│   └── diagrams/
├── scripts/
│   ├── deploy.sh               # EXISTANT : Amélioré avec checks
│   └── backup.sh               # NOUVEAU
└── tests/                      # NOUVEAU : Tests d'infrastructure
    └── terraform/
```

#### Conventions de Nommage

**Préservé de l'existant** :
- Containers LXC : `<service>` (proxy, utilities, monitoring, app-demo)
- VMID : Incréments de 10 (200, 210, 220, 240)
- IPs : Pattern 192.168.1.20X

**Nouveau** :
- Workflows GitHub Actions : `<action>-<composant>.yml`
- Rôles Ansible : `<nom-service>` en minuscules avec tirets
- Modules Terraform : `<type-ressource>_<objectif>`

#### Standards de Code

**Terraform** :
- Code formaté avec `terraform fmt`
- Variables documentées avec descriptions
- Outputs pour chaque ressource réutilisable
- Modules pour toute ressource répétée >1 fois

**Ansible** :
- Playbooks idempotents (vérification état avant action)
- Rôles avec structure standard (tasks, templates, vars, handlers)
- Variables sensibles dans Ansible Vault
- Tags sur toutes les tasks pour exécution sélective

**Documentation** :
- README par composant
- Commentaires inline pour logique complexe
- ADRs pour toute décision architecturale
- Diagrammes en Mermaid ou Draw.io

---

### 4.4 Déploiement et Opérations

#### Intégration du Processus de Build

**Infrastructure** :
- Plan Terraform généré automatiquement sur PR (GitHub Actions)
- Validation humaine requise avant apply
- Backup automatique du state pré-déploiement

**Application** :
- Build frontend : Vite → assets optimisés
- Build backend : Docker multi-stage build
- Push images : GitHub Container Registry (ghcr.io)
- Versioning : Git tags → Docker tags

#### Stratégie de Déploiement

**Infrastructure** :
- Blue/Green pour containers critiques (proxy)
- Rolling update pour services avec réplication potentielle
- Snapshots Proxmox pré-déploiement

**Application** :
- Zero-downtime : Nouveau container → health check → switch Traefik
- Rollback automatique si health check échoue

#### Monitoring et Logging

**Existant (préservé)** :
- Scraping Prometheus (métriques)
- Dashboards Grafana
- Uptime Kuma (disponibilité)
- Zabbix (monitoring système)

**Nouveau** :
- Loki pour logs centralisés (tous containers → Loki → Grafana)
- Structured logging (JSON) pour l'application
- Tracing distribué (optionnel : Tempo si architecture micro-services)
- Alerting via AlertManager → notification (Discord/Email)

#### Gestion de Configuration

**Secrets** :
- GitHub Secrets pour tokens CI/CD
- Ansible Vault pour configs sensibles (préservé)
- Rotation manuelle documentée dans runbook

**Configuration** :
- Variables Terraform : `variables.tf` + `terraform.tfvars` (git-ignored)
- Variables Ansible : `group_vars/` + `vault/`
- Config app : Variables d'environnement injectées par Ansible

---

### 4.5 Évaluation des Risques et Mitigation

#### Risques Techniques

**Risque 1 : Interruption de service lors de la migration réseau**
- **Probabilité** : Moyenne
- **Impact** : Élevé
- **Mitigation** :
  - Migration par phases (un container à la fois)
  - Tests en environnement isolé d'abord
  - Snapshots avant chaque migration
  - Plan de rollback documenté et testé

**Risque 2 : GitHub Actions ne peut pas accéder au réseau local**
- **Probabilité** : Élevée
- **Impact** : Bloquant pour CI/CD
- **Mitigation** :
  - Runner auto-hébergé sur le réseau local
  - Alternative : Cloudflare Tunnel ou Tailscale pour accès sécurisé
  - Plan B : CI/CD validation only, déploiement manuel

**Risque 3 : Conflits de dépendances lors de l'upgrade Ansible/Terraform**
- **Probabilité** : Faible
- **Impact** : Moyen
- **Mitigation** :
  - Versioning strict dans requirements
  - Tests de validation avant merge
  - Environnement de dev isolé

**Risque 4 : Saturation des ressources Proxmox avec nouveau container**
- **Probabilité** : Faible
- **Impact** : Moyen
- **Mitigation** :
  - Monitoring ressources avant déploiement
  - Container app avec ressources limitées (2 cores, 2 GB RAM)
  - Possibilité de réduire ressources des containers existants

#### Risques d'Intégration

**Risque 5 : Cassure de la configuration Traefik existante**
- **Probabilité** : Moyenne
- **Impact** : Élevé (tous les services down)
- **Mitigation** :
  - Validation de la config Traefik avant redémarrage
  - Tests de routage automatisés
  - Backup de la config avant modification

**Risque 6 : Perte de données lors de la migration database**
- **Probabilité** : Faible
- **Impact** : Critique
- **Mitigation** :
  - Backup complet avant toute modification
  - Tests de restoration systématiques
  - Snapshots Proxmox des containers concernés

#### Risques de Déploiement

**Risque 7 : Pipeline CI/CD défaillant bloquant les déploiements**
- **Probabilité** : Moyenne
- **Impact** : Moyen
- **Mitigation** :
  - Bypass manuel documenté
  - Pipeline par phases (validation → approbation → deploy)
  - Rollback automatique sur échec

**Risque 8 : Certificats SSL expirés lors de la migration**
- **Probabilité** : Faible
- **Impact** : Élevé
- **Mitigation** :
  - Préservation de la config Let's Encrypt/Traefik existante
  - Monitoring de l'expiration des certs
  - Renouvellement anticipé avant migration

---

## 5. Structure Epic et Stories

### 5.1 Approche Epic

**Décision de Structure Epic** : **Epic unique complet** - "Transformation Portfolio Infrastructure Professionnelle"

**Justification** :
- Toutes les améliorations sont interconnectées et contribuent à un objectif unifié (portfolio professionnel)
- Décomposition en stories séquentielles permet une livraison incrémentale
- Facilite le tracking de la progression globale du projet
- Cohérence narrative pour présentation aux recruteurs

---

## EPIC 1 : Transformation Portfolio Infrastructure Professionnelle

**Objectif de l'Epic** : Transformer l'infrastructure homelab existante en vitrine professionnelle démontrant une maîtrise complète des pratiques DevOps modernes, avec CI/CD automatisé, application de démonstration déployée, monitoring avancé et documentation exhaustive.

**Exigences d'Intégration** :
- Préserver les 8 services existants fonctionnels (Traefik, Vaultwarden, Snipe-IT, NetBox, Uptime Kuma, Zabbix, Prometheus, Grafana)
- Maintenir la compatibilité avec l'infrastructure Proxmox actuelle
- Assurer la continuité du DNS et des certificats SSL (*.oldevops.fr)
- Migration incrémentale pour minimiser les risques

---

### Story 1.1 : GitHub Actions - Pipeline de Validation Infrastructure

**En tant que** Ingénieur DevOps,
**Je veux** un pipeline GitHub Actions automatique validant mes changements Terraform et Ansible,
**Afin de** garantir la qualité du code infrastructure avant tout merge et démontrer des pratiques CI/CD professionnelles.

#### Critères d'Acceptation

1. **CA1.1** : Un workflow `.github/workflows/terraform-validate.yml` exécute `terraform fmt -check`, `terraform validate` et génère un plan sur chaque Pull Request
2. **CA1.2** : Un workflow `.github/workflows/ansible-lint.yml` exécute `ansible-lint` et `ansible-playbook --syntax-check` sur tous les playbooks lors des PRs
3. **CA1.3** : Un workflow de sécurité `.github/workflows/security-scan.yml` exécute `tfsec` sur Terraform et `git-secrets` pour détecter les secrets committés
4. **CA1.4** : Les status checks des workflows sont requis avant merge (protection de branche sur `main`)
5. **CA1.5** : Les résultats de validation sont commentés automatiquement sur les PRs
6. **CA1.6** : Un badge de build status est affiché dans le README.md principal

#### Vérification d'Intégration

**VI1** : L'infrastructure existante n'est pas modifiée par cette story (uniquement ajout de workflows)
**VI2** : Le script `deploy.sh` existant continue de fonctionner indépendamment des workflows
**VI3** : Les workflows sont testés sur une branche de feature sans impacter `main`

---

### Story 1.2 : GitHub Actions - Runner Auto-Hébergé

**En tant que** Ingénieur DevOps,
**Je veux** un runner GitHub Actions auto-hébergé sur mon réseau local,
**Afin que** mes workflows CI/CD puissent déployer sur l'infrastructure Proxmox privée.

#### Critères d'Acceptation

1. **CA2.1** : Un runner GitHub Actions est installé sur le host Proxmox ou un container LXC dédié
2. **CA2.2** : Le runner est enregistré dans le repository avec le label `self-hosted-proxmox`
3. **CA2.3** : Le runner démarre automatiquement au boot du système (service systemd)
4. **CA2.4** : Le runner a accès SSH aux containers via la clé Ed25519 existante
5. **CA2.5** : Le runner peut exécuter Terraform et Ansible (dépendances installées)
6. **CA2.6** : Un workflow de test valide la connectivité du runner (ping containers + terraform version)

#### Vérification d'Intégration

**VI1** : Le runner n'interfère pas avec les déploiements manuels existants
**VI2** : Les credentials SSH existants restent fonctionnels
**VI3** : Le runner n'utilise pas plus de 10% des ressources CPU/RAM du host

---

### Story 1.3 : GitHub Actions - Pipeline de Déploiement Automatisé

**En tant que** Ingénieur DevOps,
**Je veux** un déploiement automatique de l'infrastructure via GitHub Actions sur merge,
**Afin de** démontrer un workflow GitOps complet avec validation humaine.

#### Critères d'Acceptation

1. **CA3.1** : Un workflow `.github/workflows/deploy-infra.yml` se déclenche sur push vers `main`
2. **CA3.2** : Le workflow requiert une approbation manuelle (environment "production" avec reviewers) avant exécution
3. **CA3.3** : Le workflow crée un snapshot Proxmox des containers avant déploiement
4. **CA3.4** : Le workflow exécute `terraform apply -auto-approve` puis les playbooks Ansible dans l'ordre correct
5. **CA3.5** : Le workflow exécute des health checks post-déploiement (curl sur toutes les URLs *.oldevops.fr)
6. **CA3.6** : Le workflow envoie une notification (GitHub comment) avec le statut du déploiement (succès/échec/durée)
7. **CA3.7** : En cas d'échec des health checks, un rollback automatique est déclenché (restoration des snapshots)

#### Vérification d'Intégration

**VI1** : Les 8 services existants restent accessibles après déploiement automatisé
**VI2** : Les certificats SSL sont renouvelés correctement si nécessaire
**VI3** : Le Terraform state sur OVH S3 est correctement mis à jour et verrouillé pendant l'exécution

---

### Story 1.4 : Container Application - Infrastructure Terraform

**En tant que** Ingénieur Plateforme,
**Je veux** un nouveau container LXC dédié pour l'application de démonstration,
**Afin de** avoir une isolation propre pour déployer une stack applicative moderne.

#### Critères d'Acceptation

1. **CA4.1** : Un nouveau fichier `terraform/app-demo.tf` définit un container LXC VMID 210
2. **CA4.2** : Le container a l'hostname `app-demo`, IP `192.168.1.210/24`, gateway `192.168.1.254`
3. **CA4.3** : Le container est configuré avec 2 cores, 2048 MB RAM, 512 MB swap, 20 GB disk
4. **CA4.4** : Le container utilise le template Debian 12 standard sur storage `local-lvm`
5. **CA4.5** : Le container est en mode unprivileged avec feature nesting=true (pour Docker)
6. **CA4.6** : Un output Terraform expose l'IP du container
7. **CA4.7** : Le container démarre automatiquement avec Proxmox (onboot = true)

#### Vérification d'Intégration

**VI1** : Les 3 containers existants ne sont pas modifiés et restent opérationnels
**VI2** : Le nouveau container n'impacte pas les ressources des containers existants (vérification via monitoring)
**VI3** : Le réseau bridge vmbr0 gère correctement le nouveau container

---

### Story 1.5 : Container Application - Configuration Ansible

**En tant que** Ingénieur DevOps,
**Je veux** provisionner automatiquement le container application avec Docker et dépendances,
**Afin de** préparer l'environnement pour déployer l'application de démonstration.

#### Critères d'Acceptation

1. **CA5.1** : Un nouveau rôle Ansible `roles/app-demo/` est créé avec la structure standard (tasks, templates, vars, handlers)
2. **CA5.2** : Le rôle installe Docker CE et Docker Compose Plugin (réutilisation du rôle `common` si possible)
3. **CA5.3** : Le rôle configure les variables d'environnement pour l'application (DB credentials, API keys) via Ansible Vault
4. **CA5.4** : Le rôle déploie un fichier `docker-compose.yml` pour l'application (frontend + backend + PostgreSQL)
5. **CA5.5** : Un nouveau playbook `playbooks/app-demo.yml` applique le rôle sur le container 192.168.1.210
6. **CA5.6** : Le playbook est intégré dans `deploy.sh` après le déploiement de Traefik

#### Vérification d'Intégration

**VI1** : Les playbooks existants (traefik, utilities, monitoring) continuent de fonctionner sans modification
**VI2** : Le container app-demo est accessible via SSH avec les clés existantes
**VI3** : Docker fonctionne correctement dans le container (test avec `docker run hello-world`)

---

### Story 1.6 : Application de Démonstration - Développement Frontend/Backend

**En tant que** Développeur Fullstack,
**Je veux** une application web moderne (React + API) démontrant une architecture professionnelle,
**Afin de** prouver ma capacité à déployer des applications réelles sur mon infrastructure.

#### Critères d'Acceptation

1. **CA6.1** : Un repository `app-demo/` contient le code source avec structure :
   - `frontend/` : React + TypeScript + Vite
   - `backend/` : Node.js Express + TypeScript OU Python FastAPI
   - `docker-compose.yml` : Orchestration des 3 services (frontend, backend, postgres)

2. **CA6.2** : L'application frontend implémente une fonctionnalité de démonstration (ex: Todo List, Blog, Portfolio interactif)

3. **CA6.3** : L'API backend expose des endpoints RESTful avec :
   - CRUD complet sur au moins une ressource
   - Authentification JWT
   - Validation des données
   - Gestion d'erreurs standardisée

4. **CA6.4** : La base PostgreSQL est initialisée avec un schema migré (Prisma, TypeORM ou Alembic)

5. **CA6.5** : L'application inclut des tests :
   - Frontend : Jest (unit tests) + React Testing Library
   - Backend : Tests d'intégration des endpoints
   - Au moins 60% de coverage

6. **CA6.6** : Le `docker-compose.yml` configure correctement :
   - Build multi-stage pour optimisation
   - Health checks pour chaque service
   - Volumes persistants pour PostgreSQL
   - Réseau isolé pour les 3 services

7. **CA6.7** : Un README dans `app-demo/` documente l'architecture, l'installation et le développement local

#### Vérification d'Intégration

**VI1** : L'application peut être développée et testée localement sans dépendances sur l'infrastructure Proxmox
**VI2** : Les ports utilisés (3000, 5000, 5432) ne sont pas exposés publiquement (uniquement via Traefik)
**VI3** : L'application démarre correctement via `docker-compose up` avec health checks verts

---

### Story 1.7 : Application de Démonstration - Intégration Traefik

**En tant que** Ingénieur Plateforme,
**Je veux** exposer l'application via Traefik avec SSL automatique,
**Afin qu'**elle soit accessible publiquement de manière sécurisée comme les autres services.

#### Critères d'Acceptation

1. **CA7.1** : Le rôle Ansible `app-demo` configure des labels Docker Compose pour Traefik :
   - Frontend : `https://app.oldevops.fr`
   - Backend API : `https://api.oldevops.fr`

2. **CA7.2** : Traefik génère automatiquement des certificats Let's Encrypt via DNS-01 (OVH) pour les 2 domaines

3. **CA7.3** : Le routage Traefik dirige :
   - `app.oldevops.fr/*` → frontend (port 3000)
   - `api.oldevops.fr/*` → backend (port 5000)

4. **CA7.4** : Les middlewares Traefik appliquent :
   - Redirection HTTP → HTTPS
   - Headers de sécurité (HSTS, X-Frame-Options, etc.)
   - Rate limiting sur l'API (optionnel)

5. **CA7.5** : La configuration DNS OVH est mise à jour avec les 2 nouveaux A records pointant vers 192.168.1.200 (proxy)

6. **CA7.6** : Les health checks Traefik valident que l'application répond avant de router le trafic

#### Vérification d'Intégration

**VI1** : Les 8 services existants restent accessibles via leurs URLs
**VI2** : Traefik continue de gérer les certificats existants sans interruption
**VI3** : Le dashboard Traefik (si exposé) affiche les 2 nouveaux services correctement

---

### Story 1.8 : Application de Démonstration - Pipeline CI/CD

**En tant que** Ingénieur DevOps,
**Je veux** un pipeline complet build/test/deploy pour l'application,
**Afin de** démontrer un workflow de déploiement moderne et automatisé.

#### Critères d'Acceptation

1. **CA8.1** : Un workflow `.github/workflows/app-build.yml` dans `app-demo/` exécute :
   - Lint (ESLint frontend, pylint/ruff backend)
   - Tests unitaires frontend et backend
   - Build de production
   - Sur chaque Push/PR

2. **CA8.2** : Un workflow `.github/workflows/app-docker.yml` :
   - Build les images Docker (frontend et backend)
   - Tag avec version Git (SHA + tag si existe)
   - Push vers GitHub Container Registry (ghcr.io)
   - Scan de sécurité avec Trivy
   - Déclenché sur merge vers `main`

3. **CA8.3** : Un workflow `.github/workflows/app-deploy.yml` :
   - Pull les nouvelles images depuis ghcr.io
   - Redémarre les containers via Ansible
   - Exécute health checks (curl + vérification status 200)
   - Rollback automatique en cas d'échec
   - Nécessite approbation manuelle (environment "production")

4. **CA8.4** : Les workflows utilisent des secrets GitHub pour :
   - Credentials ghcr.io
   - SSH key pour déploiement
   - Variables d'environnement de l'application

5. **CA8.5** : Des badges de status (Build, Tests, Security) sont ajoutés au README de l'app

#### Vérification d'Intégration

**VI1** : Le pipeline n'interfère pas avec le pipeline d'infrastructure (workflows séparés)
**VI2** : Le déploiement de l'application n'impacte pas les autres services
**VI3** : Un rollback ramène l'application à la version précédente en moins de 2 minutes

---

### Story 1.9 : Monitoring Avancé - Loki pour Agrégation de Logs

**En tant que** Ingénieur SRE,
**Je veux** centraliser tous les logs de l'infrastructure dans Loki,
**Afin de** pouvoir troubleshooter rapidement et démontrer une observabilité professionnelle.

#### Critères d'Acceptation

1. **CA9.1** : Un nouveau rôle Ansible `roles/loki/` déploie Loki via Docker Compose sur le container monitoring (192.168.1.202)

2. **CA9.2** : Loki est configuré pour :
   - Rétention 7 jours
   - Storage local avec rotation
   - API accessible depuis Grafana

3. **CA9.3** : Promtail (agent Loki) est déployé sur tous les 4 containers (proxy, utilities, monitoring, app-demo) via un rôle `roles/promtail/`

4. **CA9.4** : Promtail collecte les logs :
   - Journal systemd
   - Logs Docker de tous les containers
   - Logs applicatifs custom (si structurés)

5. **CA9.5** : Les logs sont enrichis avec labels :
   - `host` : Nom du container
   - `service` : Nom du service Docker
   - `level` : Log level (extrait si possible)

6. **CA9.6** : Loki est intégré comme datasource dans Grafana

#### Vérification d'Intégration

**VI1** : Prometheus et Grafana existants continuent de fonctionner normalement
**VI2** : Loki n'utilise pas plus de 1 GB de RAM et 10 GB de disque
**VI3** : Les logs sont interrogeables dans Grafana via Explore (test avec requête simple)

---

### Story 1.10 : Monitoring Avancé - Dashboards Grafana Versionnés

**En tant que** Ingénieur SRE,
**Je veux** des dashboards Grafana préconfigurés et versionnés dans Git,
**Afin de** démontrer une stack d'observabilité professionnelle et reproductible.

#### Critères d'Acceptation

1. **CA10.1** : Les dashboards Grafana sont exportés en JSON et stockés dans `ansible/roles/grafana/files/dashboards/`

2. **CA10.2** : Un dashboard **Vue d'ensemble Infrastructure** affiche :
   - CPU/RAM/Disk de tous les containers (données Prometheus)
   - Uptime et status des services
   - Trafic réseau entrant/sortant
   - Alertes actives

3. **CA10.3** : Un dashboard **Monitoring Application** affiche :
   - Temps de réponse API (p50, p95, p99)
   - Taux d'erreur HTTP
   - Throughput (requests/sec)
   - Métriques métier (ex: nombre de tâches créées)

4. **CA10.4** : Un dashboard **Logs Explorer** intègre Loki :
   - Vue par service
   - Filtres par level (error, warn, info)
   - Corrélation logs ↔ métriques

5. **CA10.5** : Le rôle Ansible `grafana` provisionne automatiquement les dashboards au déploiement (via API ou file provisioning)

6. **CA10.6** : Les dashboards utilisent des variables pour sélection dynamique (host, service)

#### Vérification d'Intégration

**VI1** : Les dashboards Grafana existants ne sont pas écrasés (vérifier avant provisioning)
**VI2** : Les datasources Prometheus et Loki sont correctement référencées
**VI3** : Les dashboards se chargent en moins de 3 secondes avec 7 jours de données

---

### Story 1.11 : Backup et Disaster Recovery Automation

**En tant que** Ingénieur DevOps,
**Je veux** un système de backup automatisé et testé,
**Afin de** pouvoir restaurer l'infrastructure complète en cas de désastre.

#### Critères d'Acceptation

1. **CA11.1** : Un rôle Ansible `roles/backup/` déploie un script de backup sur le host Proxmox

2. **CA11.2** : Le script de backup exécute quotidiennement (cron) :
   - Snapshots Proxmox des 4 containers
   - Export Terraform state depuis OVH S3
   - Dump des bases PostgreSQL/MySQL
   - Backup des configurations Ansible Vault

3. **CA11.3** : Les backups sont stockés :
   - Local : `/var/backups/infra-oldevops/` (rétention 7 jours)
   - Offsite : Synchronisation vers bucket OVH S3 dédié (rétention 30 jours)

4. **CA11.4** : Un script `scripts/restore.sh` documente et automatise la procédure de restauration :
   - Restoration des containers depuis snapshots
   - Déploiement via Terraform/Ansible
   - Import des données

5. **CA11.5** : Un runbook `docs/runbooks/disaster-recovery.md` détaille :
   - Scénarios de panne (host Proxmox, corruption state, perte données)
   - Procédures de restauration étape par étape
   - RTO (Recovery Time Objective) : <30 minutes
   - RPO (Recovery Point Objective) : <24 heures

6. **CA11.6** : Un test de restauration est documenté (preuve que le backup fonctionne)

#### Vérification d'Intégration

**VI1** : Les snapshots Proxmox n'impactent pas les performances des containers (pause <5 secondes)
**VI2** : Le script de backup s'exécute en moins de 10 minutes
**VI3** : Un test de restoration partielle (1 container) réussit sans impacter les autres

---

### Story 1.12 : Sécurité - Scanning et Hardening Automatisé

**En tant que** Ingénieur Sécurité,
**Je veux** du scanning de sécurité automatisé et un durcissement de l'infrastructure,
**Afin de** démontrer des pratiques de sécurité professionnelles.

#### Critères d'Acceptation

1. **CA12.1** : Le workflow GitHub Actions de sécurité (créé en Story 1.1) est enrichi avec :
   - Scan Trivy des images Docker (échec si vulnérabilités critiques CVSS ≥9.0)
   - OWASP Dependency Check sur le code applicatif
   - Checkov pour scan Terraform (règles de sécurité cloud)

2. **CA12.2** : Un rôle Ansible `roles/hardening/` applique sur tous les containers :
   - Configuration UFW (firewall) avec règles strictes (whitelist)
   - Fail2ban pour protection SSH
   - Désactivation des services inutiles
   - Mises à jour de sécurité automatiques (unattended-upgrades)

3. **CA12.3** : Traefik est configuré avec :
   - TLS 1.3 minimum
   - Headers de sécurité (HSTS, CSP, X-Frame-Options)
   - Rate limiting global (1000 req/min par IP)

4. **CA12.4** : Un pre-commit hook Git (`.pre-commit-config.yaml`) empêche :
   - Commit de secrets (git-secrets, detect-secrets)
   - Commit de fichiers sensibles (*.tfvars, *.vault)
   - Code non formaté (terraform fmt, prettier)

5. **CA12.5** : Un document `docs/architecture/security.md` détaille :
   - Modèle de menaces
   - Mesures de sécurité implémentées
   - Procédure de gestion des vulnérabilités

#### Vérification d'Intégration

**VI1** : Les règles firewall n'empêchent pas l'accès aux services exposés via Traefik
**VI2** : Fail2ban ne bloque pas les connexions SSH légitimes
**VI3** : Les scans de sécurité ne trouvent aucune vulnérabilité critique non justifiée

---

### Story 1.13 : Documentation Professionnelle - Architecture et Runbooks

**En tant que** Technical Writer,
**Je veux** une documentation exhaustive et professionnelle,
**Afin que** les recruteurs puissent comprendre l'architecture et ma méthodologie.

#### Critères d'Acceptation

1. **CA13.1** : Un dossier `docs/architecture/` contient :
   - `overview.md` : Architecture globale avec diagrammes
   - `network.md` : Topologie réseau détaillée
   - `decisions/` : ADRs (Architecture Decision Records) pour chaque choix majeur
   - `tech-stack.md` : Liste exhaustive des technologies avec versions

2. **CA13.2** : Les diagrammes d'architecture incluent :
   - Schéma réseau (containers, IPs, bridges) - Draw.io ou Mermaid
   - Flow CI/CD (Git → GitHub Actions → Deployment) - Mermaid
   - Architecture applicative (frontend → backend → DB) - Mermaid
   - Stack d'observabilité (Prometheus, Loki, Grafana) - Diagram

3. **CA13.3** : Un dossier `docs/runbooks/` contient :
   - `deployment.md` : Procédure de déploiement complète
   - `rollback.md` : Procédure de rollback par composant
   - `troubleshooting.md` : FAQ et résolution de problèmes communs
   - `disaster-recovery.md` : DR complet (déjà créé en Story 1.11)

4. **CA13.4** : Un dossier `docs/guides/` contient :
   - `getting-started.md` : Onboarding pour nouveaux contributeurs
   - `local-development.md` : Setup environnement de dev
   - `contributing.md` : Standards de contribution

5. **CA13.5** : Chaque document suit un template standardisé avec :
   - Table des matières
   - Version et dernière mise à jour
   - Prérequis
   - Exemples concrets

#### Vérification d'Intégration

**VI1** : La documentation existante (README, MAINTENANCE) est mise à jour pour référencer la nouvelle documentation
**VI2** : Tous les liens internes entre documents fonctionnent
**VI3** : Les diagrammes sont rendus correctement sur GitHub

---

### Story 1.14 : README et Portfolio - Transformation en Vitrine Professionnelle

**En tant que** Chercheur d'Emploi DevOps,
**Je veux** un README et portfolio impressionnants,
**Afin que** les recruteurs comprennent immédiatement mes compétences.

#### Critères d'Acceptation

1. **CA14.1** : Le README.md principal est restructuré avec :
   - Banner/logo professionnel
   - Badges (build status, security scan, coverage, license)
   - Section "Vue d'ensemble du Projet" orientée recruteur
   - Section "Architecture" avec diagramme principal
   - Section "Technologies" avec icônes/badges
   - Section "Services Déployés" avec captures d'écran
   - Section "Pipeline CI/CD" avec flow diagram
   - Section "Compétences Démontrées" (liste pour recruteurs)

2. **CA14.2** : L'application frontend (`https://app.oldevops.fr`) inclut une page "Portfolio" avec :
   - Présentation du projet
   - Architecture interactive (diagramme cliquable)
   - Métriques en temps réel (uptime, performance)
   - Liens vers le code GitHub
   - Section "Technologies utilisées"

3. **CA14.3** : Des captures d'écran professionnelles sont ajoutées dans `docs/screenshots/` :
   - Dashboards Grafana
   - Pipeline GitHub Actions
   - Application en action
   - Dashboard Traefik

4. **CA14.4** : Un fichier `SHOWCASE.md` à la racine liste :
   - Compétences techniques démontrées
   - Décisions architecturales justifiées
   - Résultats mesurables (temps de déploiement, uptime, etc.)
   - Points d'amélioration continue

5. **CA14.5** : Un fichier `docs/VIDEO.md` contient :
   - Script pour une vidéo de démonstration (3-5 minutes)
   - Points clés à couvrir
   - Lien vers la vidéo une fois enregistrée (YouTube/Loom)

#### Vérification d'Intégration

**VI1** : Le README reste concis (<5 minutes de lecture) avec liens vers docs détaillées
**VI2** : Tous les badges sont fonctionnels et à jour
**VI3** : Les captures d'écran sont récentes et reflètent l'état actuel

---

## Prochaines Étapes

Ce PRD est maintenant prêt pour :

1. **Revue et Approbation** par les parties prenantes
2. **Planification Architecture** - Créer un document d'architecture technique détaillant l'approche d'implémentation
3. **Raffinement des Stories** - Décomposer les stories en tâches techniques
4. **Planification Sprint** - Prioriser et planifier les stories pour l'exécution

---

**Statut du Document** : ✅ Prêt pour Revue
**Action Suivante** : Phase de Conception Architecture
**Timeline Estimée** : 14 stories, environ 6-8 semaines pour implémentation complète
