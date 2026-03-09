# Story 1.14 : README et Portfolio - Transformation en Vitrine Professionnelle

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Ready for Review
**Priorité** : P3 (Basse - Polish)
**Points d'effort** : 5
**Dépendances** : Toutes les stories précédentes

---

## User Story

**En tant que** Chercheur d'Emploi DevOps,
**Je veux** un README et portfolio impressionnants,
**Afin que** les recruteurs comprennent immédiatement mes compétences.

## Critères d'Acceptation

### CA14.1 : README Principal Restructuré
- README.md restructuré avec sections :
  - **Banner/Logo** professionnel en haut
  - **Badges** : Build status, security scan, coverage, license
  - **Vue d'ensemble** orientée recruteur (1-2 paragraphes)
  - **Architecture** avec diagramme principal
  - **Technologies** avec icônes/badges (shields.io)
  - **Services Déployés** avec captures d'écran
  - **Pipeline CI/CD** avec flow diagram
  - **Compétences Démontrées** (liste pour recruteurs)
  - **Quick Start** pour tester localement
  - **Documentation** avec liens vers docs détaillées

### CA14.2 : Application Portfolio
- Page "Portfolio" dans l'app frontend (`https://demo.oldevops.fr`)
- Contenu :
  - Présentation du projet (objectif, durée, résultats)
  - Architecture interactive (diagramme cliquable)
  - Métriques en temps réel (uptime, performance, nombre de services)
  - Liens vers le code GitHub
  - Section "Technologies utilisées" avec logos
  - Timeline du projet
- Design moderne et responsive

### CA14.3 : Captures d'Écran Professionnelles
- Dossier `docs/screenshots/` avec captures :
  - Dashboards Grafana (infrastructure + application)
  - Pipeline GitHub Actions (succès + échec)
  - Application en action (frontend)
  - Dashboard Traefik
  - Logs dans Grafana (Loki)
- Format PNG haute résolution
- Annotations si nécessaire

### CA14.4 : Fichier SHOWCASE.md
- Fichier `SHOWCASE.md` à la racine listant :
  - **Compétences techniques démontrées** :
    - Infrastructure as Code (Terraform, Ansible)
    - CI/CD (GitHub Actions, GitOps)
    - Containerisation (Docker, LXC)
    - Monitoring (Prometheus, Grafana, Loki)
    - Sécurité (Hardening, scanning, SSL)
  - **Décisions architecturales justifiées** (avec liens vers ADRs)
  - **Résultats mesurables** :
    - Temps de déploiement (<10 min)
    - Uptime (>99.5%)
    - Coverage tests (>60%)
  - **Points d'amélioration continue** (roadmap future)

### CA14.5 : Script Vidéo de Démonstration
#- Fichier `docs/VIDEO.md` contenant :
#  - Script pour vidéo de démonstration (3-5 minutes)
# - Points clés à couvrir :
    - Architecture overview
    - Démonstration CI/CD
    - Démonstration application
    - Dashboards monitoring
    - Walkthrough code
  - Lien vers la vidéo une fois enregistrée (YouTube/Loom)
  - Timestamps pour navigation rapide

## Vérifications d'Intégration

### VI1 : README Concis
- README reste concis (<5 minutes de lecture)
- Détails dans docs séparées
- Call-to-action clair pour recruteurs

### VI2 : Badges Fonctionnels
- Tous les badges GitHub Actions sont fonctionnels
- Badges se mettent à jour automatiquement
- Liens des badges pointent vers les bonnes pages

### VI3 : Captures Récentes
- Toutes les captures d'écran sont récentes
- Reflètent l'état actuel du projet
- Cohérentes visuellement (même résolution, même theme)

## Définition of Done

- [x] Tous les CA validés ✅ (CA14.1, CA14.2, CA14.4 — CA14.3 et CA14.5 hors scope)
- [x] README transformé et professionnel
- [x] Page portfolio créée dans l'app
- [ ] Captures d'écran ajoutées (CA14.3 — hors scope)
- [x] SHOWCASE.md créé
- [ ] Script vidéo préparé (CA14.5 — hors scope)
- [ ] Revue par un tiers (feedback sur impression)
- [ ] Tout est à jour et cohérent

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes
- CA14.1 (README) et CA14.4 (SHOWCASE.md) : déjà complétés avant cette session
- CA14.3 (screenshots) et CA14.5 (vidéo) : exclus par décision utilisateur
- CA14.2 : PortfolioPage.jsx existait déjà avec hero, services, stack, CI/CD, métriques. Ajouté :
  - **Architecture interactive** : diagramme CSS grid 4 colonnes avec nœuds cliquables (Traefik, Monitoring, Utilities, PriceSync, CI Runner, Proxmox)
  - **Timeline du projet** : 6 jalons de Jan à Mar 2026 avec indicateurs colorés
  - **Métriques en temps réel** : badge "API PriceSync — En ligne/Hors ligne" via `useEffect` + `fetch('/api/health')`
  - Nav étendue avec liens #architecture et #timeline

### File List
- `app-demo/frontend/src/pages/PortfolioPage.jsx` — Modifié (architecture, timeline, live API status)
- `app-demo/frontend/src/__tests__/PortfolioPage.test.jsx` — Modifié (11 tests couvrant toutes les nouvelles sections)

### Change Log
- `PortfolioPage.jsx` : ajout useState/useEffect, TIMELINE[], ARCH_NODES[], section Architecture, section Timeline, badge API live dans Metrics
- `PortfolioPage.test.jsx` : ajout beforeEach mock fetch, 5 nouveaux tests (architecture, timeline, api-status)

---

**Créé le** : 2026-01-07
