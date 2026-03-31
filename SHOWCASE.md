# SHOWCASE — Infra-OlDevOps

Démonstration des compétences techniques mises en œuvre dans ce projet.

---

## Compétences techniques démontrées

### Infrastructure as Code
- **Terraform** : provisioning de 6 containers LXC sur Proxmox VE via provider `bpg/proxmox`
- **Backend state distant** : bucket S3 OVH (`infra-oldevops-tfstate`) pour collaboration et reprise
- **Ansible** : configuration complète de tous les services (roles réutilisables, idempotents)
- **Ansible Vault** (AES-256) : gestion sécurisée de tous les secrets d'infrastructure
- **Containers unprivileged** : .200, .201, .250 convertis via Terraform (mitigation container escape)

### CI/CD (GitHub Actions)
- Pipeline de validation PR : `terraform fmt`, `validate`, `tfsec`, `ansible-lint`
- Pipeline de déploiement : build Docker → push `ghcr.io` → scan Trivy → SSH deploy → health check
- Runner **auto-hébergé** sur LXC dédié (192.168.1.210)
- Déploiement < 10 minutes de bout en bout

### Containerisation
- **Docker CE 25** sur Debian 12 dans chaque LXC
- `docker-compose` v2 pour orchestration multi-services
- LXC unprivilégié pour l'app de démo et les services proxy (.200, .201, .250)
- Features LXC : `nesting=true`, `mknod=true` pour Docker-in-LXC

### Monitoring & Observabilité
- **Prometheus** : collecte métriques (15j rétention), node-exporter + cadvisor sur tous les hosts
- **Grafana** : 7 dashboards versionnés en JSON/IaC (infra, app, logs, 3 dashboards sécurité)
- **Loki** : agrégation logs centralisée (7j rétention), collecte via Promtail sur 6 hosts
- **Uptime Kuma** : monitoring HTTP de tous les services publics

### Sécurité
- SSL wildcard Let's Encrypt via DNS-01 OVH (certificat automatique `*.oldevops.fr`)
- **UFW** : firewall whitelist `192.168.1.0/24` sur chaque container
- **Fail2ban** : protection brute-force SSH
- **Auditd** : audit trail kernel sur tous les LXC (escalades de privilèges, modifications fichiers sensibles, connexions SSH) — logs centralisés dans Loki
- **Dashboards sécurité** : 3 dashboards Grafana (auth, modifications système, synthèse) + 4 alertes (brute force, privesc, fichiers sensibles, auditd silencieux)
- **Notifications push** : ntfy.sh webhook (HTTPS) — réception push mobile en temps réel
- Pre-commit hooks : `detect-secrets` pour prévenir les fuites de credentials
- GitHub Secrets pour les variables CI/CD

### Git self-hosted
- **Forgejo** hébergé sur `.203` (`git.oldevops.fr`) — miroir pull du repo GitHub (sync horaire)
- Continuité d'accès au code source indépendante de GitHub

---

## Décisions architecturales justifiées

| Décision | Justification |
|----------|---------------|
| LXC vs VM | Isolation suffisante, overhead minimal, démarrage rapide — voir [ADR-001](docs/architecture/decisions/ADR-001-lxc-containers.md) |
| Proxmox bare-metal | Contrôle total, coût zéro, hyperviseur de production éprouvé |
| OVH DNS-01 | Certificat wildcard impossible avec HTTP-01, DNS-01 permet `*.oldevops.fr` |
| S3 remote state | Partage du tfstate, lock distribué, pas de state local perdu |
| Runner self-hosted | Accès réseau LAN direct aux containers, pas d'exposition SSH publique |
| Containers unprivileged | Mitigation container escape (CRIT-001), isolation renforcée UID remapping |
| Auditd + Loki | Audit trail kernel centralisé sans agent supplémentaire — Promtail existant réutilisé |
| ntfy.sh vs SMTP | Port 587 bloqué par FAI résidentiel — webhook HTTPS universellement accessible |

---

## Résultats mesurables

| Métrique | Valeur |
|----------|--------|
| Uptime services | > 99.9% |
| Temps déploiement CI/CD | < 10 minutes |
| Couverture tests (app) | > 60% |
| Services en production | 12+ |
| Containers LXC actifs | 6 |
| Dashboards Grafana (IaC) | 7 |
| Alertes configurées | 4 sécurité + règles Prometheus |
| Chiffrement secrets | AES-256 (Ansible Vault) |
| Stories complétées | 19/19 |

---

*Projet réalisé par Olivier Labé — [github.com/HibOOps](https://github.com/HibOOps) — [oldevops.fr](https://demo.oldevops.fr)*
