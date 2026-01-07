# Story 1.7 : Application de Démonstration - Intégration Traefik

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P1 (Haute)
**Points d'effort** : 5
**Dépendances** : Story 1.6 (Application développée)

---

## User Story

**En tant que** Ingénieur Plateforme,
**Je veux** exposer l'application via Traefik avec SSL automatique,
**Afin qu'**elle soit accessible publiquement de manière sécurisée comme les autres services.

## Critères d'Acceptation

### CA7.1 : Labels Docker Compose Traefik
- Labels Traefik ajoutés dans `docker-compose.yml` :
  - Frontend : `app.oldevops.fr`
  - Backend : `api.oldevops.fr`
- Réseau Traefik partagé configuré
- Services correctement étiquetés pour discovery

### CA7.2 : Certificats Let's Encrypt
- Traefik génère automatiquement les certificats SSL
- Méthode DNS-01 via OVH (existante)
- Certificats valides pour `app.oldevops.fr` et `api.oldevops.fr`
- Renouvellement automatique configuré

### CA7.3 : Routage Traefik
- `app.oldevops.fr/*` → frontend (port 3000)
- `api.oldevops.fr/*` → backend (port 5000)
- Routage basé sur hostname (Host rule)
- Load balancing si plusieurs instances (optionnel)

### CA7.4 : Middlewares Traefik
- Redirection HTTP → HTTPS automatique
- Headers de sécurité appliqués :
  - HSTS (Strict-Transport-Security)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
- Rate limiting (optionnel) : 1000 req/min par IP

### CA7.5 : Configuration DNS OVH
- A records ajoutés dans la zone DNS OVH :
  - `app.oldevops.fr` → 192.168.1.200
  - `api.oldevops.fr` → 192.168.1.200
- TTL approprié (300 ou 600 secondes)
- Propagation DNS vérifiée

### CA7.6 : Health Checks Traefik
- Health check configuré pour backend : `/health` ou `/api/health`
- Traefik ne route que vers services healthy
- Retry automatique en cas d'échec

## Vérifications d'Intégration

### VI1 : Services Existants Préservés
- Les 8 services existants restent accessibles
- Aucune interruption lors de l'ajout des nouveaux domaines

### VI2 : Gestion Certificats SSL
- Traefik continue de gérer tous les certificats
- Aucun conflit avec les certificats existants

### VI3 : Dashboard Traefik
- Les nouveaux services apparaissent dans le dashboard Traefik
- Routeurs et services correctement configurés

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] `https://app.oldevops.fr` accessible et sécurisé
- [ ] `https://api.oldevops.fr` accessible et sécurisé
- [ ] Certificats SSL valides
- [ ] Tests manuels réussis

---

**Créé le** : 2026-01-07
