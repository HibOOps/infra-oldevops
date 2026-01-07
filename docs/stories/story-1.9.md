# Story 1.9 : Monitoring Avancé - Loki pour Agrégation de Logs

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P2 (Moyenne)
**Points d'effort** : 5
**Dépendances** : Aucune

---

## User Story

**En tant que** Ingénieur SRE,
**Je veux** centraliser tous les logs de l'infrastructure dans Loki,
**Afin de** pouvoir troubleshooter rapidement et démontrer une observabilité professionnelle.

## Critères d'Acceptation

### CA9.1 : Rôle Ansible Loki
- Nouveau rôle `ansible/roles/loki/` créé
- Déploie Loki via Docker Compose sur container monitoring (192.168.1.202)
- Configuration Loki dans template

### CA9.2 : Configuration Loki
- Rétention des logs : 7 jours
- Storage local avec rotation automatique
- API exposée pour Grafana
- Port : 3100 (interne Docker)

### CA9.3 : Déploiement Promtail
- Rôle `ansible/roles/promtail/` créé
- Promtail déployé sur les 4 containers (200, 202, 204, 210)
- Agent léger collectant les logs

### CA9.4 : Sources de Logs Collectées
- Journal systemd de chaque container
- Logs Docker de tous les containers (`/var/lib/docker/containers/`)
- Logs applicatifs (si structurés en JSON)
- Logs système (`/var/log/`)

### CA9.5 : Labels et Enrichissement
- Labels appliqués automatiquement :
  - `host` : Nom du container (proxy, monitoring, etc.)
  - `service` : Nom du service Docker
  - `level` : Log level (info/warn/error) si extractable
- Pipeline de parsing configuré

### CA9.6 : Intégration Grafana
- Loki ajouté comme datasource dans Grafana
- Datasource configurée avec URL : `http://loki:3100`
- Connexion testée et fonctionnelle
- Explore view accessible pour requêtes LogQL

## Vérifications d'Intégration

### VI1 : Monitoring Existant Préservé
- Prometheus et Grafana continuent de fonctionner
- Pas de conflit de ports ou ressources

### VI2 : Performance
- Loki utilise <1 GB RAM
- Disk usage <10 GB avec rotation
- Pas d'impact sur les containers monitorés

### VI3 : Logs Interrogeables
- Logs visibles dans Grafana Explore
- Requête LogQL simple fonctionne : `{host="proxy"}`
- Latence des requêtes acceptable (<2 secondes)

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] Loki déployé et opérationnel
- [ ] Promtail collecte logs de tous les containers
- [ ] Logs interrogeables dans Grafana
- [ ] Documentation Loki/Promtail ajoutée

---

**Créé le** : 2026-01-07
