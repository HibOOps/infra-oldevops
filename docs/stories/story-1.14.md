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
- Page "Portfolio" dans l'app frontend (`https://app.oldevops.fr`)
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
- Fichier `docs/VIDEO.md` contenant :
  - Script pour vidéo de démonstration (3-5 minutes)
  - Points clés à couvrir :
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

- [ ] Tous les CA validés ✅
- [ ] README transformé et professionnel
- [ ] Page portfolio créée dans l'app
- [ ] Captures d'écran ajoutées
- [ ] SHOWCASE.md créé
- [ ] Script vidéo préparé
- [ ] Revue par un tiers (feedback sur impression)
- [ ] Tout est à jour et cohérent

---

**Créé le** : 2026-01-07
