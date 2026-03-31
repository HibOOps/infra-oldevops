# ADR-005 : Loki au lieu de la stack ELK

**Statut** : Accepté
**Date** : 2026-01-07
**Auteur** : Équipe DevOps

---

## Contexte

L'observabilité nécessite une solution de centralisation des logs pour les 5 containers LXC. Le container monitoring (192.168.1.202) héberge déjà Prometheus + Grafana + + Uptime Kuma (4 GB RAM alloués). Une solution de logging doit s'intégrer avec l'existant sans ajouter une charge significative.

## Décision

Utiliser **Loki** pour l'agrégation des logs avec **Promtail** comme agent de collecte sur chaque container.

## Justification

| Critère | Loki | ELK Stack | Graylog |
|---------|------|-----------|---------|
| RAM requise | ~256 MB | 2-4 GB | ~512 MB |
| Intégration Grafana | ✅ Native | ❌ Kibana séparé | 🟡 Plugin |
| Query language | LogQL (≈PromQL) | Lucene/KQL | GROK |
| Full-text search | 🟡 Labels only | ✅ | ✅ |
| Setup Ansible | ✅ Simple | ❌ Complexe | 🟡 |

**Raisons principales** :
- **Poids** : Loki + Promtail ~256 MB vs ELK minimum 2 GB — le container monitoring ne peut pas absorber ELK
- **Cohérence** : Grafana est déjà l'interface de visualisation — une datasource Loki en plus, pas un nouvel outil (Kibana)
- **LogQL** : syntaxe similaire à PromQL, courbe d'apprentissage quasi nulle pour qui connaît Prometheus
- **Labelling** : pour ce use case (debugging, monitoring), les requêtes par labels `{host="app-demo", level="error"}` sont suffisantes

**Alternatives considérées** :
- **ELK (Elasticsearch + Logstash + Kibana)** : trop lourd (4+ GB RAM), complexité opérationnelle élevée
- **Graylog** : moins d'intégration native Grafana, GRIB patterns verbeux
- **Fluentd + Elasticsearch** : toujours le problème Elasticsearch (RAM)

## Conséquences

✅ Overhead mémoire minimal (~256 MB supplémentaires)
✅ Observabilité unifiée métriques + logs dans Grafana
✅ LogQL cohérent avec PromQL (même paradigme labelling)
⚠️ Pas de full-text search (Loki indexe les labels, pas le contenu) — acceptable pour ce use case
⚠️ Retention limitée (7 jours) par contrainte stockage

## Implémentation

```yaml
# ansible/roles/promtail/tasks/main.yml
# Déployé sur proxy, utilities, monitoring, app-demo
- name: Deploy Promtail
  community.docker.docker_compose_v2:
    project_src: /opt/promtail

# Requête LogQL exemple
# {host="app-demo", container="pricesync-backend"} |= "error"
```
