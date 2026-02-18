# EPIC 1 : Transformation Portfolio Infrastructure Professionnelle

**Statut** : 🟡 En cours
**Version** : 1.0
**Date de création** : 2026-01-07

---

## Objectif de l'Epic

Transformer l'infrastructure homelab existante en vitrine professionnelle démontrant une maîtrise complète des pratiques DevOps modernes, avec CI/CD automatisé, application de démonstration déployée, monitoring avancé et documentation exhaustive.

## Contexte Business

Ce projet d'infrastructure existe actuellement comme laboratoire de test personnel avec une base solide (Terraform, Ansible, 8 services déployés). L'objectif est de le transformer en **vitrine professionnelle** pour :

1. **Pratiques DevOps Modernes** : CI/CD automatisé, GitOps, infrastructure immutable
2. **Compétences Fullstack** : De l'infrastructure au déploiement d'applications réelles
3. **Excellence Opérationnelle** : Monitoring, observabilité, disaster recovery
4. **Standards Professionnels** : Documentation, sécurité, bonnes pratiques

**Public cible** : Recruteurs DevOps/SRE/Platform Engineer cherchant à valider des compétences concrètes au-delà d'un CV traditionnel.

## Périmètre

### Inclus ✅
- Pipeline CI/CD complet avec GitHub Actions
- Application frontend moderne déployée sur l'infrastructure
- Monitoring et observabilité avancés (Loki, dashboards Grafana)
- Documentation professionnelle exhaustive
- Système de backup et disaster recovery
- Scanning de sécurité automatisé
- Transformation du README en vitrine professionnelle

### Exclus ❌
- Modification majeure de l'architecture Proxmox existante
- Migration des 8 services existants (ils restent tels quels)
- Implémentation de multi-cloud
- Orchestration Kubernetes (hors scope pour homelab)

## Exigences d'Intégration

**Contraintes critiques** :
- ✅ Préserver les 8 services existants fonctionnels (Traefik, Vaultwarden, Snipe-IT, NetBox, Uptime Kuma, Zabbix, Prometheus, Grafana)
- ✅ Maintenir la compatibilité avec l'infrastructure Proxmox actuelle
- ✅ Assurer la continuité du DNS et des certificats SSL (*.oldevops.fr)
- ✅ Migration incrémentale pour minimiser les risques

## Stories

| # | Story | Statut | Priorité | Dépendances |
|---|-------|--------|----------|-------------|
| 1.1 | [GitHub Actions - Pipeline de Validation Infrastructure](story-1.1.md) | ✅ Done | P0 | - |
| 1.2 | [GitHub Actions - Runner Auto-Hébergé](story-1.2.md) | ✅ Done | P0 | - |
| 1.3 | [GitHub Actions - Pipeline de Déploiement Automatisé](story-1.3.md) | ✅ Done | P0 | 1.1, 1.2 |
| 1.4 | [Container Application - Infrastructure Terraform](story-1.4.md) | 🔍 Ready for Review | P1 | - |
| 1.5 | [Container Application - Configuration Ansible](story-1.5.md) | 🔍 Ready for Review | P1 | 1.4 |
| 1.6 | [Application de Démonstration - Développement Frontend/Backend](story-1.6.md) | 🔄 In Progress | P1 | 1.5 |
| 1.7 | [Application de Démonstration - Intégration Traefik](story-1.7.md) | 🔄 In Progress | P1 | 1.6 |
| 1.8 | [Application de Démonstration - Pipeline CI/CD](story-1.8.md) | 🔄 In Progress | P1 | 1.7, 1.3 |
| 1.9 | [Monitoring Avancé - Loki pour Agrégation de Logs](story-1.9.md) | 🔍 Ready for Review | P2 | - |
| 1.10 | [Monitoring Avancé - Dashboards Grafana Versionnés](story-1.10.md) | 📝 Todo | P2 | 1.9 |
| 1.11 | [Backup et Disaster Recovery Automation](story-1.11.md) | 📝 Todo | P2 | - |
| 1.12 | [Sécurité - Scanning et Hardening Automatisé](story-1.12.md) | 📝 Todo | P2 | 1.1 |
| 1.13 | [Documentation Professionnelle - Architecture et Runbooks](story-1.13.md) | 📝 Todo | P3 | Toutes |
| 1.14 | [README et Portfolio - Transformation en Vitrine Professionnelle](story-1.14.md) | 📝 Todo | P3 | Toutes |

