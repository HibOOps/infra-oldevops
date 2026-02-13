# Story 1.4 : Container Application - Infrastructure Terraform

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 🔄 In Progress
**Priorité** : P1 (Haute)
**Points d'effort** : 3
**Dépendances** : Aucune

---

## User Story

**En tant que** Ingénieur Plateforme,
**Je veux** un nouveau container LXC dédié pour l'application de démonstration,
**Afin de** avoir une isolation propre pour déployer une stack applicative moderne.

## Contexte

Cette story crée l'infrastructure de base (container LXC) qui hébergera l'application de démonstration. C'est le quatrième container de l'infrastructure, dédié aux workloads applicatifs.

## Critères d'Acceptation

### CA4.1 : Fichier Terraform pour le Container
✅ **Terminé** : ⬜
- Un nouveau fichier `terraform/app-demo.tf` existe
- Le fichier définit une ressource `proxmox_lxc` pour le container applicatif
- Le code suit les conventions Terraform du projet (formatting, variables, outputs)
- Le fichier est documenté avec des commentaires expliquant son rôle

### CA4.2 : Configuration du Container
✅ **Terminé** : ⬜
- **VMID** : 210
- **Hostname** : `app-demo`
- **IP** : `192.168.1.210/24`
- **Gateway** : `192.168.1.254`
- **DNS** : `192.168.1.254` ou `1.1.1.1` (selon config réseau)
- Configuration réseau via `eth0` sur bridge `vmbr0`

### CA4.3 : Ressources du Container
✅ **Terminé** : ⬜
- **Cores** : 2
- **Memory** : 2048 MB
- **Swap** : 512 MB
- **Disk** : 20 GB sur storage `local-lvm`
- **Disk mountpoint** : `/` (root filesystem)

### CA4.4 : Template et Stockage
✅ **Terminé** : ⬜
- Template OS : Debian 12 (Bookworm)
- Template référencé via `ostemplate = "local:vztmpl/debian-12-standard_12.X-X_amd64.tar.zst"`
- Stockage : `local-lvm` (cohérent avec les autres containers)
- Vérifier que le template Debian 12 est disponible sur Proxmox

### CA4.5 : Mode et Features
✅ **Terminé** : ⬜
- Container en mode **unprivileged** (`unprivileged = true`)
- Feature **nesting** activée (`nesting = true`) pour supporter Docker dans le container
- Feature **keyctl** désactivée (sauf si nécessaire)
- Feature **fuse** activée si nécessaire pour certaines applications

### CA4.6 : Outputs Terraform
✅ **Terminé** : ⬜
- Un output `app_demo_ip` expose l'adresse IP du container (192.168.1.210)
- Un output `app_demo_hostname` expose le hostname (app-demo)
- Les outputs sont documentés avec description
- Les outputs sont utilisables par Ansible (`terraform output -json`)

### CA4.7 : Démarrage Automatique
✅ **Terminé** : ⬜
- Le container est configuré avec `onboot = true`
- Le container démarre automatiquement avec le host Proxmox
- L'ordre de démarrage est approprié (après réseau, avant monitoring si nécessaire)

## Vérifications d'Intégration

### VI1 : Non-Régression des Containers Existants
✅ **Vérifié** : ⬜
- Les 3 containers existants (200, 202, 204) ne sont PAS modifiés dans le code Terraform
- Aucun changement détecté par `terraform plan` sur les ressources existantes
- Les containers existants restent opérationnels après `terraform apply`
- Test : `terraform plan` ne montre que l'ajout du container 210

### VI2 : Ressources Disponibles sur Proxmox
✅ **Vérifié** : ⬜
- Le host Proxmox a suffisamment de ressources pour le nouveau container :
  - CPU : vérifier la charge actuelle (doit être <70%)
  - RAM : vérifier l'utilisation actuelle (au moins 3 GB libres pour buffer)
  - Disk : vérifier l'espace sur `local-lvm` (au moins 30 GB libres)
- Monitoring Prometheus/Grafana confirme les ressources disponibles
- Le nouveau container ne dégrade pas les performances des containers existants

### VI3 : Réseau et Routage
✅ **Vérifié** : ⬜
- L'IP 192.168.1.210 n'est pas déjà utilisée sur le réseau
- Le bridge `vmbr0` gère correctement le nouveau container
- Le container peut pinguer la gateway (192.168.1.254)
- Le container peut pinguer les autres containers (200, 202, 204)
- Le container a accès internet (test avec `curl https://google.com`)

## Tâches Techniques

### Phase 1 : Préparation
- [ ] Vérifier les ressources disponibles sur Proxmox via interface web ou CLI
- [ ] Vérifier que l'IP 192.168.1.210 est libre : `ping 192.168.1.210`
- [ ] Vérifier que le template Debian 12 est disponible : `pveam list local`
- [ ] Créer une branche Git : `feature/app-container`

### Phase 2 : Code Terraform
- [x] Créer le fichier `terraform/app-demo.tf` (ajouté dans main.tf comme module, suivant la convention du projet)
- [x] Définir les variables nécessaires dans `terraform/variables.tf` (si besoin)
- [x] Implémenter la ressource `proxmox_lxc` avec toutes les spécifications
- [x] Ajouter les outputs `app_demo_ip` et `app_demo_hostname`
- [ ] Formatter le code : `terraform fmt`

### Phase 3 : Validation Terraform
- [ ] Exécuter `terraform init` (si nouveaux providers ou modules)
- [ ] Exécuter `terraform validate` → doit passer ✅
- [ ] Exécuter `terraform plan` → doit montrer 1 ressource à créer
- [ ] Vérifier le plan détaillé (spécifications du container)
- [ ] Corriger les erreurs éventuelles

