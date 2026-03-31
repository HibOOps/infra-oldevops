# Auditd — Règles et Collecte Loki

**Story** : 1.17
**Déployé sur** : .200, .201, .202, .210 (privileged LXC)
**Exclu** : .250 app_demo (unprivileged LXC — règles kernel non supportées)

---

## Règles en place

| Règle | Fichier surveillé / Syscall | Key | Justification |
|-------|-----------------------------|-----|---------------|
| Escalade de privilèges | `execve` euid=0 + auid!=0 | `privilege_escalation` | Détecte toute exécution sous root par un user non-root |
| sudo | `/usr/bin/sudo` exec | `privilege_escalation` | Chaque invocation sudo |
| su | `/bin/su` exec | `privilege_escalation` | Changement d'identité |
| `/etc/passwd` | write/attr | `identity` | Modification des comptes |
| `/etc/shadow` | write/attr | `identity` | Modification des mots de passe |
| `/etc/group` | write/attr | `identity` | Modification des groupes |
| `/etc/sudoers` | write/attr | `sudoers` | Modification des privilèges sudo |
| `/etc/ssh/sshd_config` | write/attr | `sshd_config` | Modification config SSH |
| Connexions réseau | `connect` syscall | `outbound_connections` | Connexions sortantes inhabituelles |
| Modules kernel | `/sbin/insmod`, `/sbin/modprobe` exec | `module_insertion` | Chargement de modules suspects |
| Logs audit | `/var/log/audit/` write/attr | `audit_log_access` | Tentative de modification/suppression des logs |

---

## Queries LogQL de référence

### Tous les events auditd d'un host
```logql
{job="auditd", host="192.168.1.200"}
```

### Escalades de privilèges (toute l'infra)
```logql
{job="auditd"} |= `key="privilege_escalation"`
```

### Modifications de fichiers d'identité
```logql
{job="auditd"} | key=`identity`
```

### Events sudo sur les 24 dernières heures
```logql
{job="auditd"} |= `key="privilege_escalation"` |= `sudo` | json
```

### Connexions réseau sortantes suspectes
```logql
{job="auditd"} | key=`outbound_connections`
```

### Tentatives de modification des logs d'audit (signe d'attaque)
```logql
{job="auditd"} | key=`audit_log_access`
```

---

## Vérification des règles actives

```bash
# Sur n'importe quel container privileged :
ssh root@192.168.1.200 "auditctl -l"

# Vérifier le statut du service :
ssh root@192.168.1.200 "systemctl status auditd"

# Consulter les logs locaux :
ssh root@192.168.1.200 "tail -f /var/log/audit/audit.log"
```

---

## Ajouter une nouvelle règle

1. Éditer `ansible/roles/auditd/templates/audit.rules.j2`
2. Ajouter la règle avec un key explicite :
   ```
   -w /chemin/fichier -p wa -k mon_key
   # ou pour un syscall :
   -a always,exit -F arch=b64 -S syscall_name -k mon_key
   ```
3. Redéployer :
   ```bash
   cd ansible
   ansible-playbook -i inventory.ini playbooks/hardening.yml --vault-password-file=.vault_pass
   ```
4. Si la Story 1.18 est déployée, penser à ajouter une alerte Grafana correspondante.

---

## Limitation containers unprivileged (.250)

Le container `.250` (app_demo) tourne en mode **LXC unprivileged** — auditd est installé mais ne peut pas charger de règles au niveau kernel (accès aux syscalls audit restreint). La sécurité sur .250 repose sur :
- Collecte des logs `/var/log/auth.log` via le job `syslog` Promtail (déjà en place)
- Isolation LXC unprivileged (UID remapping — root dans le container = uid 100000 sur l'hôte)
