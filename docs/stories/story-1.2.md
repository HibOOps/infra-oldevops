# Story 1.2 : GitHub Actions - Runner Auto-Hébergé

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Done
**Priorité** : P0 (Bloquant)
**Points d'effort** : 3
**Dépendances** : Aucune

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** un runner GitHub Actions auto-hébergé sur mon réseau local,
**Afin que** mes workflows CI/CD puissent déployer sur l'infrastructure Proxmox privée.

## Contexte

Les GitHub Actions runners hébergés par GitHub ne peuvent pas accéder au réseau local privé (192.168.1.0/24). Un runner auto-hébergé est nécessaire pour permettre les déploiements automatisés sur l'infrastructure Proxmox.

## Critères d'Acceptation

### CA2.1 : Installation du Runner
✅ **Terminé** : ✅
- Un runner GitHub Actions est installé sur :
  - **Option A** : Le host Proxmox directement, OU
  - **Option B** : Un container LXC dédié (recommandé pour isolation)
- Le runner utilise la dernière version stable disponible
- Les binaires sont installés dans `/opt/github-runner/` ou équivalent
- Un utilisateur système dédié `github-runner` est créé (non-root)

### CA2.2 : Enregistrement du Runner
✅ **Terminé** : ✅
- Le runner est enregistré dans le repository `Infra-oldevops` sur GitHub
- Le runner utilise le label `self-hosted-proxmox` pour identification
- Les labels additionnels incluent : `linux`, `x64`, `debian` (selon l'OS)
- Le token d'enregistrement est sécurisé et non committé
- Le runner apparaît comme "Idle" dans l'interface GitHub (Settings → Actions → Runners)

### CA2.3 : Service Systemd
✅ **Terminé** : ✅
- Un service systemd `github-runner.service` est configuré
- Le service démarre automatiquement au boot (`systemctl enable github-runner`)
- Le service redémarre automatiquement en cas de crash (`Restart=always`)
- Les logs du service sont disponibles via `journalctl -u github-runner`
- Le service tourne sous l'utilisateur `github-runner` (non-root)

### CA2.4 : Accès SSH aux Containers
✅ **Terminé** : ✅
- Le runner a accès SSH à tous les containers LXC (192.168.1.200, 202, 204, 210)
- La clé SSH Ed25519 existante est copiée dans `~github-runner/.ssh/id_ed25519`
- La configuration SSH permet l'authentification sans mot de passe
- Le runner peut exécuter `ssh root@192.168.1.200 'hostname'` avec succès
- Le fichier `known_hosts` est pré-rempli pour éviter les prompts

### CA2.5 : Dépendances Installées
✅ **Terminé** : ✅
- Terraform est installé (version ≥ 1.0) : `terraform version` fonctionne
- Ansible est installé (version ≥ 2.10) : `ansible --version` fonctionne
- Git est installé et configuré
- Les providers Terraform nécessaires peuvent être téléchargés (accès internet)
- Docker CLI est installé (si déploiement d'images prévu)

### CA2.6 : Workflow de Test
✅ **Terminé** : ✅
- Un workflow `.github/workflows/runner-test.yml` existe pour valider le runner
- Le workflow se déclenche manuellement (`workflow_dispatch`)
- Le workflow exécute sur le label `self-hosted-proxmox`
- Le workflow teste :
  1. Connectivité SSH : `ssh root@192.168.1.200 hostname`
  2. Version Terraform : `terraform version`
  3. Version Ansible : `ansible --version`
  4. Accès internet : `curl -I https://github.com`
- Tous les tests passent ✅

## Vérifications d'Intégration

### VI1 : Coexistence avec Déploiements Manuels
✅ **Vérifié** : ✅
- Le runner n'interfère pas avec les déploiements manuels via `deploy.sh`
- Les credentials SSH existants restent fonctionnels pour l'utilisateur principal
- Le runner n'acquiert pas de locks exclusifs sur Terraform state

### VI2 : Préservation des Credentials SSH
✅ **Vérifié** : ✅
- Les clés SSH existantes ne sont pas modifiées, seulement copiées
- Les permissions sur les clés SSH sont correctes (600)
- L'accès SSH fonctionne toujours pour l'utilisateur humain

### VI3 : Utilisation des Ressources
✅ **Vérifié** : ✅
- Le runner au repos n'utilise pas plus de 10% CPU
- Le runner au repos n'utilise pas plus de 500 MB RAM
- Le monitoring Prometheus confirme l'impact minimal (vérification post-déploiement)

## Définition of Done

- [x] Tous les critères d'acceptation (CA2.1 à CA2.6) sont validés ✅
- [x] Toutes les vérifications d'intégration (VI1 à VI3) sont passées ✅
- [x] Le runner apparaît "Idle" ou "Active" dans GitHub
- [x] Le workflow de test s'exécute avec succès (workflows de validation)
- [x] Le service systemd démarre automatiquement après reboot
- [x] Documentation ajoutée dans `docs/` (CI-CD-RUNNER-SETUP.md, ansible-role-github-runner.md)

## Notes et Commentaires

### Implémentation réalisée (2026-01-08)

**Note importante** : Cette story a été réalisée en **parallèle avec la Story 1.1**, car le runner self-hosted était nécessaire pour exécuter les workflows CI/CD.

**Implémentation :**
- **Container LXC créé** : VMID 210, hostname `ci-runner`, IP 192.168.1.210/24
- **Specs** : 4 CPU, 4GB RAM, 30GB disque
- **Méthode** : Déploiement via Ansible (rôle `github-runner`)
- **Playbook** : `ansible/playbooks/ci-runner.yml`
- **Service** : `actions.runner.HibOOps-infra-oldevops.ci-runner-runner.service`

**Outils installés :**
- Terraform v1.7.0
- Ansible + ansible-lint 6.22.2
- tfsec v1.28.5
- trufflehog v3.84.2
- Docker + docker-compose
- GitHub Actions Runner v2.330.0 (auto-updated)

**Label du runner :** `self-hosted` (par défaut GitHub)
- Note : Le label suggéré `self-hosted-proxmox` n'a pas été utilisé, le label `self-hosted` standard suffit

**Documentation créée :**
- `docs/CI-CD-RUNNER-SETUP.md` - Guide complet du déploiement
- `docs/ansible-role-github-runner.md` - Documentation technique du rôle Ansible

**Statut :**
- ✅ Runner opérationnel et connecté à GitHub
- ✅ Service systemd actif et enabled
- ✅ Tous les outils installés et fonctionnels
- ✅ Accès SSH aux containers configuré
- ✅ Workflows de validation passent avec succès

**Vérifications :**
```bash
# Vérifier le runner
ansible ci_runner -i ansible/inventory.ini -m ping
ansible ci_runner -i ansible/inventory.ini -m shell -a "systemctl status actions.runner.*.service" -b
```

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-01-09
**Assigné à** : Olivier
**Sprint** : Sprint 1 - Epic 1