**Légende des priorités** :
- **P0** : Bloquant - requis pour la suite
- **P1** : Haute - fonctionnalités core
- **P2** : Moyenne - améliorations importantes
- **P3** : Basse - polish final

## Métriques de Succès

### Métriques Techniques
- ✅ Pipeline CI/CD complet fonctionnel (<10 min d'exécution)
- ✅ Application déployée accessible via HTTPS avec SSL valide
- ✅ Monitoring avec dashboards préconfigurés et logs centralisés
- ✅ Tests de restoration backup réussis (<30 min RTO)
- ✅ Aucune vulnérabilité critique (CVSS ≥9.0) non justifiée

### Métriques Business
- ✅ README transformé avec badges et diagrammes professionnels
- ✅ Documentation complète (architecture + runbooks + ADRs)
- ✅ Portfolio interactif démontrant les compétences
- ✅ 100% des critères d'acceptation validés

## Risques et Mitigations

### Risques Majeurs

**Risque 1 : Interruption de service lors de la migration réseau**
- **Impact** : Élevé
- **Mitigation** : Migration par phases, snapshots Proxmox, plan de rollback

**Risque 2 : GitHub Actions ne peut pas accéder au réseau local**
- **Impact** : Bloquant pour CI/CD
- **Mitigation** : Runner auto-hébergé (Story 1.2), alternative Cloudflare Tunnel

**Risque 3 : Cassure de la configuration Traefik existante**
- **Impact** : Élevé (tous les services down)
- **Mitigation** : Validation config, tests de routage, backup avant modification

## Timeline Estimée

- **Durée totale** : 6-8 semaines
- **Phase 1 - CI/CD** (Stories 1.1-1.3) : 1-2 semaines
- **Phase 2 - Application** (Stories 1.4-1.8) : 2-3 semaines
- **Phase 3 - Monitoring** (Stories 1.9-1.10) : 1 semaine
- **Phase 4 - Opérations** (Stories 1.11-1.12) : 1 semaine
- **Phase 5 - Documentation** (Stories 1.13-1.14) : 1 semaine

## Dépendances Externes

- GitHub (version control + CI/CD)
- OVH (DNS, S3 pour Terraform state)
- Docker Hub / GitHub Container Registry (images)
- Let's Encrypt (certificats SSL)

## Références

- [PRD complet](../prd.md)
- [README actuel](../../README.md)
- [Documentation maintenance](../../MAINTENANCE.md)
- [Roadmap détaillée](ROADMAP.md)

---

**Dernière mise à jour** : 2026-02-18
**Prochaine revue** : Fin de chaque phase

## Progression

| Phase | Stories | Statut |
|-------|---------|--------|
| Phase 1 — CI/CD | 1.1, 1.2, 1.3 | ✅ Complète (3/3) |
| Phase 2 — Application | 1.4, 1.5, 1.6, 1.7, 1.8 | 🔄 En cours (2/5 Ready for Review) |
| Phase 3 — Monitoring | 1.9, 1.10 | 🔄 En cours (1/2 Ready for Review) |
| Phase 4 — Opérations | 1.11, 1.12 | 📝 À faire |
| Phase 5 — Documentation | 1.13, 1.14 | 📝 À faire |

**Avancement global** : 3 Done · 3 Ready for Review · 3 In Progress · 5 Todo
