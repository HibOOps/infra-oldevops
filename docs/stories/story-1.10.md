# Story 1.10 : Monitoring Avancé - Dashboards Grafana Versionnés

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P2 (Moyenne)
**Points d'effort** : 5
**Dépendances** : Story 1.9 (Loki déployé)

---

## User Story

**En tant que** Ingénieur SRE,
**Je veux** des dashboards Grafana préconfigurés et versionnés dans Git,
**Afin de** démontrer une stack d'observabilité professionnelle et reproductible.

## Critères d'Acceptation

### CA10.1 : Dashboards Exportés et Versionnés
- Dashboards exportés en JSON
- Stockés dans `ansible/roles/grafana/files/dashboards/`
- Versionnés dans Git
- Au moins 3 dashboards créés

### CA10.2 : Dashboard Infrastructure
- Nom : "Vue d'ensemble Infrastructure"
- Panneaux :
  - CPU usage par container (timeseries)
  - RAM usage par container (gauge + timeseries)
  - Disk usage (bar chart)
  - Network traffic (timeseries)
  - Uptime des services (stat)
  - Alertes actives (table)
- Datasource : Prometheus

### CA10.3 : Dashboard Application
- Nom : "Monitoring Application"
- Panneaux :
  - API response time (p50, p95, p99)
  - HTTP error rate (%)
  - Throughput (requests/sec)
  - Active connections
  - Métriques métier (ex: nombre d'objets créés)
- Datasource : Prometheus

### CA10.4 : Dashboard Logs Explorer
- Nom : "Logs Explorer"
- Panneaux :
  - Log stream par service
  - Filtres par level (error/warn/info)
  - Log volume (timeseries)
  - Recherche de logs
  - Top errors (table)
- Datasource : Loki

### CA10.5 : Provisioning Automatique
- Rôle Ansible `grafana` provisionne automatiquement les dashboards
- Méthode : File provisioning (`/etc/grafana/provisioning/dashboards/`)
- Dashboards chargés au démarrage de Grafana
- Pas de configuration manuelle requise

### CA10.6 : Variables de Dashboard
- Variables Grafana pour sélection dynamique :
  - `$host` : Sélection du container
  - `$service` : Sélection du service Docker
  - `$interval` : Intervalle de temps
- Refresh automatique (30s ou 1min)

## Vérifications d'Intégration

### VI1 : Dashboards Existants Préservés
- Dashboards manuels existants ne sont pas écrasés
- Backup des dashboards existants avant provisioning

### VI2 : Datasources Correctement Référencées
- Prometheus et Loki datasources accessibles
- Pas d'erreurs de connexion dans les panneaux

### VI3 : Performance
- Dashboards se chargent en <3 secondes
- Queries optimisées (pas de timeout)
- Pas de surcharge sur Prometheus/Loki

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] 3 dashboards créés et provisionnés
- [ ] Dashboards accessibles dans Grafana
- [ ] Métriques et logs affichés correctement
- [ ] Dashboards versionnés dans Git

---

**Créé le** : 2026-01-07
