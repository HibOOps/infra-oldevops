# Story 1.18 : Sécurité — Dashboards Grafana & Alertes de Sécurité

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Done
**Priorité** : P2 (Moyenne - Sécurité)
**Points d'effort** : 5
**Dépendances** : Story 1.10 (Dashboards Grafana versionnés), Story 1.17 (Auditd + logs centralisés)

---

## Contexte Produit

Le plan de remédiation sécurité (ST-003 + ST-004) prévoit la création de **dashboards Grafana dédiés à la sécurité** et la configuration d'**alertes automatiques** sur les événements critiques. Loki collecte déjà les logs applicatifs et système (et collectera les logs auditd via Story 1.17). Il manque la couche de **visualisation et détection**.

Cette story crée 3 dashboards de sécurité provisionnés via Ansible (IaC, versionnés en JSON) et configure les alertes Grafana/Alertmanager pour notifier sur les événements suspects.

---

## User Story

**En tant que** DevOps Engineer,
**Je veux** des dashboards de sécurité et des alertes automatiques dans Grafana,
**Afin de** détecter en moins d'1 heure tout événement de sécurité critique sur l'infrastructure.

---

## Critères d'Acceptation

### CA18.1 : Dashboard 1 — Authentification & Accès

Dashboard `security-auth.json` provisonné dans Grafana :

- **Panneau 1 : Tentatives de login SSH** — `{job=~"syslog|auditd"} |= "Failed password" or "Invalid user"` — courbe sur 24h par host
- **Panneau 2 : Logins SSH réussis** — `{job=~"syslog|auditd"} |= "Accepted publickey" or "Accepted password"` — table host/user/IP/heure
- **Panneau 3 : Connexions sudo** — `{job="auditd"} |= "key=\"privilege_escalation\""` — table par host
- **Panneau 4 : Top IPs en échec** — agrégation des IP sources sur tentatives échouées — bar chart top 10
- Période par défaut : dernières 24h

### CA18.2 : Dashboard 2 — Modifications Système

Dashboard `security-changes.json` provisionné dans Grafana :

- **Panneau 1 : Modifications fichiers sensibles** — `{job="auditd"} |= "key=\"identity\""` ou `key="sudoers"` — timeline par host/fichier
- **Panneau 2 : Déploiements Ansible** — `{job=~"syslog"} |= "ansible"` — timeline des runs
- **Panneau 3 : Redémarrages de services Docker** — `{job="docker"} |= "container start" or "container stop"` — table
- **Panneau 4 : Modifications SSH config** — `{job="auditd"} |= "key=\"sshd_config\""` — log panel

### CA18.3 : Dashboard 3 — Vue Synthèse Sécurité

Dashboard `security-overview.json` provisionné dans Grafana :

- **Stat : Tentatives SSH échouées / 24h** (valeur + couleur rouge si >10)
- **Stat : Connexions sudo / 24h** (valeur + couleur orange si >5)
- **Stat : Modifications fichiers sensibles / 24h** (valeur + couleur rouge si >0)
- **Stat : Containers avec auditd actif** (N/5 expected)
- **Gauge : Security score** — calculé : 100 - (failed_ssh*2 + sudo_count + sensitive_changes*10)
- Période : dernières 24h, refresh : 5 min

### CA18.4 : Alertes Grafana/Alertmanager

Règles d'alerte créées dans Grafana (provisionnées via Ansible) :

| Alerte | Condition | Sévérité | Canal |
|--------|-----------|----------|-------|
| `SecurityBruteForce` | Failed SSH > 10 en 10 min sur un même host | 🔴 Critical | email + (optionnel Slack) |
| `SecurityPrivEsc` | sudo event auditd sur tout host | 🟡 Warning | email |
| `SecuritySensitiveFileChange` | Modification `/etc/passwd`, `/etc/shadow`, `/etc/sudoers` | 🔴 Critical | email |
| `SecurityAuditdDown` | Absence de logs `{job="auditd"}` depuis >30 min sur un host | 🟡 Warning | email |

- Canal email configuré via `ansible/roles/grafana/templates/grafana.ini.j2` (SMTP)
- Les règles sont des **Grafana Managed Alerts** (pas Prometheus rules) basées sur des datasources Loki
- Les alertes sont provisionnées en YAML dans `ansible/roles/grafana/templates/alerts/`

### CA18.5 : Provisionnement Ansible (IaC)

