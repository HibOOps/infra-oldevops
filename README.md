# Infra-OlDevOps

![Build](https://github.com/HibOOps/Infra-oldevops/actions/workflows/app-docker.yml/badge.svg)
![Terraform](https://github.com/HibOOps/Infra-oldevops/actions/workflows/terraform-validate.yml/badge.svg)
![Tests](https://github.com/HibOOps/Infra-oldevops/actions/workflows/app-build.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

Infrastructure as Code complète déployée sur Proxmox VE bare-metal — Terraform, Ansible, CI/CD GitHub Actions, monitoring full-stack, sécurité avancée et application de démonstration en production.

> **Demo** : [demo.oldevops.fr](https://demo.oldevops.fr) | **Git** : [git.oldevops.fr](https://git.oldevops.fr) | **Status** : [status.oldevops.fr](https://status.oldevops.fr)

---

## Architecture

```
                        Internet
                           │
                    [Traefik v3]  ── SSL wildcard *.oldevops.fr
                    192.168.1.200 (unprivileged LXC)
               /       |        \       \
    [monitoring]  [utilities]  [app-demo] [forgejo]  [ci-runner]
       .202          .201         .250       .203        .210
  Prometheus     Vaultwarden   PriceSync   Forgejo    GitHub Runner
  Grafana        Snipe-IT      Node/React  git.oldevops.fr
  Loki           NetBox        PostgreSQL
  Uptime Kuma
```

6 containers LXC sur Proxmox VE 8 — Debian 12 — Docker CE 25

---

## Technologies

**Infrastructure**
![Proxmox](https://img.shields.io/badge/Proxmox-E57000?logo=proxmox&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?logo=terraform&logoColor=white)
![Ansible](https://img.shields.io/badge/Ansible-EE0000?logo=ansible&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

**CI/CD & Sécurité**
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)
![Trivy](https://img.shields.io/badge/Trivy-1904DA?logo=aqua&logoColor=white)
![Let's Encrypt](https://img.shields.io/badge/Let's_Encrypt-003A70?logo=letsencrypt&logoColor=white)

**Observabilité**
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?logo=grafana&logoColor=white)
![Loki](https://img.shields.io/badge/Loki-F7B731?logo=grafana&logoColor=white)

**Application**
![Node.js](https://img.shields.io/badge/Node.js_20-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?logo=postgresql&logoColor=white)

---

## Services déployés

| Service | URL | Description |
|---------|-----|-------------|
| Reverse Proxy | [proxy.oldevops.fr](https://proxy.oldevops.fr) | Traefik v3 + SSL wildcard DNS-01 |
| Portfolio / App | [demo.oldevops.fr](https://demo.oldevops.fr) | Homepage + PriceSync app (React + API) |
| Git self-hosted | [git.oldevops.fr](https://git.oldevops.fr) | Forgejo — miroir du repo infra |
| Grafana | [grafana.oldevops.fr](https://grafana.oldevops.fr) | Dashboards métriques + logs + sécurité |
| Uptime Kuma | [status.oldevops.fr](https://status.oldevops.fr) | Monitoring uptime public |
| Vaultwarden | [vault.oldevops.fr](https://vault.oldevops.fr) | Gestionnaire de mots de passe |
| Snipe-IT | [inventory.oldevops.fr](https://inventory.oldevops.fr) | Gestion de parc ITSM |
| NetBox | [netbox.oldevops.fr](https://netbox.oldevops.fr) | Documentation réseau DCIM |
| Prometheus | [prometheus.oldevops.fr](https://prometheus.oldevops.fr) | Métriques infrastructure |

---

## Pipeline CI/CD

```
Pull Request                    Push main
──────────────────────          ──────────────────────────────────────
terraform fmt/validate    →     Build Docker image
tfsec (IaC security)      →     Push → ghcr.io
ansible-lint              →     Trivy vulnerability scan
Jest + Vitest tests        →     SSH deploy → LXC app-demo
                           →     Health check
```

---

## Sécurité

- **Auditd** déployé sur tous les containers LXC — audit trail kernel (escalades de privilèges, modifications `/etc/passwd`, `/etc/sudoers`, connexions SSH)
- **Logs centralisés** dans Loki via Promtail (`{job="auditd"}`)
- **3 dashboards de sécurité** Grafana provisionnés en IaC (auth, modifications système, vue synthèse)
- **4 alertes** Grafana Unified Alerting : brute force SSH, privesc, modification fichiers sensibles, auditd silencieux
- **Notifications push** via ntfy.sh (webhook HTTPS, pas de dépendance SMTP)
- **Containers unprivileged** (.200, .201, .250) — isolation renforcée, mitigation container escape
- SSL wildcard Let's Encrypt via DNS-01 OVH — certificat automatique `*.oldevops.fr`
- UFW whitelist `192.168.1.0/24`, Fail2ban SSH, secrets AES-256 Ansible Vault

---

## Compétences démontrées

- **IaC** : provisioning déclaratif complet (Terraform + Ansible), idempotent et reproductible
- **CI/CD** : pipeline automatisé de la PR au déploiement en production
- **Sécurité** : audit trail kernel, dashboards détection d'incidents, containers unprivileged, secrets chiffrés
- **Observabilité** : métriques, logs centralisés, 7 dashboards Grafana versionnés en JSON, alerting
- **Docker** : images multi-stage, registry privé, orchestration compose
- **Développement** : application full-stack (React + Node.js + PostgreSQL) avec tests, API REST

---

## Quick Start

```bash
git clone https://github.com/HibOOps/Infra-oldevops.git
cd Infra-oldevops/infra-oldevops

# Infrastructure (Terraform)
cd terraform
cp terraform.tfvars.example terraform.tfvars  # remplir les variables
terraform init && terraform apply

# Configuration (Ansible)
cd ../ansible
cp vault/secrets.yml.example vault/secrets.yml
ansible-vault encrypt vault/secrets.yml
ansible-playbook -i inventory.ini playbooks/bootstrap-lxc.yml --vault-password-file=.vault_pass
ansible-playbook -i inventory.ini playbooks/site.yml --vault-password-file=.vault_pass
```

**Prérequis** : Proxmox VE 8, domaine OVH, Terraform ≥ 1.7, Ansible ≥ 2.10

---

## Documentation

- [Stack technique](docs/architecture/tech-stack.md)
- [Runbooks opérationnels](docs/runbooks/)
- [Plan de remédiation sécurité](docs/security/security-remediation-plan-2026-02-14.md)
- [Dashboards sécurité](docs/security/security-dashboards.md)
- [SHOWCASE — compétences démontrées](SHOWCASE.md)
- [Stories / historique](docs/stories/)

---

*Olivier Labé — [github.com/HibOOps](https://github.com/HibOOps) — [linkedin.com/in/olivier-labe](https://www.linkedin.com/in/olivier-labe/)*
