# Story 1.17 : Sécurité — Déploiement Auditd sur tous les containers LXC

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Done
**Priorité** : P2 (Moyenne - Sécurité)
**Points d'effort** : 5
**Dépendances** : Story 1.9 (Loki + Promtail opérationnels), Story 1.3 (Pipeline déploiement)

---

## Contexte Produit

Le plan de remédiation sécurité (ST-002) identifie l'absence d'**auditd** comme un gap critique : aucun événement système (escalade de privilèges, accès fichiers sensibles, connexions réseau inhabituelles) n'est actuellement tracé. Loki collecte déjà les logs applicatifs, mais les événements kernel/système ne sont pas capturés.

Cette story déploie `auditd` sur tous les containers LXC (`all:!proxmox`) via un rôle Ansible dédié, configure les règles d'audit pertinentes, et raccorde la collecte à Promtail pour centralisation dans Loki.

---

## User Story

**En tant que** DevOps Engineer responsable de la sécurité,
**Je veux** que tous les events système critiques (sudo, su, connexions SSH, accès `/etc/passwd`, escalade de privilèges) soient audités et centralisés dans Loki,
**Afin de** pouvoir détecter et investiguer tout incident de sécurité.

---

## Critères d'Acceptation

### CA17.1 : Rôle Ansible `auditd`

- Rôle créé dans `ansible/roles/auditd/`
- Structure :
  ```
  roles/auditd/
  ├── tasks/main.yml
  ├── templates/audit.rules.j2
  └── handlers/main.yml
  ```
- `tasks/main.yml` :
  - Installe `auditd` via apt
  - Déploie `audit.rules.j2`
  - S'assure que le service est `enabled` + `started`
  - Notifie le handler de restart si les règles changent
- Ajouté au playbook `hardening.yml` (ou nouveau playbook `security.yml`) avec `hosts: all:!proxmox`

### CA17.2 : Règles d'audit minimales

Le fichier `audit.rules.j2` contient au minimum :
```
# Effacer les règles existantes
-D
# Buffer size
-b 8192
# Failure mode : log (2 = kernel panic si buffer plein, 1 = log)
-f 1

# Escalade de privilèges
-a always,exit -F arch=b64 -S execve -F euid=0 -F auid!=0 -k privilege_escalation
-w /bin/su -p x -k privilege_escalation
-w /usr/bin/sudo -p x -k privilege_escalation

# Modifications de fichiers sensibles
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/sudoers -p wa -k sudoers
-w /etc/ssh/sshd_config -p wa -k sshd_config

# Connexions réseau sortantes inhabituelles
-a always,exit -F arch=b64 -S connect -k outbound_connections

# Chargement de modules kernel
-w /sbin/insmod -p x -k module_insertion
-w /sbin/modprobe -p x -k module_insertion

# Accès aux logs d'audit eux-mêmes
-w /var/log/audit/ -p wa -k audit_log_access
```

### CA17.3 : Collecte Promtail → Loki

- Mise à jour du template `ansible/roles/promtail/templates/promtail-config.yml.j2` :
  - Ajout d'un job `auditd` scrappant `/var/log/audit/audit.log`
  - Labels : `job="auditd"`, `host="{{ inventory_hostname }}"`, `env="homelab"`
- Redéploiement Promtail via Ansible sur tous les containers
- Vérification : les logs auditd apparaissent dans Grafana Explore avec la query `{job="auditd"}`

### CA17.4 : Tests de validation

- Exécuter `sudo ls /root` sur un container → vérifier que l'événement apparaît dans Loki avec label `key="privilege_escalation"`
- Modifier `/etc/passwd` (test non destructif : `touch /etc/passwd`) → vérifier event `key="identity"`
- Tester que `auditctl -l` retourne les règles attendues sur chaque container

### CA17.5 : Documentation

- Fichier `docs/security/auditd-rules.md` documentant :
  - Les règles en place et leur justification
  - Comment interroger les logs auditd dans Loki (exemples de queries LogQL)
  - Comment ajouter une nouvelle règle

---

## Vérifications d'Intégration

### VI1 : Services non impactés
- Les services existants (Traefik, Docker, GitHub Runner) continuent de fonctionner après déploiement
- Pas de spike CPU/mémoire dû à l'auditd (vérifier avec `top` post-déploiement)

### VI2 : Promtail existant non cassé
- Les jobs Promtail existants (Docker logs, system logs) continuent de fonctionner
- Pas de duplication de logs

### VI3 : Idempotence
- Le playbook est idempotent : plusieurs exécutions successives ne produisent pas de changements

---

## Définition of Done

- [ ] Rôle `auditd` créé et inclus dans playbook
- [ ] `auditd` déployé sur .200, .201, .202, .210, .250
- [ ] Règles audit validées (`auditctl -l`) sur chaque container
- [ ] Logs auditd visibles dans Loki (`{job="auditd"}`)
- [ ] Tests CA17.4 passants
- [ ] Documentation `auditd-rules.md` créée
- [ ] Playbook idempotent vérifié

---

## Notes pour le Dev Agent

### Fichiers à créer/modifier

- `ansible/roles/auditd/tasks/main.yml` — **à créer**
- `ansible/roles/auditd/templates/audit.rules.j2` — **à créer**
- `ansible/roles/auditd/handlers/main.yml` — **à créer**
- `ansible/roles/promtail/templates/promtail-config.yml.j2` — **à modifier** (ajout job auditd)
- `ansible/playbooks/hardening.yml` ou `ansible/playbooks/security.yml` — **à modifier** (ajout rôle)
- `docs/security/auditd-rules.md` — **à créer**

### Contrainte LXC

Dans les containers LXC privileged, `auditd` fonctionne normalement. Dans les containers **unprivileged** (comme .250), auditd ne peut pas charger de règles au niveau kernel — dans ce cas, le déploiement doit être conditionnel :
```yaml
# tasks/main.yml
- name: Deploy auditd
  when: not (ansible_virtualization_type == 'lxc' and not privileged_container)
```
Pour .250 (unprivileged), logger uniquement les logs auth via Promtail est suffisant.

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- `lxc_unprivileged=true` ajouté dans inventory.ini pour .250 — condition `when: not (lxc_unprivileged | default(false))` dans tasks/main.yml pour skip les règles kernel
- Promtail pipeline_stages extrait `audit_type` et `key` via regex pour permettre les filtres Loki par key
- `auditd` restart handler utilise `service` module (pas `systemctl` direct) pour compatibilité

### File List
- `ansible/roles/auditd/tasks/main.yml` — Créé
- `ansible/roles/auditd/templates/audit.rules.j2` — Créé
- `ansible/roles/auditd/handlers/main.yml` — Créé
- `ansible/roles/promtail/templates/promtail-config.yml.j2` — Modifié : ajout job auditd
- `ansible/playbooks/hardening.yml` — Modifié : ajout rôle auditd
- `ansible/inventory.ini` — Modifié : `lxc_unprivileged=true` sur .250
- `docs/security/auditd-rules.md` — Créé

---

**Créé le** : 2026-03-31
**Dernière mise à jour** : 2026-03-31
