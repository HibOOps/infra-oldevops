# ADR-001 : LXC Containers au lieu de VMs complètes

**Statut** : Accepté
**Date** : 2025 (infrastructure existante)
**Auteur** : Équipe Infrastructure

---

## Contexte

L'infrastructure homelab nécessite une couche de virtualisation sur Proxmox VE. Le choix principal est entre les machines virtuelles (VMs QEMU/KVM) et les containers LXC. Les services applicatifs utilisent Docker, ce qui implique une virtualisation imbriquée (nested).

## Décision

Utiliser des **containers LXC en mode privilégié** (`unprivileged = false`, `nesting = true`) plutôt que des VMs complètes.

## Justification

| Critère | LXC | VM (QEMU/KVM) |
|---------|-----|----------------|
| Démarrage | < 5 secondes | ~30 secondes |
| Overhead RAM | ~5% | ~15-20% |
| Docker support | ✅ (mode privilégié) | ✅ (natif) |
| Isolation | Partage kernel | Kernel dédié |
| Snapshots Proxmox | ✅ Supporté | ✅ Supporté |

**Raisons principales** :
- Efficacité ressources : LXC consomme 10-20% moins de RAM que les VMs équivalentes
- Provisioning rapide via Terraform (provider Proxmox)
- Démarrage quasi-instantané pour les playbooks de test
- Docker-in-LXC fonctionnel avec `nesting = true`

**Alternatives considérées** :
- **VMs QEMU** : trop coûteuses en ressources (15 GB RAM disponibles seulement)
- **LXC unprivilégié** : Docker ne fonctionne pas de façon fiable sans nesting + mode privilégié
- **Bare-metal** : pas d'isolation, rollback impossible

## Conséquences

✅ Ressources optimisées — 5 containers dans 21 GB RAM
✅ Provisioning rapide via Terraform
✅ Snapshots Proxmox fonctionnels pour rollback
⚠️ Mode privilégié = surface d'attaque plus grande qu'une VM (acceptable homelab)
⚠️ Partage du kernel Proxmox — un container buggé peut impacter les autres

## Implémentation

```hcl
# terraform/modules/lxc_container/main.tf
resource "proxmox_lxc" "container" {
  unprivileged = false   # mode privilégié requis pour Docker
  features {
    nesting = true       # Docker-in-LXC
  }
}
```