- Les 3 dashboards JSON stockés dans `ansible/roles/grafana/templates/dashboards/security-*.json.j2`
- Provisionnés via le mécanisme existant de la Story 1.10 (`grafana_dashboards_path`)
- Les règles d'alerte provisionnées dans `ansible/roles/grafana/templates/alerts/security-alerts.yaml.j2`
- Redéploiement via `ansible-playbook playbooks/monitoring.yml --limit monitoring`

### CA18.6 : Documentation

- Fichier `docs/security/security-dashboards.md` documentant :
  - Description de chaque dashboard et son usage
  - Liste des alertes et leurs seuils
  - Queries LogQL de référence pour investigations
  - Procédure d'investigation d'un incident type (brute force SSH)

---

## Vérifications d'Intégration

### VI1 : Dashboards accessibles
- Les 3 dashboards apparaissent dans Grafana UI dans le dossier "Security"
- Les panels chargent sans erreur (même si aucun event de sécurité en cours)

### VI2 : Test alerte bout-en-bout
- Déclencher manuellement 11 tentatives SSH échouées → vérifier que l'alerte `SecurityBruteForce` se déclenche et qu'un email est reçu
- Vérification en 15 min max

### VI3 : Idempotence provisionnement
- Rejouer le playbook monitoring.yml ne recrée pas les dashboards/alertes en double

---

## Définition of Done

- [ ] 3 dashboards de sécurité créés et provisionnés
- [ ] 4 alertes configurées et testées (au moins SecurityBruteForce validée bout-en-bout)
- [ ] Email de notification reçu sur test d'alerte
- [ ] Dashboards versionnés en JSON dans le repo
- [ ] Documentation `security-dashboards.md` créée
- [ ] Déploiement via Ansible idempotent

---

## Notes pour le Dev Agent

### Fichiers à créer/modifier

- `ansible/roles/grafana/templates/dashboards/security-auth.json.j2` — **à créer**
- `ansible/roles/grafana/templates/dashboards/security-changes.json.j2` — **à créer**
- `ansible/roles/grafana/templates/dashboards/security-overview.json.j2` — **à créer**
- `ansible/roles/grafana/templates/alerts/security-alerts.yaml.j2` — **à créer**
- `ansible/roles/grafana/templates/grafana.ini.j2` — **à modifier** (SMTP si pas déjà configuré)
- `docs/security/security-dashboards.md` — **à créer**

### Dépendance Story 1.17
- Les dashboards Auth et Changes utilisent `{job="auditd"}`. Si Story 1.17 n'est pas encore déployée, les panels auditd afficheront "No data" — acceptable pour le déploiement initial.
- Les panels SSH (`{job=~"syslog"}`) fonctionnent indépendamment de Story 1.17.

### Format dashboards Grafana
- Utiliser des dashboards JSON Grafana standard (format v1)
- Datasource : référencer par name `Loki` (variable `${DS_LOKI}`)
- Se baser sur le format existant des dashboards Story 1.10

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- `[alerting].enabled` removed from grafana.ini — Grafana 12 rejects legacy alerting section (use `[unified_alerting].enabled` only)
- `policies.matchers` in alert YAML simplified — Grafana 12 strict format; removed policies section, keeping contact_points + alert rules only; default Grafana routing applies
- `provisioning/plugins` directory created to suppress Grafana startup warning
- `security-alerts.yaml.bak` skipped by Grafana (correct behavior, not an issue)
- Alerting provisioned: `finished to provision alerting` + `finished to provision dashboards` confirmed in logs
- Email SMTP configured via `grafana.ini` using OVH SMTP credentials from vault (smtp_host, smtp_username, smtp_password, smtp_from)

### File List
- `ansible/roles/grafana/files/dashboards/security-auth.json` — Créé
- `ansible/roles/grafana/files/dashboards/security-changes.json` — Créé
- `ansible/roles/grafana/files/dashboards/security-overview.json` — Créé
- `ansible/roles/grafana/files/provisioning/alerting/security-alerts.yaml` — Créé
- `ansible/roles/grafana/templates/grafana.ini.j2` — Créé (SMTP + unified_alerting)
- `ansible/roles/grafana/templates/docker-compose.yml.j2` — Modifié (volume grafana.ini)
- `ansible/roles/grafana/tasks/main.yml` — Modifié (alerting dir, plugins dir, grafana.ini deploy, 3 nouveaux dashboards, alert rules)
- `docs/security/security-dashboards.md` — Créé

---

**Créé le** : 2026-03-31
**Dernière mise à jour** : 2026-03-31
