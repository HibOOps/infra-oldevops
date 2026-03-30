# Story 1.16 : Forgejo — Hébergement Git self-hosted & miroir du repo infra-oldevops

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : Draft
**Priorité** : P2 (Haute)
**Points d'effort** : 5
**Dépendances** : Story 1.1 (Proxmox LXC Terraform), Story 1.2 (Ansible common + hardening), Story 1.7 (Traefik HTTPS)

---

## Contexte Produit

L'infrastructure repose entièrement sur GitHub (hébergement code, CI/CD via GitHub Actions). Pour réduire cette dépendance à terme et disposer d'un backup fiable du code, on souhaite déployer **Forgejo** (fork communautaire de Gitea) sur un LXC dédié dans le homelab Proxmox.

**Périmètre de cette story (MVP) :**
- Déployer Forgejo sur le LXC `.203` (VMID=260) via Terraform + Ansible
- Configurer un **miroir pull** du repo `HibOOps/infra-oldevops` depuis GitHub
- Configurer le dépôt git local pour pousser simultanément vers GitHub **et** Forgejo à chaque `git push`
- Exposer Forgejo via Traefik en HTTPS sur `git.oldevops.fr`

**Hors périmètre (prévu pour une story ultérieure) :**
- Migration CI/CD de GitHub Actions vers Forgejo Actions
- Runners Forgejo self-hosted
- Mirroring d'autres repos

---

## User Story

**En tant qu'** administrateur infrastructure,
**Je veux** disposer d'un serveur Forgejo self-hosted avec un miroir automatique du repo `infra-oldevops`,
**afin d'** avoir un backup du code indépendant de GitHub et de pousser mes commits simultanément vers les deux plateformes.

---

## Critères d'Acceptation

### CA16.1 : LXC Forgejo provisionné via Terraform

- Le module Terraform `forgejo` (déjà défini dans `terraform/main.tf`) est appliqué avec succès
- VMID=260, hostname=`forgejo`, IP=`192.168.1.203/24`, privileged LXC
- Ressources : 2 vCPU, 2 GB RAM, 20 GB disque
- La commande `ping 192.168.1.203` est fonctionnelle depuis le réseau local
- La connexion SSH `root@192.168.1.203` est opérationnelle

### CA16.2 : Forgejo déployé via Ansible

- Le playbook `ansible/playbooks/forgejo.yml` s'exécute sans erreur
- Forgejo tourne en Docker (image `codeberg.org/forgejo/forgejo:10`) sur le port 3000
- Le healthcheck Docker passe : `docker inspect forgejo --format='{{.State.Health.Status}}'` retourne `healthy`
- L'accès HTTP local `http://192.168.1.203:3000` répond avec le code 200
- L'utilisateur admin est créé (sans nécessité de changer le mot de passe au premier login)

### CA16.3 : Exposition HTTPS via Traefik

- Le routeur Traefik `forgejo` (déjà défini dans `dynamic_conf.yml.j2`) est actif
- `https://git.oldevops.fr` est accessible depuis un navigateur externe
- Le certificat TLS (via OVH DNS challenge) est valide
- La page de login Forgejo s'affiche correctement

### CA16.4 : Miroir pull du repo GitHub

- Le repo `infra-oldevops` est présent sur Forgejo sous le compte admin
- Le miroir est configuré en mode pull depuis `https://github.com/HibOOps/infra-oldevops`
- L'intervalle de miroir est configuré à **1h** (modification de `forgejo_mirror_interval` de `24h` à `1h`)
- Une synchronisation manuelle via l'UI Forgejo (ou API) fonctionne et ramène les derniers commits
- La tâche Ansible vérifie l'idempotence : un second `ansible-playbook` ne recrée pas le miroir s'il existe déjà

### CA16.5 : Push simultané GitHub + Forgejo

- Le repo local `infra-oldevops` est configuré avec **deux URLs de push** sur le remote `origin` :
  - `git@github.com:HibOOps/infra-oldevops.git` (existant)
  - `ssh://git@git.oldevops.fr:2222/admin/infra-oldevops.git` (Forgejo SSH)
- Un `git push origin main` pousse simultanément vers GitHub et Forgejo
- La clé SSH publique de la machine dev est ajoutée au compte admin Forgejo
- Le port 2222 (SSH Forgejo) est accessible depuis l'extérieur (Traefik TCP ou direct via le port Proxmox)

