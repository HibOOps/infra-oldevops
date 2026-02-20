# ADR-003 : GitHub Actions avec runner auto-hébergé

**Statut** : Accepté
**Date** : 2026-01-07
**Auteur** : Équipe DevOps

---

## Contexte

L'infrastructure est hébergée sur un réseau local (192.168.1.0/24) derrière NAT. Le déploiement automatisé nécessite un accès SSH aux containers LXC. Un pipeline CI/CD visible publiquement est un atout portfolio majeur.

## Décision

Utiliser **GitHub Actions** avec un **runner auto-hébergé** déployé sur un LXC dédié (`ci-runner`, 192.168.1.210).

## Justification

| Critère | GitHub Actions | Jenkins | GitLab CI |
|---------|---------------|---------|-----------|
| Visibilité recruteurs | ✅ Public | ❌ Interne | ❌ Interne |
| Accès réseau local | ✅ (self-hosted runner) | ✅ | ✅ |
| Coût infra | ✅ Zéro | ❌ Serveur dédié | ❌ Migration Git |
| Setup | ✅ Simple | ❌ Complexe | ❌ Complexe |
| Minutes CI | ✅ Illimités (self-hosted) | ✅ | ✅ |

**Avantages clés** :
- Les pipelines sont **visibles sur GitHub** — recruteur peut voir les runs, les badges, les logs
- Pas d'exposition de SSH sur internet (le runner initie les connexions, pas l'inverse)
- Runner sur LXC `.210` → accès SSH direct à tous les autres containers

**Alternatives considérées** :
- **Jenkins** : serveur dédié requis (512MB+ RAM), interface non visible publiquement
- **GitLab CI** : nécessite migration du repo Git, moins visible pour les recruteurs GitHub
- **GitHub-hosted + Cloudflare Tunnel** : complexité supplémentaire, dépendance externe
- **GitHub-hosted + SSH exposé** : risque sécurité inacceptable

## Conséquences

✅ CI/CD visible publiquement sur GitHub (badges, runs)
✅ Accès réseau local sans exposition internet
✅ Minutes illimitées (self-hosted)
⚠️ Runner = SPOF : si ci-runner `.210` tombe, le CI est bloqué
⚠️ Maintenance du runner (mises à jour, monitoring)

## Implémentation

```yaml
# ansible/roles/github-runner/defaults/main.yml
github_runner_version: "2.321.0"
github_runner_user: "runner"
github_runner_labels: "self-hosted,Linux,X64,proxmox"
```

```yaml
# .github/workflows/app-docker.yml
jobs:
  build:
    runs-on: ubuntu-latest          # jobs légers sur runners GitHub
  deploy:
    runs-on: self-hosted-proxmox    # accès réseau local requis
```