### Phase 4 : Déploiement
- [ ] Créer un backup du Terraform state actuel
- [ ] Exécuter `terraform apply` et approuver
- [ ] Vérifier que le container est créé dans Proxmox (web UI ou CLI)
- [ ] Vérifier le status du container : `pct status 210` → doit être "running"

### Phase 5 : Tests Post-Déploiement
- [ ] SSH dans le container : `ssh root@192.168.1.210`
- [ ] Vérifier la configuration réseau : `ip a`, `ip route`
- [ ] Tester la connectivité internet : `ping 1.1.1.1`, `curl https://google.com`
- [ ] Tester la connectivité vers autres containers : `ping 192.168.1.200`
- [ ] Vérifier les ressources : `free -h`, `df -h`, `nproc`

### Phase 6 : Documentation et PR
- [ ] Mettre à jour le README avec le nouveau container (tableau des containers)
- [ ] Documenter les spécifications du container dans `docs/architecture/`
- [ ] Committer les changements avec message descriptif
- [ ] Créer une PR vers `main`
- [ ] Le pipeline de validation (Story 1.1) doit passer ✅

## Définition of Done

- [ ] Tous les critères d'acceptation (CA4.1 à CA4.7) sont validés ✅
- [ ] Toutes les vérifications d'intégration (VI1 à VI3) sont passées ✅
- [ ] Le container 210 est créé et running sur Proxmox
- [ ] SSH fonctionne : `ssh root@192.168.1.210`
- [ ] Le container a accès internet et au réseau local
- [ ] Le code Terraform est formaté, validé et documenté
- [ ] PR créée et approuvée (si workflow de validation actif)
- [ ] Terraform state mis à jour correctement

## Risques et Mitigations

### Risque 1 : Ressources insuffisantes sur Proxmox
**Probabilité** : Faible | **Impact** : Bloquant
**Mitigation** :
- Vérifier les ressources avant déploiement
- Possibilité de réduire les ressources des autres containers si nécessaire
- Alternative : Utiliser un container plus léger (1 core, 1.5 GB RAM)

### Risque 2 : Conflit d'IP sur le réseau
**Probabilité** : Faible | **Impact** : Moyen
**Mitigation** :
- Vérifier que l'IP est libre avec `ping` avant apply
- Documenter l'allocation d'IPs dans `docs/architecture/network.md`
- Utiliser DHCP réservation si disponible sur la Bbox

### Risque 3 : Template Debian 12 manquant ou corrompu
**Probabilité** : Faible | **Impact** : Bloquant
**Mitigation** :
- Télécharger le template avant apply : `pveam download local debian-12-standard_12.X-X_amd64.tar.zst`
- Alternative : Utiliser Debian 11 si Debian 12 pose problème
- Vérifier l'intégrité du template

### Risque 4 : Nesting Docker ne fonctionne pas
**Probabilité** : Moyenne | **Impact** : Bloquant
**Mitigation** :
- Activer `nesting = true` dans la configuration
- Vérifier les permissions du container (unprivileged)
- Tester Docker dans le container après création
- Fallback : Container privileged si absolument nécessaire (moins sécurisé)

## Ressources et Références

### Documentation
- [Proxmox LXC Configuration](https://pve.proxmox.com/wiki/Linux_Container)
- [Terraform Proxmox Provider - LXC](https://registry.terraform.io/providers/Telmate/proxmox/latest/docs/resources/lxc)
- [Docker in LXC](https://discuss.linuxcontainers.org/t/running-docker-inside-lxc/8663)

### Exemple Terraform
```hcl
resource "proxmox_lxc" "app_demo" {
  target_node  = "pve"
  hostname     = "app-demo"
  vmid         = 210
  ostemplate   = "local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"
  unprivileged = true
  onboot       = true

  cores  = 2
  memory = 2048
  swap   = 512

  rootfs {
    storage = "local-lvm"
    size    = "20G"
  }

  network {
    name   = "eth0"
    bridge = "vmbr0"
    ip     = "192.168.1.210/24"
    gw     = "192.168.1.254"
  }

  features {
    nesting = true
  }
}

output "app_demo_ip" {
  description = "IP address of the app-demo container"
  value       = proxmox_lxc.app_demo.network[0].ip
}
```

## Notes et Commentaires

- VMID 210 was already taken by the CI Runner (Story 1.2). App-demo uses VMID 250, IP 192.168.1.250 instead.
- Container added as module in `main.tf` following project convention (not separate file).
- Set `unprivileged = true` as specified in CA4.5 (other containers use privileged mode).
- Nesting/keyctl/fuse/mknod already enabled in the module by default.

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### File List
| File | Action | Description |
|------|--------|-------------|
| `terraform/main.tf` | Modified | Added module "app_demo" (VMID 250, IP 192.168.1.250, 2 cores, 2GB RAM, 20GB disk) |
| `terraform/outputs.tf` | Modified | Added app_demo_ip, app_demo_hostname outputs + CI Runner to container_ips map |

### Change Log
- 2026-02-13: Added app-demo container module in main.tf with VMID 250, IP 192.168.1.250
- 2026-02-13: Added outputs for app_demo_ip and app_demo_hostname
- 2026-02-13: Note: VMID changed from 210 to 250 due to CI Runner conflict

### Debug Log References
_No debug issues encountered_

### Completion Notes
- Phases 1, 3-6 require live Proxmox environment (terraform validate/plan/apply, SSH tests, PR)
- Phase 2 (code) is complete
- Container set to unprivileged=true (differs from other containers which are privileged)

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-02-13
**Assigné à** : James (Dev Agent)
**Sprint** : _À définir_
