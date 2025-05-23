# Infra-oldevops

Infrastructure-as-Code pour le déploiement des services internes (Heimdall, Snipe-IT, Uptime Kuma, etc.) sur un serveur Proxmox derrière un routeur Free.

## 📦 Tech Stack

- Terraform (Proxmox LXC)
- Ansible (App config)
- OVH DNS + Let's Encrypt
- Reverse Proxy (Traefik / Nginx Proxy Manager)
- Git + Vault + .env pour la sécurité

## 🛠️ Déploiement

### 1. Terraform

```bash
cd terraform
terraform init
terraform apply
