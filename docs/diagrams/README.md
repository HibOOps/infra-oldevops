# Diagrammes d'Architecture — Infra-OlDevOps

**Version** : 1.0
**Dernière mise à jour** : 2026-02-20

Tous les diagrammes sont en **syntaxe Mermaid** — rendus automatiquement sur GitHub.

---

## Index des Diagrammes

Les diagrammes détaillés sont dans [`docs/architecture/architecture-diagrams.md`](../architecture/architecture-diagrams.md) :

| # | Diagramme | Description |
|---|-----------|-------------|
| 1 | [Réseau état actuel](../architecture/architecture-diagrams.md#1-current-state-network-architecture) | LXC, IPs, bridges Proxmox |
| 2 | [Services état actuel](../architecture/architecture-diagrams.md#2-current-state-service-architecture) | Routage Traefik → services |
| 3 | [Réseau état futur](../architecture/architecture-diagrams.md#3-future-state-network-architecture) | + ci-runner + app-demo + Loki |
| 4 | [Services état futur](../architecture/architecture-diagrams.md#4-future-state-service-architecture) | PriceSync + observabilité |
| 5 | [Pipeline CI/CD](../architecture/architecture-diagrams.md#5-cicd-pipeline-architecture) | GitHub Actions → deploy |
| 6 | [Stack observabilité](../architecture/architecture-diagrams.md#6-observability-stack-architecture) | Prometheus + Loki + Grafana |
| 7 | [Flux déploiement](../architecture/architecture-diagrams.md#7-deployment-flow) | Sequence diagram complet |
| 8 | [Sécurité](../architecture/architecture-diagrams.md#8-security-architecture) | Couches de sécurité |
| 9 | [Data flow](../architecture/architecture-diagrams.md#9-data-flow-diagram) | Requête HTTP → DB |
| 10 | [Backup & Recovery](../architecture/architecture-diagrams.md#10-backup-and-recovery-flow) | Backup quotidien + restore |

---

## Diagramme Réseau (État Actuel)

```mermaid
graph TB
    subgraph Internet
        Users[Utilisateurs / Recruteurs]
        GH[GitHub Actions]
    end

    subgraph "BBox Router 192.168.1.254"
        Router[NAT 80/443 → .200]
    end

    subgraph "Proxmox VE — bridge vmbr0 192.168.1.0/24"
        Proxy[proxy .200\nTraefik v3]
        Utils[utilities .201\nVaultwarden · Snipe-IT · NetBox]
        Monitor[monitoring .202\nPrometheus · Grafana · Loki · Zabbix]
        CIRunner[ci-runner .210\nGitHub Runner]
        AppDemo[app-demo .250\nPriceSync React+API+PG]
    end

    Users -->|HTTPS 443| Router
    Router --> Proxy
    GH -.->|SSH deploy| CIRunner
    CIRunner -.->|SSH| Proxy
    CIRunner -.->|SSH| Utils
    CIRunner -.->|SSH| Monitor
    CIRunner -.->|SSH deploy| AppDemo

    Proxy -->|HTTP| Utils
    Proxy -->|HTTP| Monitor
    Proxy -->|HTTP| AppDemo

    style Proxy fill:#e1f5ff
    style Utils fill:#fff4e1
    style Monitor fill:#e8f5e8
    style CIRunner fill:#f5e8ff
    style AppDemo fill:#ffe8f5
```

---

## Diagramme Application PriceSync

```mermaid
graph LR
    subgraph "demo.oldevops.fr"
        FE[React SPA\nnginx :80]
        BE[Express API\nNode.js :5000]
        DB[(PostgreSQL\n:5432)]
    end

    subgraph "Traefik routing"
        T[demo.oldevops.fr\nPathPrefix /api → :5000\n/* → :80]
    end

    Browser[Navigateur] -->|HTTPS| T
    T -->|/* | FE
    T -->|/api/*| BE
    FE -->|fetch /api| BE
    BE -->|Prisma ORM| DB

    style FE fill:#ffccff
    style BE fill:#ffccff
    style DB fill:#99ccff
```

---

## Diagramme CI/CD

```mermaid
graph LR
    Push[git push\napp-demo/**] --> Build[app-build.yml\nlint + tests]
    Build -->|pass| Docker[app-docker.yml\nbuild → ghcr.io\nTrivy scan]
    Docker -->|pass| Deploy[app-deploy.yml\nSSH → .250\ndocker compose up]
    Deploy --> Health{Health\ncheck}
    Health -->|OK| Done[✅ Déployé]
    Health -->|KO| Rollback[⚠️ Rollback\nrestart ancien]
```

---

## Outils

- **Mermaid Live** : https://mermaid.live/ — éditer et prévisualiser
- **CLI export** : `npx @mermaid-js/mermaid-cli -i diagram.md -o diagram.svg`
