# Security Dashboards & Alertes Grafana

**Story** : 1.18
**Dépendances** : Story 1.9 (Loki), Story 1.10 (Dashboards Grafana), Story 1.17 (Auditd)

---

## Dashboards de sécurité

Les 3 dashboards sont provisionnés via Ansible dans `/opt/grafana/dashboards/` et accessibles sur `https://grafana.oldevops.fr`.

### 1. Security — Authentification & Accès (`security-auth`)

**URL** : `https://grafana.oldevops.fr/d/security-auth`

| Panneau | Description | Query LogQL |
|---------|-------------|-------------|
| Tentatives SSH échouées | Courbe par host sur 24h | `{job=~"syslog\|auditd"} \|~ "Failed password\|Invalid user"` |
| Logins SSH réussis | Flux de logs | `{job=~"syslog\|auditd"} \|~ "Accepted publickey\|Accepted password"` |
| Connexions sudo | Événements auditd privilege_escalation | `{job="auditd"} \|= "privilege_escalation"` |
| Volume échecs par host | Bar chart agrégé sur période | `sum by (host) (count_over_time({...} [$__range]))` |

### 2. Security — Modifications Système (`security-changes`)

**URL** : `https://grafana.oldevops.fr/d/security-changes`

| Panneau | Description | Query LogQL |
|---------|-------------|-------------|
| Modifications fichiers sensibles | Logs auditd key=identity ou sudoers | `{job="auditd"} \|~ "key=\"identity\"\|key=\"sudoers\""` |
| Redémarrages Docker | Événements container start/stop/die | `{job="docker"} \|~ "container start\|container stop\|container die"` |
| Timeline modifications | Courbe 24h des events sensibles | `sum by (host) (count_over_time({job="auditd"} \|~ "..." [5m]))` |
| Modifications SSH config | Logs auditd key=sshd_config | `{job="auditd"} \|= "sshd_config"` |

### 3. Security — Vue Synthèse (`security-overview`)

**URL** : `https://grafana.oldevops.fr/d/security-overview`

| Métrique | Seuil alerte | Description |
|----------|-------------|-------------|
| Tentatives SSH échouées / 24h | >10 → rouge | Count total sur 24h |
| Connexions sudo / 24h | >5 → orange | Count sudo events auditd |
| Modifications fichiers sensibles | >0 → rouge | identity + sudoers + sshd_config |
| Containers auditd actifs | <4 → orange | Nombre de hosts avec logs auditd récents |

---

## Alertes configurées

Les alertes sont provisionnées dans `/opt/grafana/provisioning/alerting/security-alerts.yaml`.

| Alerte | Condition | Sévérité | Délai |
|--------|-----------|----------|-------|
| `SecurityBruteForce` | >10 failed SSH en 10 min sur un host | 🔴 Critical | Immédiat |
| `SecurityPrivEsc` | Au moins 1 sudo event en 5 min | 🟡 Warning | Immédiat |
| `SecuritySensitiveFileChange` | Modification identity/sudoers en 5 min | 🔴 Critical | Immédiat |
| `SecurityAuditdDown` | <1 log auditd depuis 30 min sur un host | 🟡 Warning | 30 min |

**Canal de notification** : ntfy.sh webhook → `https://ntfy.sh/homelab-oldevops` (push notification mobile via l'app ntfy)

---

## Queries LogQL de référence

### Investiguer un brute force SSH

```logql
# Voir toutes les tentatives échouées sur un host spécifique
{job=~"syslog|auditd", host="192.168.1.200"} |~ "Failed password|Invalid user"

# Compter par IP source (extraire avec regexp)
{job=~"syslog|auditd"} |~ "Failed password" | regexp "from (?P<src_ip>[0-9.]+)" | sum by (src_ip) (count_over_time([1h]))
```

### Investiguer une escalade de privilèges

```logql
# Tous les events sudo/su auditd
{job="auditd"} |= "privilege_escalation"

# Filtrer par host
{job="auditd", host="192.168.1.201"} |= "privilege_escalation"
```

### Vérifier les modifications de fichiers sensibles

```logql
# Tous les events identity (passwd, shadow, group)
{job="auditd"} |= "key=\"identity\""

# Events sudoers
{job="auditd"} |= "key=\"sudoers\""

# SSH config modifiée
{job="auditd"} |= "key=\"sshd_config\""
```

### Vérifier la santé auditd

```logql
# Logs auditd récents par host
count by (host) (count_over_time({job="auditd"} [30m]))

# Absence de logs (host silencieux depuis 30 min)
# → Comparer avec la liste attendue : .200, .201, .202, .210
```

---

## Procédure d'investigation — Brute Force SSH

1. **Alerte reçue** : Email `SecurityBruteForce` avec host cible
2. **Ouvrir** dashboard `Security — Authentification & Accès`
3. **Identifier** le host concerné dans le panneau "Tentatives SSH échouées"
4. **Extraire les IPs sources** avec la query LogQL ci-dessus
5. **Bloquer l'IP** si nécessaire : `ufw deny from <src_ip>` sur le host cible
6. **Vérifier** qu'aucun login réussi n'a eu lieu depuis l'IP suspecte (panneau "Logins SSH réussis")
7. **Documenter** l'incident dans un ticket

---

## Déploiement

```bash
cd ansible
# Redéployer Grafana avec les nouveaux dashboards et alertes
ansible-playbook -i inventory.ini playbooks/monitoring.yml --limit monitoring --vault-password-file=.vault_pass
```

**Idempotence** : rejouer le playbook ne recrée pas les dashboards/alertes en double — les fichiers sont copiés (idempotent via `copy` module).

---

**Créé le** : 2026-03-31
**Story** : 1.18