### CA16.6 : Vault secrets Forgejo

- Les secrets suivants sont ajoutés au vault Ansible (`vault/secrets.yml`) :
  - `forgejo_admin_user`
  - `forgejo_admin_password`
  - `forgejo_admin_email`
  - `forgejo_secret_key` (chaîne aléatoire ≥ 64 chars)
  - `forgejo_internal_token` (chaîne aléatoire ≥ 64 chars)
- Ces variables sont bien référencées dans le role Forgejo (déjà le cas dans le template)
- Aucun secret n'est commité en clair dans le repo

### CA16.7 : Monitoring

- `node-exporter` et `cadvisor` sont déployés sur `192.168.1.203` (via `monitoring.yml` qui cible `all:!proxmox`)
- Prometheus scrape correctement les métriques sur `192.168.1.203:9100` (node-exporter)
- Le host Forgejo apparaît dans le dashboard Grafana node-exporter

---

## Vérifications d'Intégration

### VI1 : Idempotence Ansible

- Exécuter `ansible-playbook forgejo.yml` deux fois de suite ne produit pas d'erreurs ni de modifications non désirées
- Le bloc "Create Forgejo admin user" ne tente pas de recréer l'utilisateur si celui-ci existe
- Le bloc "Create GitHub mirror repository" ne tente pas de recréer le miroir si celui-ci existe

### VI2 : Traefik non impacté

- Le redéploiement de la configuration Traefik (pour activer le routeur forgejo) n'interrompt pas les services existants (`demo.oldevops.fr`, `vault.oldevops.fr`, etc.)
- Le `docker compose restart traefik` sur `.200` suffit à charger la nouvelle conf (dynamic_conf hot-reload)

### VI3 : UFW / Réseau

- Le pare-feu UFW sur `.203` autorise `192.168.1.0/24` (règle commune à tous les LXC)
- Le port 3000 (HTTP Forgejo) est accessible depuis `.200` (Traefik)
- Le port 2222 (SSH Forgejo) est accessible selon la configuration choisie (voir CA16.5)

---

## Définition of Done

- [ ] `terraform apply` appliqué, LXC 192.168.1.203 démarré et accessible SSH
- [ ] Vault secrets Forgejo ajoutés et encryptés
- [ ] `ansible-playbook forgejo.yml` s'exécute sans erreur (CA16.2)
- [ ] `https://git.oldevops.fr` répond avec cert TLS valide (CA16.3)
- [ ] Miroir pull `infra-oldevops` présent dans Forgejo, sync manuelle OK (CA16.4)
- [ ] Push simultané GitHub + Forgejo configuré et testé (CA16.5)
- [ ] Clé SSH dev ajoutée au compte admin Forgejo
- [ ] node-exporter visible dans Prometheus/Grafana (CA16.7)
- [ ] Second run Ansible idempotent (VI1)
- [ ] Code review effectué

---

## Tâches / Sous-tâches

- [ ] **T1 : Terraform — Provisionner le LXC Forgejo** (CA16.1)
  - [ ] T1.1 Vérifier que `module "forgejo"` est bien dans `terraform/main.tf` (déjà fait)
  - [ ] T1.2 Exécuter `terraform plan` et vérifier que seul le module forgejo est à créer
  - [ ] T1.3 Exécuter `terraform apply -target=module.forgejo`
  - [ ] T1.4 Valider SSH `root@192.168.1.203`

- [ ] **T2 : Vault — Ajouter les secrets Forgejo** (CA16.6)
  - [ ] T2.1 Générer `forgejo_secret_key` et `forgejo_internal_token` (openssl rand -hex 32)
  - [ ] T2.2 Choisir `forgejo_admin_user`, `forgejo_admin_password`, `forgejo_admin_email`
  - [ ] T2.3 Ajouter les 5 variables dans `ansible/vault/secrets.yml` via `ansible-vault edit`
  - [ ] T2.4 Vérifier que `ansible-vault view vault/secrets.yml` liste bien les nouvelles clés

- [ ] **T3 : Ansible — Corriger l'intervalle miroir** (CA16.4)
  - [ ] T3.1 Dans `ansible/roles/forgejo/vars/main.yml`, modifier `forgejo_mirror_interval` de `"24h"` à `"1h"`

