# Infra-oldevops

Infrastructure-as-Code pour le déploiement des services internes sur un serveur Proxmox derrière un routeur Free, utilisant le domaine `oldevops.fr`.

## 🌐 Architecture Globale

![Architecture Diagram](architecture.excalidraw)

### Services Principaux

| Service | URL | IP | Description |
|---------|-----|----|-------------|
| Reverse Proxy | https://proxy.oldevops.fr | 172.20.0.2 | Nginx Proxy Manager pour le routage et la gestion des certificats |
| Uptime Kuma | https://status.oldevops.fr | 172.20.0.10 | Surveillance des services et temps de réponse |
| Snipe-IT | https://inventory.oldevops.fr | 172.20.0.20 | Gestion de parc informatique |
| Vaultwarden | https://vault.oldevops.fr | 172.20.0.30 | Gestionnaire de mots de passe auto-hébergé |
| Zabbix | https://monitoring.oldevops.fr | 172.20.0.40 | Surveillance avancée des serveurs et services |

## 🛠️ Stack Technique

- **Infrastructure**
  - Proxmox VE (Virtualisation)
  - LXC (Conteneurs légers)
  - Réseau privé 172.20.0.0/24

- **Outils**
  - Terraform (Déploiement d'infrastructure)
  - Ansible (Configuration des services)
  - Git (Versioning du code)

- **Sécurité**
  - Nginx Proxy Manager (Reverse Proxy + SSL)
  - Let's Encrypt (Certificats SSL)
  - Vault (Gestion des secrets)
  - .env (Variables d'environnement)

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

### Déploiement avec Terraform

```bash
cd terraform

# Initialiser les providers et modules
terraform init

# Vérifier le plan de déploiement
terraform plan -out=tfplan

# Appliquer les changements
terraform apply "tfplan"
```

### Configuration DNS

Après le déploiement, configurez vos enregistrements DNS pour pointer vers l'IP publique de votre serveur Proxmox :

- A record: `proxy.oldevops.fr` → [VOTRE_IP_PUBLIQUE]
- CNAME: `*.oldevops.fr` → `proxy.oldevops.fr`

## 🔧 Maintenance

### Sauvegardes

Des sauvegardes automatiques sont configurées pour tous les conteneurs via Proxmox Backup Server.

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

## 📝 Documentation Supplémentaire

- [Architecture détaillée](docs/architecture.md)
- [Guide d'administration](docs/admin-guide.md)
- [Dépannage](docs/troubleshooting.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez ouvrir une issue pour discuter des changements proposés.

## 📜 Licence

[LICENSE](LICENSE)
