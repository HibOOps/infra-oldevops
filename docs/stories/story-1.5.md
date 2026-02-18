# Story 1.5 : Container Application - Configuration Ansible

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Ready for Review
**Priorité** : P1 (Haute)
**Points d'effort** : 5
**Dépendances** : Story 1.4 (Container créé)

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** provisionner automatiquement le container application avec Docker et dépendances,
**Afin de** préparer l'environnement pour déployer l'application de démonstration.

## Critères d'Acceptation

### CA5.1 : Rôle Ansible app-demo
- Structure standard de rôle créée dans `ansible/roles/app-demo/`
- Sous-dossiers : `tasks/`, `templates/`, `vars/`, `handlers/`, `files/`
- Fichier `meta/main.yml` avec description et dépendances

### CA5.2 : Installation Docker
- Docker CE installé via APT (dernière version stable)
- Docker Compose Plugin installé
- Service Docker activé et démarré (`systemctl enable --now docker`)
- Test : `docker --version` et `docker compose version` fonctionnent

### CA5.3 : Variables d'Environnement
- Variables applicatives définies dans `ansible/roles/app-demo/vars/main.yml`
- Secrets sensibles stockés dans Ansible Vault
- Variables incluent : DB credentials, API keys, JWT secret
- Template `.env` déployé dans `/opt/app-demo/.env`

### CA5.4 : Docker Compose Déployé
- Template `docker-compose.yml` dans `ansible/roles/app-demo/templates/`
- Fichier déployé dans `/opt/app-demo/docker-compose.yml`
- Services définis : frontend, backend, postgresql
- Volumes et réseaux configurés

### CA5.5 : Playbook app-demo
- Nouveau playbook `ansible/playbooks/app-demo.yml`
- Cible le host `192.168.1.210`
- Applique le rôle `app-demo`
- Idempotent (peut être rejoué sans effet secondaire)

### CA5.6 : Intégration dans deploy.sh
- Le playbook est appelé dans `scripts/deploy.sh`
- Exécuté après le playbook Traefik
- Ordre : traefik → utilities → monitoring → **app-demo**

## Vérifications d'Intégration

### VI1 : Playbooks Existants Préservés
- Les playbooks existants fonctionnent toujours sans modification
- Aucune régression sur les rôles `traefik`, `common`, `monitoring`

### VI2 : Accès SSH Fonctionnel
- Le container 192.168.1.210 est accessible via SSH
- Clés Ed25519 existantes fonctionnent

### VI3 : Docker Opérationnel
- Docker fonctionne dans le container : `docker run hello-world` réussit
- Nesting LXC activé et fonctionnel

## Définition of Done

- [x] Tous les CA validés (CA5.5/VI2 IP corrected 210→250 in implementation, noted below)
- [x] Docker installé et fonctionnel dans le container (`docker run hello-world` ✅)
- [x] Playbook exécutable sans erreur (ok=18 changed=3 failed=0 ✅)
- [x] Code Ansible validé par ansible-lint (ansible-lint 26.1.1, exit 0 ✅)
- [x] Documentation mise à jour (deploy.sh updated)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### File List
| File | Action | Description |
|------|--------|-------------|
| `ansible/roles/app-demo/meta/main.yml` | Created | Role metadata with common dependency |
| `ansible/roles/app-demo/tasks/main.yml` | Created | Main tasks: create dir, deploy env/compose, start stack |
| `ansible/roles/app-demo/vars/main.yml` | Created | Non-sensitive variables (ports, paths, domain) |
| `ansible/roles/app-demo/handlers/main.yml` | Created | Restart handler for docker compose |
| `ansible/roles/app-demo/templates/env.j2` | Created | .env template with DB/JWT/API vars |
| `ansible/roles/app-demo/templates/docker-compose.yml.j2` | Created | 3-service stack (frontend, backend, postgres) with Traefik labels |
| `ansible/playbooks/app-demo.yml` | Created | Playbook targeting app_demo host group |
| `ansible/inventory.ini` | Modified | Added [app_demo] group with 192.168.1.250 |
| `scripts/create-snapshots.sh` | Modified | Updated container list to include VMID 250 |
| `scripts/health-check.sh` | Modified | Added 192.168.1.250 to SSH/Docker checks, demo.oldevops.fr to HTTP checks |
| `scripts/rollback.sh` | Modified | Updated container list to include VMID 250 |
| `deploy.sh` | Modified | Added app-demo playbook call (CA5.6) |
| `ansible/roles/app-demo/templates/docker-compose.yml.j2` | Modified | Removed obsolete `version: "3.8"` field |

### Change Log
- 2026-02-13: Created app-demo Ansible role with full structure
- 2026-02-13: Created playbook, updated inventory with app_demo group at 192.168.1.250
- 2026-02-13: Updated all deployment scripts to include new container
- 2026-02-18: Added app-demo playbook to deploy.sh (CA5.6)
- 2026-02-18: Removed obsolete version field from docker-compose.yml.j2
- 2026-02-18: Playbook executed successfully against CT 250 (ok=18 failed=0)
- 2026-02-18: ansible-lint upgraded on runner (6.22.2→26.1.1, ansible-core 2.19 compat)
- 2026-02-18: Story status set to Ready for Review

### Debug Log References
_No debug issues encountered_

### Completion Notes
- CA5.5/VI2 reference `192.168.1.210` (old spec) — all code correctly uses `192.168.1.250`; cannot modify ACs per agent rules
- Vault secrets `app_demo_db_password` and `app_demo_jwt_secret` confirmed present in ansible/vault/secrets.yml ✅
- Playbook run 2026-02-18: ok=18 changed=3 failed=0 unreachable=0 ✅
- Docker CE 29.2.1 installed and functional: `docker run hello-world` ✅, 3 containers running (frontend, backend, db)
- ansible-lint upgraded on CI runner from 6.22.2→26.1.1 (was incompatible with ansible-core 2.19)
- Removed obsolete `version: "3.8"` from docker-compose.yml.j2 (compose v2 warning)
- deploy.sh updated: added app-demo playbook call after monitoring (CA5.6) ✅
- Docker Compose uses node:20-alpine placeholder images; actual app build is Story 1.6

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-02-13
