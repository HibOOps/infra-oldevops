# Story 1.19 : Sécurité — Conversion LXC Unprivileged (.200 et .201)

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Done
**Priorité** : P2 (Moyenne - Sécurité)
**Points d'effort** : 5
**Dépendances** : Story 1.4 (Terraform LXC), Story 1.5 (Ansible provisioning), Story 1.7 (Traefik), Story 1.3 (Pipeline CI/CD)

---

## Contexte Produit

Le plan de remédiation sécurité (MT-001 / CRIT-001) identifie les containers **privileged** comme le principal vecteur d'escalade vers l'hôte Proxmox. En mode privileged, un `uid 0` dans le LXC = `uid 0` (root) sur l'hôte Proxmox — une faille dans n'importe quel service permet la compromission totale.

En mode **unprivileged**, le `uid 0` dans le LXC est mappé à `uid 100000` sur l'hôte → escape = utilisateur sans droits → CRIT-001 quasi éliminé.

### Décision de périmètre (analyse risque/bénéfice)

| Container | Conversion | Justification |
|-----------|-----------|---------------|
| `.200` Traefik | ✅ **Cette story** | Traefik n'a pas besoin de privilèges kernel, Docker fonctionne en unprivileged avec subuid |
| `.201` Utilities | ✅ **Cette story** | Vaultwarden/Snipe-IT/NetBox = webapps Docker standards, pas de device access |
| `.202` Monitoring | ⏸️ **Déferrée** | node-exporter `pid: host` et cadvisor nécessitent tests dédiés |
| `.210` CI Runner | ❌ **Non recommandé** | Docker builds en CI nécessitent des namespaces kernel — risque de casser le pipeline |
| `.250` App Demo | ✅ **Déjà unprivileged** | Déjà en place depuis Story 1.4 |

### Approche IaC (Terraform recreate)

Puisque toute l'infra est définie en Terraform et reprovisionnée via Ansible, la méthode la plus propre est :
1. **Modifier Terraform** : `unprivileged = true` sur les containers .200 et .201
2. **`terraform apply`** : Proxmox recrée les containers (destroy + create)
3. **Ansible redéploie** tout automatiquement

Cette approche évite la complexité de la migration `uidmapshift` sur un container existant.

---

## User Story

**En tant que** DevOps Engineer,
**Je veux** que les containers .200 (Traefik) et .201 (Utilities) s'exécutent en mode LXC unprivileged,
**Afin de** réduire drastiquement le risque d'escalade vers l'hôte Proxmox en cas de compromission d'un service.

---

## Critères d'Acceptation

### CA19.1 : Terraform — Modification unprivileged

- Dans `terraform/main.tf` (ou le module LXC correspondant), le paramètre `unprivileged` est passé à `true` pour les containers 200 et 201 :
  ```hcl
  resource "proxmox_lxc" "proxy" {
    # ...
    unprivileged = true
    features {
      nesting = true   # requis pour Docker-in-LXC
      # mknod = false  # non nécessaire en unprivileged pour ces workloads
    }
  }

  resource "proxmox_lxc" "utilities" {
    # ...
    unprivileged = true
    features {
      nesting = true
    }
  }
  ```
- Le container .250 (app_demo) est déjà `unprivileged = true` — vérifier et documenter

### CA19.2 : Proxmox host — subuid/subgid

- Vérifier que le mapping existe sur l'hôte Proxmox (`192.168.1.50`) :
  ```bash
  grep "root" /etc/subuid  # doit contenir root:100000:65536
  grep "root" /etc/subgid  # doit contenir root:100000:65536
  ```
- Si absent, le créer via Ansible sur l'hôte Proxmox (playbook dédié ou task one-shot)
- Proxmox gère automatiquement les idmaps dans `/etc/pve/lxc/200.conf` lors de la création via l'API

### CA19.3 : Recréation des containers via Terraform

- Procédure :
  ```bash
  cd infra-oldevops/terraform
  terraform plan   # vérifier que seuls .200 et .201 sont recréés
  terraform apply  # destroy + create séquentiellement (pas en parallèle)
  ```
- **Ordre d'application** : d'abord .201 (utilities), puis .200 (Traefik) pour minimiser l'impact sur le routing externe
- Snapshot Proxmox pris avant l'opération (CA19.5)

### CA19.4 : Redéploiement Ansible

Après recréation des containers :
```bash
cd infra-oldevops/ansible
# Provisioning de base
ansible-playbook -i inventory.ini playbooks/common.yml --vault-password-file=.vault_pass
# Déploiement des services
ansible-playbook -i inventory.ini playbooks/utilities.yml --vault-password-file=.vault_pass
ansible-playbook -i inventory.ini playbooks/proxy.yml --vault-password-file=.vault_pass
```

- Vérifier que Docker fonctionne dans les containers unprivileged :
  ```bash
  ssh root@192.168.1.200 "docker run --rm hello-world"
  ssh root@192.168.1.201 "docker run --rm hello-world"
  ```
- Vérifier que les services sont fonctionnels post-redéploiement (CA19.6)

### CA19.5 : Snapshots pré-opération

