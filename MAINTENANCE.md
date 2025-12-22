# Maintenance et Opérations - Infrastructure Oldevops (Consolidée)

Ce document regroupe les procédures de maintenance, les notes techniques et la feuille de route du projet.

## 🚀 Prochaines Étapes (Feuille de Route)

### 1. Configuration DNS
- **Fournisseur (OVH)** :
  - Enregistrement A : `proxy.oldevops.fr` -> `[VOTRE_IP_PUBLIQUE]`
  - Enregistrement CNAME : `*.oldevops.fr` -> `proxy.oldevops.fr`

### 2. Déploiement Consolidé
L'infrastructure est maintenant regroupée sur 3 LXCs pour optimiser les ressources :

1.  **Proxy (10.0.0.2)** : Traefik v3.
2.  **Utilities (10.0.0.20)** : Snipe-IT, Vaultwarden, **NetBox**.
3.  **Monitoring (10.0.0.40)** : Zabbix, Uptime Kuma, Prometheus, Grafana.

#### Commandes de déploiement :
```bash
# Infrastructure
cd terraform && terraform apply

# Services
cd ../ansible
ansible-playbook -i inventory.ini playbooks/traefik.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/utilities.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/monitoring.yml --ask-vault-pass
```

### 🗑️ Remise à zéro (Clean Slate)
Si vous souhaitez supprimer toute l'infrastructure pour repartir de zéro :

1.  **Via Terraform (Recommandé)** :
    ```bash
    cd terraform
    terraform destroy
    ```
    *Ceci détruira les 3 conteneurs actuels ainsi que tout ce qui est géré dans le `tfstate`.*

2.  **Nettoyage des anciens conteneurs (Orphelins)** :
    Si vous avez encore les anciens conteneurs (IDs 210, 230) qui ne sont plus dans le code actuel, vous pouvez les supprimer manuellement via la console Proxmox ou en SSH sur l'hôte Proxmox :
    ```bash
    pct destroy 210
    pct destroy 230
    ```

3.  **Redéploiement complet** :
    Utilisez simplement le script à la racine :
    ```bash
    ./deploy.sh
    ```

---

## 🛠️ Notes Techniques

### Routage Traefik (Multi-LXC)
Traefik utilise un **fournisseur de fichier** (`dynamic_conf.yml`) pour router les requêtes vers les autres LXCs, car les conteneurs Docker ne sont pas sur le même moteur Docker que Traefik.

**Ports Utilisés sur les LXCs :**
- **Utilities** : Snipe-IT (8081), Vaultwarden (8082), **NetBox (8084)**.
- **Monitoring** : Zabbix (8083), Uptime Kuma (3001), Prometheus (9090), Grafana (3000).

### Sécurité SSH & Ansible
Pour faciliter les redéploiements fréquents (destruction/recréation), Ansible est configuré (`ansible.cfg`) pour ignorer la vérification des clés d'hôte (`host_key_checking = False`). Cela évite les erreurs "REMOTE HOST IDENTIFICATION HAS CHANGED" quand un conteneur est recréé avec la même IP.

### Docker dans LXC
Pour que Docker fonctionne de manière stable et puisse monter les systèmes de fichiers nécessaires (`/proc`, etc.), les conteneurs ont été configurés en **mode privilégié** (`unprivileged = false`) et avec l'option **`nesting = true`** activée dans Terraform.

---

## 🔧 Historique des Refactors

- **19.12.2025 - Intégration NetBox & Mise à l'échelle**
  - Ajout de **NetBox** sur le LXC Utilities.
  - Augmentation des ressources du LXC Utilities (6 vCPU, 8 Go RAM, 40 Go Disque).
  - Configuration du routage Traefik pour `netbox.oldevops.fr`.

- **19.12.2025 - Consolidation LXC & Monitoring+**
  - Réduction de 5 à 3 LXCs (Proxy, Utilities, Monitoring).
  - Ajout de **Prometheus** et **Grafana**.
  - Passage au `file provider` pour Traefik pour le routage inter-LXC.
  - Standardisation des ports hôtes sur les LXCs consolidés.
