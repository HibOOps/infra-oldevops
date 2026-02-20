# ADR-006 : Runner auto-hébergé sur LXC dédié

**Statut** : Accepté
**Date** : 2026-01-07
**Auteur** : Équipe DevOps

---

## Contexte

Les workflows GitHub Actions de déploiement ont besoin d'accéder au réseau local (192.168.1.0/24) pour SSH vers les containers LXC. Les runners GitHub-hosted s'exécutent dans le cloud sans accès au LAN. Plusieurs options existent pour créer ce pont.

## Décision

Déployer un **runner GitHub Actions auto-hébergé** sur un LXC dédié (`ci-runner`, VMID 210, 192.168.1.210) avec les outils Terraform, Ansible, Docker CLI pré-installés.

## Justification

| Option | Sécurité | Complexité | Coût |
|--------|----------|------------|------|
| Runner LXC local | ✅ Pas d'exposition | ✅ Faible | ✅ 0€ |
| GitHub-hosted + Cloudflare Tunnel | 🟡 Dépendance externe | ❌ Élevée | 🟡 ~5€/mois |
| GitHub-hosted + SSH exposé public | ❌ Surface d'attaque | ✅ Faible | ✅ 0€ |
| GitHub-hosted + WireGuard VPN | 🟡 Complexe à maintenir | ❌ Élevée | ✅ 0€ |

**Raisons principales** :
- Le runner sur LXC `.210` a accès SSH direct à tous les containers — aucun port exposé sur internet
- LXC dédié = isolation des outils CI (Terraform, Ansible) du reste de l'infra
- Aucun coût supplémentaire (minutes illimitées pour self-hosted)
- Ansible joue le rôle de configuration du runner lui-même (idempotent, reproductible)

## Conséquences

✅ Sécurité : aucun port entrant, le runner appelle GitHub (sortant HTTPS uniquement)
✅ Performance : exécution locale, pas de latence réseau pour les commandes SSH
✅ Coût : 0€ (minutes illimitées)
⚠️ SPOF : si `.210` est down, tout le CI est bloqué — surveiller via Uptime Kuma
⚠️ Maintenance : mises à jour runner à gérer (actuellement `2.321.0`)

## Implémentation

```bash
# Vérifier le statut du runner
ssh root@192.168.1.210 'systemctl status github-runner'

# Logs runner
ssh root@192.168.1.210 'journalctl -u github-runner -f'

# Mise à jour runner (via Ansible)
ansible-playbook -i inventory.ini playbooks/ci-runner.yml
```

Le runner est enregistré avec le label `self-hosted-proxmox` utilisé dans les workflows de déploiement.
