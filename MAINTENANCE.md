# Maintenance et Opérations - Infrastructure Oldevops

Ce document regroupe les procédures de maintenance, les notes techniques et la feuille de route du projet.

## 🚀 Prochaines Étapes (Feuille de Route)

### 1. Configuration DNS
- **Fournisseur (OVH)** :
  - Enregistrement A : `proxy.oldevops.fr` -> `[VOTRE_IP_PUBLIQUE]`
  - Enregistrement CNAME : `*.oldevops.fr` -> `proxy.oldevops.fr`
- **Vérification** :
  ```bash
  dig +short proxy.oldevops.fr
  ```

### 2. Déploiement des Services
- **Traefik (Reverse Proxy)** :
  - Déjà configuré avec le challenge DNS-01 d'OVH pour SSL automatique.
  - Dashboard accessible sur `https://proxy.oldevops.fr` (après déploiement).
- **Services** :
  - **Uptime Kuma** : Surveillance et notifications.
  - **Snipe-IT** : Inventaire du parc.
  - **Vaultwarden** : Gestionnaire de mots de passe.
  - **Zabbix** : Monitoring avancé.

### 3. Sécurité et Secrets
- **Ansible Vault** : Tous les secrets sont chiffrés dans `ansible/vault/secrets.yml`.
- **Utilisation** : Toujours ajouter `--ask-vault-pass` lors de l'exécution des playbooks.
- **Récupération** : `ansible-vault edit ansible/vault/secrets.yml` pour modifier les accès.

---

## 🛠️ Notes Techniques et Historique

### Configuration Réseau (Proxmox)
Il est nécessaire de créer manuellement l'interface `vmbr1` dans `/etc/network/interfaces` pour isoler le réseau des conteneurs :
```text
auto vmbr1
iface vmbr1 inet static
  address 10.0.0.1/24
  bridge-ports none
  bridge-stp off
  bridge-fd 0
  post-up echo 1 >/proc/sys/net/ipv4/ip_forward
  post-up iptables -t nat -A POSTROUTING -s '10.0.0.0/24' -o vmbr0 -j MASQUERADE
```

### Backend Terraform & AWS
Le stockage de l'état Terraform est sur S3 OVH. Le profil AWS spécifique est configuré dans `backup.tf` :
- Profil : `oldevops` (à configurer dans `~/.aws/credentials`).

### Historique des Refactors Majeurs

- **19.12.2025 - Migration Traefik & Sécurité**
  - Remplacement de Nginx Proxy Manager par **Traefik v3**.
  - Automatisation SSL via **OVH DNS-01**.
  - Centralisation et chiffrement de tous les secrets via **Ansible Vault**.
  - Unification du nommage des hôtes dans Terraform et Ansible.
  - Mise à jour de l'infrastructure pour le nouveau routeur **Bouygues**.

- **02.12.2025 - Standardisation Ansible**
  - Création du rôle `common` pour Docker.
  - Restructuration complète en rôles Ansible pour chaque service.

- **01.12.2025 - Backend S3**
  - Mise en place du stockage distant du `tfstate`.

---

## 🔧 Maintenance Courante

### Mises à jour
Mettre à jour régulièrement les conteneurs et le système hôte Proxmox :
```bash
# Pour les services Ansible
ansible-playbook -i inventory.ini playbooks/[nom-du-service].yml --ask-vault-pass
```

### Sauvegardes
- Sauvegardes LXC quotidiennes via Proxmox.
- `tfstate` sauvegardé sur S3.
- **Attention** : Toujours garder une copie du mot de passe du Vault Ansible hors-site.
