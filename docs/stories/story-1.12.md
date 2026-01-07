# Story 1.12 : Sécurité - Scanning et Hardening Automatisé

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P2 (Moyenne)
**Points d'effort** : 8
**Dépendances** : Story 1.1 (Pipeline de validation)

---

## User Story

**En tant que** Ingénieur Sécurité,
**Je veux** du scanning de sécurité automatisé et un durcissement de l'infrastructure,
**Afin de** démontrer des pratiques de sécurité professionnelles.

## Critères d'Acceptation

### CA12.1 : Enrichissement Workflow Sécurité
- Workflow `.github/workflows/security-scan.yml` enrichi avec :
  - **Trivy** : Scan images Docker (échec si CVSS ≥9.0)
  - **OWASP Dependency Check** : Scan dépendances applicatives
  - **Checkov** : Scan Terraform (règles sécurité IaC)
- Scans exécutés sur chaque PR
- Résultats exportés en artifacts

### CA12.2 : Rôle Hardening Ansible
- Rôle `ansible/roles/hardening/` créé
- Appliqué sur tous les containers (200, 202, 204, 210)
- Configuration incluant :
  - **UFW** : Firewall avec règles strictes (whitelist)
  - **Fail2ban** : Protection SSH (ban après 3 tentatives)
  - Désactivation services inutiles
  - **Unattended-upgrades** : Mises à jour de sécurité automatiques
- Idempotent et non-disruptif

### CA12.3 : Configuration Traefik Sécurisée
- TLS 1.3 minimum configuré
- Headers de sécurité appliqués via middleware :
  - HSTS : `max-age=31536000; includeSubDomains`
  - X-Frame-Options : `DENY`
  - X-Content-Type-Options : `nosniff`
  - Content-Security-Policy (CSP)
- Rate limiting global : 1000 req/min par IP
- Configuration testée avec SSL Labs (grade A+)

### CA12.4 : Pre-Commit Hooks Git
- Fichier `.pre-commit-config.yaml` créé
- Hooks configurés :
  - **git-secrets** ou **detect-secrets** : Détection de secrets
  - **terraform fmt** : Formatage automatique
  - **prettier** : Formatage code applicatif
  - Blocage des fichiers sensibles (`*.tfvars`, `*.vault`)
- Installation : `pre-commit install`
- Documentation dans CONTRIBUTING.md

### CA12.5 : Documentation Sécurité
- Document `docs/architecture/security.md` créé
- Contenu :
  - Modèle de menaces (threat model)
  - Mesures de sécurité implémentées
  - Procédure de gestion des vulnérabilités
  - Checklist de sécurité pour nouvelles features
  - Contacts sécurité

## Vérifications d'Intégration

### VI1 : Règles Firewall Non-Disruptives
- UFW ne bloque pas l'accès aux services exposés via Traefik
- SSH reste accessible sur port 22
- Monitoring continue de fonctionner

### VI2 : Fail2ban Sans Faux Positifs
- Fail2ban ne bloque pas les connexions SSH légitimes
- Whitelist configurée pour IPs de confiance
- Logs disponibles : `/var/log/fail2ban.log`

### VI3 : Scans Sans Vulnérabilités Critiques
- Aucune vulnérabilité critique (CVSS ≥9.0) non justifiée
- Vulnerabilités documentées avec plan de mitigation
- Rapport de scan propre pour validation

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] Workflow de sécurité enrichi et fonctionnel
- [ ] Hardening appliqué sur tous les containers
- [ ] Traefik sécurisé (grade A+ SSL Labs)
- [ ] Pre-commit hooks installés et testés
- [ ] Documentation sécurité créée

---

**Créé le** : 2026-01-07