- [ ] **T4 : Ansible — Déployer Forgejo** (CA16.2, CA16.4)
  - [ ] T4.1 Exécuter `ansible-playbook -i inventory.ini playbooks/forgejo.yml --vault-password-file=.vault_pass`
  - [ ] T4.2 Vérifier healthcheck Docker : `docker inspect forgejo --format='{{.State.Health.Status}}'`
  - [ ] T4.3 Valider API : `curl http://192.168.1.203:3000/api/healthz`
  - [ ] T4.4 Vérifier que le miroir `infra-oldevops` est créé dans l'UI Forgejo
  - [ ] T4.5 Lancer une sync manuelle et vérifier que les commits GitHub apparaissent

- [ ] **T5 : Traefik — Valider le routage HTTPS** (CA16.3)
  - [ ] T5.1 Vérifier que le routeur `forgejo` est bien dans `dynamic_conf.yml.j2` (déjà fait)
  - [ ] T5.2 Redéployer Traefik si nécessaire : `ansible-playbook -i inventory.ini playbooks/proxy.yml --vault-password-file=.vault_pass`
  - [ ] T5.3 Tester `https://git.oldevops.fr` depuis un navigateur externe
  - [ ] T5.4 Vérifier le certificat TLS (Let's Encrypt via OVH DNS)

- [ ] **T6 : Git local — Configurer le push simultané** (CA16.5)
  - [ ] T6.1 Ajouter la clé SSH publique du poste dev dans Forgejo (Settings → SSH Keys)
  - [ ] T6.2 Configurer le remote origin avec deux push URLs :
    ```bash
    git remote set-url --push origin git@github.com:HibOOps/infra-oldevops.git
    git remote set-url --add --push origin ssh://git@git.oldevops.fr:2222/admin/infra-oldevops.git
    ```
  - [ ] T6.3 Vérifier : `git remote -v` affiche les deux push URLs
  - [ ] T6.4 Tester : effectuer un commit et `git push`, vérifier que les deux repos sont à jour

- [ ] **T7 : Port SSH Forgejo — Accessibilité externe** (CA16.5)
  - [ ] T7.1 Décider de la stratégie d'exposition SSH (voir Dev Notes)
  - [ ] T7.2 Tester la connexion SSH depuis le poste dev : `ssh -p 2222 git@git.oldevops.fr`

- [ ] **T8 : Monitoring — Valider node-exporter sur .203** (CA16.7)
  - [ ] T8.1 Exécuter `ansible-playbook -i inventory.ini playbooks/monitoring.yml --vault-password-file=.vault_pass` (déploie node-exporter sur tous les LXC dont .203)
  - [ ] T8.2 Vérifier dans Prometheus : `http://prometheus.oldevops.fr` → target `192.168.1.203:9100` en `UP`
  - [ ] T8.3 Vérifier dans Grafana : host `.203` visible dans le dashboard node-exporter

---

## Dev Notes

### Architecture existante — ce qui est déjà en place

| Composant | Fichier | État |
|-----------|---------|------|
| Terraform module forgejo | `terraform/main.tf` (lignes 109-132) | Défini, **non appliqué** |
| Ansible inventory | `ansible/inventory.ini` groupe `[forgejo]` | OK |
| Ansible playbook | `ansible/playbooks/forgejo.yml` | OK |
| Ansible role tasks | `ansible/roles/forgejo/tasks/main.yml` | OK |
| Docker-compose template | `ansible/roles/forgejo/templates/docker-compose.yml.j2` | OK |
| Vars non-secrets | `ansible/roles/forgejo/vars/main.yml` | OK, corriger l'intervalle miroir |
| Vault secrets Forgejo | `ansible/vault/secrets.yml` | **MANQUANTS** — à ajouter |
| Traefik routing | `ansible/roles/traefik/templates/dynamic_conf.yml.j2` (lignes 135-143, 201-208) | Défini, Traefik à redéployer |

### LXC Forgejo — spécifications Terraform

```hcl
# terraform/main.tf
module "forgejo" {
  vmid         = 260
  hostname     = "forgejo"
  ip           = "192.168.1.203/24"
  unprivileged = false   # privilégié — Docker dans LXC
  cores        = 2
  memory       = 2048
  disk         = 20
}
```

Docker fonctionne dans des LXC **privilégiés** avec `features { nesting=true, mknod=true }` — pattern déjà utilisé sur proxy, utilities, monitoring, ci_runner.

### Secrets Vault à ajouter

Les variables suivantes doivent être ajoutées dans `ansible/vault/secrets.yml` via `ansible-vault edit vault/secrets.yml --vault-password-file=.vault_pass` :

```yaml
forgejo_admin_user: "admin"
forgejo_admin_email: "admin@oldevops.fr"
forgejo_admin_password: "<mot_de_passe_fort>"
forgejo_secret_key: "<openssl rand -hex 32>"
forgejo_internal_token: "<openssl rand -hex 32>"
```

Ces variables sont déjà référencées dans `roles/forgejo/tasks/main.yml` (création admin, création miroir) et `roles/forgejo/templates/docker-compose.yml.j2` (variables d'environnement Forgejo).

### Miroir pull vs push simultané — stratégie retenue

**Côté serveur (Forgejo)** : miroir **pull** depuis GitHub toutes les **1h**.
→ Forgejo synchronise automatiquement en arrière-plan.
→ Changer `forgejo_mirror_interval` de `"24h"` à `"1h"` dans `vars/main.yml`.

**Côté client (git local)** : remote `origin` configuré avec **deux push URLs**.
→ Un seul `git push` envoie vers GitHub ET Forgejo simultanément.
→ Configuration locale uniquement, aucun changement infrastructure :

```bash
# Conserver l'URL de fetch existante (GitHub)
# Ajouter deux push URLs
git remote set-url --push origin git@github.com:HibOOps/infra-oldevops.git
git remote set-url --add --push origin ssh://git@git.oldevops.fr:2222/admin/infra-oldevops.git

# Vérification
git remote -v
# origin  git@github.com:HibOOps/infra-oldevops.git (fetch)
# origin  git@github.com:HibOOps/infra-oldevops.git (push)
# origin  ssh://git@git.oldevops.fr:2222/admin/infra-oldevops.git (push)
```

### Exposition du port SSH Forgejo (port 2222)

Forgejo expose SSH sur le port 2222 du LXC. Traefik ne gère pas nativement le TCP SSH (il faudrait un `entryPoint` TCP + router TCP). Deux options :

**Option A (recommandée pour MVP)** : Accès SSH Forgejo **uniquement depuis le réseau local** (`192.168.1.0/24`).
→ La configuration git remote utilise l'IP interne : `ssh://git@192.168.1.203:2222/admin/infra-oldevops.git`
→ Aucune config supplémentaire nécessaire.

**Option B (accès externe)** : Port-forward `2222 → 192.168.1.203:2222` sur la box/routeur.
→ Permet l'accès SSH depuis l'extérieur via `git.oldevops.fr:2222`.
→ Nécessite une règle NAT sur la box Internet (hors scope Ansible/Terraform).

**Recommandation** : utiliser l'Option A pour cette story. La configuration git remote sera :
```bash
git remote set-url --add --push origin ssh://git@192.168.1.203:2222/admin/infra-oldevops.git
```

### Commandes de déploiement

```bash
cd infra-oldevops/terraform
# 1. Provisionner le LXC
terraform plan -target=module.forgejo
terraform apply -target=module.forgejo

cd ../ansible
# 2. Déployer Forgejo
ansible-playbook -i inventory.ini playbooks/forgejo.yml --vault-password-file=.vault_pass

# 3. (Si Traefik non encore redéployé avec le routeur forgejo)
ansible-playbook -i inventory.ini playbooks/proxy.yml --vault-password-file=.vault_pass

# 4. Déployer monitoring sur le nouveau host
ansible-playbook -i inventory.ini playbooks/monitoring.yml --vault-password-file=.vault_pass
```

### Testing

- Pas de tests automatisés pour cette story (infrastructure pure)
- Validation manuelle : checklist des CA dans la section DoD
- Tests à effectuer dans l'ordre des tâches T1 → T8

---

## Change Log

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-03-30 | 1.0 | Création initiale | PO Sarah (claude-sonnet-4-6) |

---

## Dev Agent Record

### Agent Model Used
_À compléter lors de l'implémentation_

### Debug Log References
_À compléter lors de l'implémentation_

### Completion Notes List
_À compléter lors de l'implémentation_

### File List
_À compléter lors de l'implémentation_

---

## QA Results
_À compléter lors de la revue QA_

---

**Créé le** : 2026-03-30
**Dernière mise à jour** : 2026-03-30
