# ADR-002 : Traefik v3 comme reverse proxy

**Statut** : Accepté
**Date** : 2025 (infrastructure existante)
**Auteur** : Équipe Infrastructure

---

## Contexte

L'infrastructure expose plusieurs services sur `*.oldevops.fr` avec SSL automatique. Les services sont distribués sur plusieurs containers LXC (pas de Docker Swarm ou Kubernetes). Le DNS challenge DNS-01 via OVH est requis car le port 80 n'est pas fiablement accessible de l'extérieur.

## Décision

Utiliser **Traefik v3** avec **file provider** pour le routage inter-LXC.

## Justification

- **SSL automatique** : intégration ACME native, renouvellement automatique 30j avant expiry
- **OVH DNS-01** : provider OVH intégré — certificat wildcard `*.oldevops.fr` sans exposer le port 80
- **File provider** : permet de router vers des services sur d'autres LXC sans accès au socket Docker
- **Dashboard** : visibilité sur les routeurs/services actifs
- **Middlewares** : rate limiting, security headers, redirections HTTPS en configuration déclarative

**Alternatives considérées** :
- **Nginx + Certbot** : renouvellement SSL manuel, pas de configuration dynamique, verbose
- **HAProxy** : pas de support ACME natif
- **Caddy** : moins mature pour multi-LXC sans Docker, ecosystem plus restreint

## Conséquences

✅ Zero-touch SSL (Let's Encrypt DNS-01 OVH)
✅ Ajout d'un service = 5 lignes YAML dans `dynamic_conf.yml`
✅ Sécurité centralisée (headers, rate limit, TLS 1.3)
⚠️ Configuration Traefik complexe à déboguer (logs peu verbeux par défaut)
⚠️ File provider moins efficace que Docker provider pour les reloads fréquents (acceptable ici)

## Implémentation

```yaml
# ansible/roles/traefik/templates/dynamic_conf.yml.j2
http:
  routers:
    mon-service:
      rule: "Host(`service.oldevops.fr`)"
      entryPoints: [websecure]
      tls:
        certResolver: ovh
      service: mon-service
      middlewares: [secure-headers, rate-limit]
  services:
    mon-service:
      loadBalancer:
        servers:
          - url: "http://192.168.1.201:8081"
```

Rechargement Traefik sans downtime : signal HUP via `docker kill -s HUP traefik`.
