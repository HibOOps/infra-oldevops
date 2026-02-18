# Infra-oldevops

Infrastructure-as-Code pour le déploiement des services internes sur un serveur Proxmox derrière un routeur Bouygues, utilisant le domaine `oldevops.fr`.

## 🌐 Architecture Globale

### Containers Proxmox

| VMID | Hostname | IP | vCPU | RAM | Disk | Rôle | Statut |
|------|----------|----|------|-----|------|------|--------|
| 200 | proxy | 192.168.1.200 | 2 | 1 GB | 8 GB | Traefik reverse proxy (SSL, routage) | ✅ Running |
| 201 | utilities | 192.168.1.201 | 6 | 8 GB | 40 GB | Vaultwarden, Snipe-IT, NetBox | ✅ Running |
| 210 | ci-runner | 192.168.1.210 | 4 | 4 GB | 30 GB | GitHub Actions Runner auto-hébergé | ✅ Running |
| 240 | monitoring | 192.168.1.202 | 4 | 6 GB | 50 GB | Prometheus, Grafana, Zabbix, Uptime Kuma | ✅ Running |
| 250 | app-demo | 192.168.1.250 | 2 | 2 GB | 20 GB | Application de démonstration (Node.js/React/PostgreSQL) | ✅ Running |

### Services Principaux

| Service | URL | IP | Description |
|---------|-----|----|-------------|
| Reverse Proxy | https://proxy.oldevops.fr | 192.168.1.200 | Traefik v3 pour le routage et SSL (DNS-01) |
| Uptime Kuma | https://status.oldevops.fr | 192.168.1.202 | Surveillance des services et temps de réponse |
| Snipe-IT | https://inventory.oldevops.fr | 192.168.1.201 | Gestion de parc informatique |
| Vaultwarden | https://vault.oldevops.fr | 192.168.1.201 | Gestionnaire de mots de passe auto-hébergé |
| Zabbix | https://monitoring.oldevops.fr | 192.168.1.202 | Surveillance avancée des serveurs et services |
| NetBox | https://netbox.oldevops.fr | 192.168.1.201 | Documentation réseau et DCIM |
| Prometheus | https://prometheus.oldevops.fr | 192.168.1.202 | Métriques et monitoring |
| Grafana | https://grafana.oldevops.fr | 192.168.1.202 | Dashboards de visualisation |
| App Demo | https://app.oldevops.fr | 192.168.1.250 | Application de démonstration (Story 1.6-1.8) |

## 🛠️ Stack Technique

- **Infrastructure**
  - Proxmox VE (Virtualisation)
  - LXC (Conteneurs légers)
  - Réseau BBox 192.168.1.0/24

- **Outils**
  - Terraform (Déploiement d'infrastructure)
  - Ansible (Configuration des services)
  - Git (Versioning du code)

- **Sécurité**
  - Traefik v3 (Reverse Proxy + SSL)
  - OVH DNS-01 (Certificats SSL Let's Encrypt)
  - Ansible Vault (Gestion des secrets)
  - .env (Variables d'environnement)

## 📦 Architecture Ansible

Le projet utilise une architecture basée sur des rôles Ansible pour standardiser et simplifier le déploiement des services.

### Rôles disponibles

| Rôle | Description |
|------|-------------|
| `common` | Installation de Docker, Docker Compose et dépendances système (utilisé par tous les services) |
| `traefik` | Déploiement de Traefik v3 avec challenge DNS OVH |
| `uptime-kuma` | Déploiement d'Uptime Kuma pour la surveillance |
| `snipeit` | Déploiement de Snipe-IT pour la gestion d'inventaire |
| `vaultwarden` | Déploiement de Vaultwarden (gestionnaire de mots de passe) |
| `zabbix-server` | Déploiement du serveur Zabbix |
| `zabbix-agent` | Installation de l'agent Zabbix sur tous les conteneurs |
| `ssh-setup` | Configuration sécurisée de SSH |

### Playbooks

Chaque service dispose de son propre playbook qui orchestre les rôles nécessaires :
- `traefik.yml` - Déploie Traefik (remplace NPM)
- `uptime-kuma.yml` - Déploie Uptime Kuma
- `snipeit.yml` - Déploie Snipe-IT
- `vaultwarden.yml` - Déploie Vaultwarden
- `zabbix.yml` - Déploie Zabbix (serveur + agents)
- `bootstrap-lxc.yml` - Bootstrap initial des conteneurs LXC
- `ssh-setup.yml` - Configuration SSH sécurisée

## 🚀 Déploiement

### Prérequis

1. Un serveur Proxmox installé et configuré
2. Un domaine configuré (oldevops.fr) avec accès aux enregistrements DNS
3. Accès API à Proxmox avec les permissions nécessaires
4. Terraform (>= 1.0.0) et Ansible installés

### Configuration Initiale

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/Infra-oldevops.git
   cd Infra-oldevops/infra-oldevops
   ```

2. Créer un fichier `terraform/terraform.tfvars` avec vos variables :
   ```hcl
   proxmox_host     = "votre-serveur-proxmox.oldevops.fr"
   proxmox_username = "root@pam"
   proxmox_password = "votre-mot-de-passe"
   container_password = "mot-de-passe-securise"
   email = "votre-email@oldevops.fr"
   ```

### Déploiement automatisé (recommandé)

Le script `deploy.sh` orchestre automatiquement le déploiement complet (Terraform + Ansible) :

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement complet
./deploy.sh
```

Ce script effectue les étapes suivantes :
1. Déploiement de l'infrastructure avec Terraform
2. Attente de la disponibilité des conteneurs
3. Bootstrap SSH sur les conteneurs
4. Configuration sécurisée de SSH
5. Test de connectivité

### Déploiement manuel avec Terraform

Si vous préférez déployer manuellement :

```bash
cd terraform

# Initialiser les providers et modules
terraform init

# Vérifier le plan de déploiement
terraform plan -out=tfplan

# Appliquer les changements
terraform apply "tfplan"
```

### Déploiement des services avec Ansible

Après le déploiement Terraform, configurez les services :

```bash
cd ansible

# Déployer tous les services
ansible-playbook -i inventory.ini playbooks/traefik.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/uptime-kuma.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/snipeit.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/vaultwarden.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/zabbix.yml --ask-vault-pass
```

### Configuration DNS

Après le déploiement, configurez vos enregistrements DNS pour pointer vers l'IP publique de votre serveur Proxmox :

- A record: `proxy.oldevops.fr` → [VOTRE_IP_PUBLIQUE]
- CNAME: `*.oldevops.fr` → `proxy.oldevops.fr`

## 🔧 Maintenance

### Sauvegardes

Des sauvegardes automatiques sont configurées pour tous les conteneurs via Proxmox Backup Server (work in progress).

Le fichier d'état Terraform (`tfstate`) est également synchronisé automatiquement dans un bucket S3 OVH pour garantir la pérennité et la restauration de l'infrastructure.

### Mises à jour

1. Mettre à jour le code :
   ```bash
   git pull origin main
   ```

2. Vérifier et appliquer les changements :
   ```bash
   cd terraform
   terraform plan -out=tfplan
   terraform apply "tfplan"
   ```

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue pour discuter des changements proposés.

## 📜 Licence

[LICENSE](LICENSE)
