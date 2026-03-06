# SHOWCASE — Infra-OlDevOps

Démonstration des compétences techniques mises en œuvre dans ce projet.

---

## Compétences techniques démontrées

### Infrastructure as Code
- **Terraform** : provisioning de 5 containers LXC sur Proxmox VE via provider `bpg/proxmox`
- **Backend state distant** : bucket S3 OVH (`infra-oldevops-tfstate`) pour collaboration et reprise
- **Ansible** : configuration complète de tous les services (roles réutilisables, idempotents)
- **Ansible Vault** (AES-256) : gestion sécurisée de tous les secrets d'infrastructure

### CI/CD (GitHub Actions)
- Pipeline de validation PR : `terraform fmt`, `validate`, `tfsec`, `ansible-lint`
- Pipeline de déploiement : build Docker → push `ghcr.io` → scan Trivy → SSH deploy → health check
- Runner **auto-hébergé** sur LXC dédié (192.168.1.210)
- Déploiement < 10 minutes de bout en bout

### Containerisation
- **Docker CE 25** sur Debian 12 dans chaque LXC
- `docker-compose` v2 pour orchestration multi-services
- LXC unprivilégié pour l'app de démo (sécurité renforcée)
- Features LXC : `nesting=true`, `mknod=true` pour Docker-in-LXC

### Monitoring & Observabilité
- **Prometheus** : collecte métriques (15j rétention), node-exporter + cadvisor sur tous les hosts
- **Grafana** : 4 dashboards versionnés (infra, app, service health, logs)
- **Loki** : agrégation logs centralisée (7j rétention), collecte via Promtail
- **Uptime Kuma** : monitoring HTTP de tous les services publics
- **Zabbix** : monitoring infrastructure avancé

### Sécurité
- SSL wildcard Let's Encrypt via DNS-01 OVH (certificat automatique `*.oldevops.fr`)
- **UFW** : firewall whitelist `192.168.1.0/24` sur chaque container
- **Fail2ban** : protection brute-force SSH
- Pre-commit hooks : `detect-secrets` pour prévenir les fuites de credentials
- GitHub Secrets pour les variables CI/CD

---

## Décisions architecturales justifiées

| Décision | Justification |
|----------|---------------|
| LXC vs VM | Isolation suffisante, overhead minimal, démarrage rapide — voir [ADR-001](docs/architecture/decisions/ADR-001-lxc-containers.md) |
| Proxmox bare-metal | Contrôle total, coût zéro, hyperviseur de production éprouvé |
| OVH DNS-01 | Certificat wildcard impossible avec HTTP-01, DNS-01 permet `*.oldevops.fr` |
| S3 remote state | Partage du tfstate, lock distributed, pas de state local perdu |
| Runner self-hosted | Accès réseau LAN direct aux containers, pas d'exposition SSH publique |

---

## Résultats mesurables

| Métrique | Valeur |
|----------|--------|
| Uptime services | > 99.9% |
| Temps déploiement CI/CD | < 10 minutes |
| Couverture tests (app) | > 60% |
| Services en production | 10+ |
| Containers LXC actifs | 5 |
| Chiffrement secrets | AES-256 (Ansible Vault) |

---

## Points d'amélioration continue (roadmap)

- [ ] Migration vers Kubernetes (k3s) pour l'orchestration des services applicatifs
- [ ] Intégration Renovate Bot pour les mises à jour automatiques des dépendances
- [ ] Backup automatisé avec Proxmox Backup Server + retention policy
- [ ] Alerting Slack/email via Alertmanager pour les incidents
- [ ] HashiCorp Vault pour la gestion des secrets applicatifs (remplacer Ansible Vault)
- [ ] Infrastructure multi-site avec réplication Loki/Prometheus

---

*Projet réalisé par Olivier Labé — [github.com/olabe](https://github.com/olabe) — [oldevops.fr](https://demo.oldevops.fr)*