- Snapshot Proxmox pris sur .200 et .201 avant toute modification
- Nommage : `pre-unprivileged-migration-YYYYMMDD`
- **Plan de rollback** documenté :
  ```bash
  # Si .200 ne redémarre pas correctement après conversion :
  pct rollback 200 pre-unprivileged-migration-YYYYMMDD
  # Remettre unprivileged = false dans Terraform
  terraform apply
  ```

### CA19.6 : Validation fonctionnelle post-migration

- **Traefik (.200)** :
  - `https://demo.oldevops.fr` accessible ✅
  - `https://git.oldevops.fr` accessible ✅
  - Certificats SSL valides ✅
  - `docker ps` sur .200 liste les containers attendus ✅

- **Utilities (.201)** :
  - `https://vault.oldevops.fr` (Vaultwarden) accessible ✅
  - `https://netbox.oldevops.fr` accessible ✅
  - `docker ps` sur .201 liste les containers attendus ✅

### CA19.7 : Vérification mode unprivileged

Sur chaque container converti, vérifier :
```bash
# Depuis l'hôte Proxmox :
cat /etc/pve/lxc/200.conf | grep -E "unprivileged|idmap"
# Attendu :
# unprivileged: 1
# lxc.idmap: u 0 100000 65536
# lxc.idmap: g 0 100000 65536

# Depuis le container, vérifier que uid 0 = non-root côté hôte :
# (test de sécurité conceptuel - pas à exécuter en prod)
```

### CA19.8 : Mise à jour documentation

- `docs/security/security-remediation-plan-2026-02-14.md` : MT-001 marqué ✅ RESOLVED (partiel — .200 + .201)
- `docs/architecture/brownfield-architecture-overview.md` : mise à jour des specs containers (.200, .201 → unprivileged)
- Note sur .202 (déferrée) et .210 (exception documentée)

---

## Vérifications d'Intégration

### VI1 : Pipeline CI/CD non impacté
- Déclencher un run GitHub Actions après migration → vérifier que le déploiement sur .200/.201 fonctionne
- Le runner (.210) reste privileged et n'est pas affecté

### VI2 : Monitoring non impacté
- Prometheus scrape toujours les targets .200 et .201 (node-exporter)
- Loki collecte toujours les logs Docker des containers sur .200 et .201

### VI3 : DNS et SSL
- Les enregistrements DNS ne changent pas (IPs statiques)
- Les certificats Let's Encrypt ne sont pas invalidés par la recréation des containers (Traefik les stocke dans un volume persistant — vérifier que le volume est recréé correctement ou que le ACME challenge refonctionne)

---

## Définition of Done

- [ ] `unprivileged = true` dans Terraform pour .200 et .201
- [ ] subuid/subgid présents sur l'hôte Proxmox
- [ ] Snapshots pris avant migration
- [ ] `terraform apply` exécuté avec succès
- [ ] Ansible redéploiement complet de .200 et .201
- [ ] Docker fonctionne sur les 2 containers post-migration (`hello-world`)
- [ ] Tous les services .200 et .201 fonctionnels (CA19.6)
- [ ] `/etc/pve/lxc/200.conf` et `201.conf` contiennent `unprivileged: 1` + idmaps
- [ ] Documentation mise à jour
- [ ] Pipeline CI/CD toujours fonctionnel post-migration

---

## Notes pour le Dev Agent

### Fichiers à modifier

- `terraform/main.tf` — `unprivileged = true` sur proxmox_lxc proxy et utilities
- `docs/security/security-remediation-plan-2026-02-14.md` — MT-001 ✅ RESOLVED (partiel)
- `docs/architecture/brownfield-architecture-overview.md` — specs containers

### Pourquoi pas `lxc.cap.drop` dans la config ?

Les containers Proxmox créés via l'API (Terraform provider `bpg/proxmox`) ne génèrent pas de ligne `lxc.cap.drop` dans `/etc/pve/lxc/NNN.conf`. La conversion privileged → unprivileged se fait uniquement via :
1. `unprivileged: 1` dans la config Proxmox (géré par Terraform)
2. Les lignes idmap (`lxc.idmap`) ajoutées automatiquement par Proxmox

### Attention volume Docker sur .200 (Traefik ACME)

Traefik stocke les certificats Let's Encrypt dans un volume Docker (`acme.json`). Lors de la recréation du container, ce volume est perdu. Deux options :
1. **Accepter** : Traefik refait le challenge ACME automatiquement au démarrage (quelques minutes de downtime SSL)
2. **Backup** : Avant `terraform apply`, copier `acme.json` hors du container et le restaurer via Ansible

Option 1 recommandée pour un homelab (plus simple, Let's Encrypt rate limit = 5 certs/semaine par domaine).

### Exception .210 (CI Runner) — à documenter

Le container .210 reste privileged. Raison : les GitHub Actions workflows font du `docker build` qui nécessite `user namespaces` et potentiellement `--privileged`. Convertir en unprivileged nécessiterait **rootless Docker** (setup complexe, non supporté nativement par le runner). Exception formellement acceptée dans le plan de remédiation.

---

## Dev Agent Record

### Agent Model Used
_À compléter lors de l'implémentation_

### File List
_À compléter lors de l'implémentation_

---

**Créé le** : 2026-03-31
**Dernière mise à jour** : 2026-03-31
