# Architecture Diagrams

**Project**: Infra-OlDevOps
**Version**: 1.0
**Date**: 2026-01-07

This document contains visual architecture diagrams using Mermaid.

---

## Table of Contents

1. [Current State Network Architecture](#1-current-state-network-architecture)
2. [Current State Service Architecture](#2-current-state-service-architecture)
3. [Future State Network Architecture](#3-future-state-network-architecture)
4. [Future State Service Architecture](#4-future-state-service-architecture)
5. [CI/CD Pipeline Architecture](#5-cicd-pipeline-architecture)
6. [Observability Stack Architecture](#6-observability-stack-architecture)
7. [Deployment Flow](#7-deployment-flow)

---

## 1. Current State Network Architecture

```mermaid
graph TB
    subgraph Internet
        Users[Users/Recruiters]
        GitHub[GitHub Repository]
    end

    subgraph "BBox Router (192.168.1.254)"
        Router[NAT: 80/443 → .200]
    end

    subgraph "Proxmox VE Host"
        subgraph "Bridge vmbr0 (192.168.1.0/24)"
            Proxy[LXC: proxy<br/>VMID 200<br/>192.168.1.200<br/>2C / 1GB / 8GB]
            Utils[LXC: utilities<br/>VMID 220<br/>192.168.1.201<br/>6C / 8GB / 40GB]
            Monitor[LXC: monitoring<br/>VMID 240<br/>192.168.1.202<br/>4C / 6GB / 50GB]
        end
    end

    Users -->|HTTPS| Router
    Router -->|Port Forward| Proxy
    GitHub -.->|Git Clone| Proxy

    Proxy -->|HTTP| Utils
    Proxy -->|HTTP| Monitor

    subgraph "proxy services"
        Traefik[Traefik v3<br/>Reverse Proxy + SSL]
    end

    subgraph "utilities services"
        Vault[Vaultwarden<br/>:8082]
        Snipe[Snipe-IT<br/>:8081]
        Netbox[NetBox<br/>:8084]
    end

    subgraph "monitoring services"
        Zabbix[Zabbix<br/>:8083]
        Kuma[Uptime Kuma<br/>:3001]
        Prom[Prometheus<br/>:9090]
        Graf[Grafana<br/>:3000]
    end

    Proxy --> Traefik
    Utils --> Vault
    Utils --> Snipe
    Utils --> Netbox
    Monitor --> Zabbix
    Monitor --> Kuma
    Monitor --> Prom
    Monitor --> Graf

    Traefik -.->|Routes to| Vault
    Traefik -.->|Routes to| Snipe
    Traefik -.->|Routes to| Netbox
    Traefik -.->|Routes to| Zabbix
    Traefik -.->|Routes to| Kuma
    Traefik -.->|Routes to| Prom
    Traefik -.->|Routes to| Graf

    style Proxy fill:#e1f5ff
    style Utils fill:#fff4e1
    style Monitor fill:#e8f5e8
```

---

## 2. Current State Service Architecture

```mermaid
graph LR
    subgraph "Public URLs (*.oldevops.fr)"
        V[vault.oldevops.fr]
        I[inventory.oldevops.fr]
        N[netbox.oldevops.fr]
        S[status.oldevops.fr]
        M[monitoring.oldevops.fr]
        P[prometheus.oldevops.fr]
        G[grafana.oldevops.fr]
    end

    subgraph "Traefik Routing (192.168.1.200)"
        TR[Traefik v3<br/>SSL Termination<br/>Let's Encrypt DNS-01]
    end

    subgraph "Utilities Container (.201)"
        VW[Vaultwarden:8082<br/>SQLite]
        SI[Snipe-IT:8081<br/>MySQL]
        NB[NetBox:8084<br/>PostgreSQL]
    end

    subgraph "Monitoring Container (.202)"
        ZB[Zabbix:8083<br/>PostgreSQL]
        UK[Uptime Kuma:3001<br/>SQLite]
        PM[Prometheus:9090<br/>TSDB]
        GF[Grafana:3000<br/>SQLite]
    end

    V --> TR
    I --> TR
    N --> TR
    S --> TR
    M --> TR
    P --> TR
    G --> TR

    TR --> VW
    TR --> SI
    TR --> NB
    TR --> ZB
    TR --> UK
    TR --> PM
    TR --> GF

    GF -.->|Query| PM
    UK -.->|Health Check| VW
    UK -.->|Health Check| SI
    UK -.->|Health Check| NB

    style TR fill:#ff9999
    style VW fill:#99ccff
    style SI fill:#99ccff
    style NB fill:#99ccff
    style ZB fill:#99ff99
    style UK fill:#99ff99
    style PM fill:#99ff99
    style GF fill:#99ff99
```

---

## 3. Future State Network Architecture

```mermaid
graph TB
    subgraph Internet
        Users[Users/Recruiters]
        GitHub[GitHub Actions<br/>Self-Hosted Runner]
    end

    subgraph "BBox Router (192.168.1.254)"
        Router[NAT: 80/443 → .200]
    end

    subgraph "Proxmox VE Host"
        Backup[Automated Backup<br/>Daily Snapshots<br/>OVH S3 Offsite]

        subgraph "Bridge vmbr0 (192.168.1.0/24)"
            Proxy[LXC: proxy<br/>VMID 200<br/>192.168.1.200<br/>2C / 1GB / 8GB]
            Utils[LXC: utilities<br/>VMID 220<br/>192.168.1.201<br/>6C / 8GB / 40GB]
            Monitor[LXC: monitoring<br/>VMID 240<br/>192.168.1.202<br/>4C / 6GB / 50GB]
            AppDemo[LXC: app-demo 🆕<br/>VMID 210<br/>192.168.1.210<br/>2C / 2GB / 20GB]
        end
    end

    Users -->|HTTPS| Router
    Router -->|Port Forward| Proxy
    GitHub -.->|SSH Deploy| Proxy
    GitHub -.->|SSH Deploy| Utils
    GitHub -.->|SSH Deploy| Monitor
    GitHub -.->|SSH Deploy| AppDemo

    Proxy -->|HTTP| Utils
    Proxy -->|HTTP| Monitor
    Proxy -->|HTTP| AppDemo

    Backup -.->|Snapshot| Proxy
    Backup -.->|Snapshot| Utils
    Backup -.->|Snapshot| Monitor
    Backup -.->|Snapshot| AppDemo

    subgraph "proxy services"
        Traefik[Traefik v3<br/>Reverse Proxy + SSL<br/>Security Headers 🆕<br/>Rate Limiting 🆕]
        Promtail1[Promtail 🆕<br/>Log Agent]
    end

    subgraph "utilities services"
        Vault[Vaultwarden<br/>:8082]
        Snipe[Snipe-IT<br/>:8081]
        Netbox[NetBox<br/>:8084]
        Promtail2[Promtail 🆕<br/>Log Agent]
    end

    subgraph "monitoring services"
        Zabbix[Zabbix<br/>:8083]
        Kuma[Uptime Kuma<br/>:3001]
        Prom[Prometheus<br/>:9090]
        Graf[Grafana<br/>:3000]
        Loki[Loki 🆕<br/>:3100<br/>Log Aggregation]
        Promtail3[Promtail 🆕<br/>Log Agent]
    end

    subgraph "app-demo services 🆕"
        Frontend[React Frontend<br/>:3000<br/>TypeScript + Vite]
        Backend[Node.js API<br/>:5000<br/>Express + TypeScript]
        DB[PostgreSQL<br/>:5432]
        Promtail4[Promtail 🆕<br/>Log Agent]
    end

    Proxy --> Traefik
    Proxy --> Promtail1
    Utils --> Vault
    Utils --> Snipe
    Utils --> Netbox
    Utils --> Promtail2
    Monitor --> Zabbix
    Monitor --> Kuma
    Monitor --> Prom
    Monitor --> Graf
    Monitor --> Loki
    Monitor --> Promtail3
    AppDemo --> Frontend
    AppDemo --> Backend
    AppDemo --> DB
    AppDemo --> Promtail4

    Frontend --> Backend
    Backend --> DB

    Promtail1 -.->|Logs| Loki
    Promtail2 -.->|Logs| Loki
    Promtail3 -.->|Logs| Loki
    Promtail4 -.->|Logs| Loki

    Graf -.->|Query Logs| Loki
    Graf -.->|Query Metrics| Prom

    style Proxy fill:#e1f5ff
    style Utils fill:#fff4e1
    style Monitor fill:#e8f5e8
    style AppDemo fill:#ffe8f5
    style Backup fill:#fff9e6
```

---

## 4. Future State Service Architecture

```mermaid
graph LR
    subgraph "Public URLs (*.oldevops.fr)"
        V[vault.oldevops.fr]
        I[inventory.oldevops.fr]
        N[netbox.oldevops.fr]
        S[status.oldevops.fr]
        M[monitoring.oldevops.fr]
        P[prometheus.oldevops.fr]
        G[grafana.oldevops.fr]
        A[app.oldevops.fr 🆕]
        API[api.oldevops.fr 🆕]
    end

    subgraph "Traefik Routing (192.168.1.200)"
        TR[Traefik v3<br/>SSL + Security 🆕<br/>Let's Encrypt DNS-01]
    end

    subgraph "Utilities Container (.201)"
        VW[Vaultwarden:8082]
        SI[Snipe-IT:8081]
        NB[NetBox:8084]
    end

    subgraph "Monitoring Container (.202)"
        ZB[Zabbix:8083]
        UK[Uptime Kuma:3001]
        PM[Prometheus:9090]
        GF[Grafana:3000]
        LK[Loki:3100 🆕]
    end

    subgraph "App-Demo Container (.210) 🆕"
        FE[React Frontend:3000]
        BE[Node.js API:5000]
        DB[PostgreSQL:5432]
    end

    V --> TR
    I --> TR
    N --> TR
    S --> TR
    M --> TR
    P --> TR
    G --> TR
    A --> TR
    API --> TR

    TR --> VW
    TR --> SI
    TR --> NB
    TR --> ZB
    TR --> UK
    TR --> PM
    TR --> GF
    TR --> FE
    TR --> BE

    FE -.->|API Calls| BE
    BE -.->|SQL| DB

    GF -.->|Query Metrics| PM
    GF -.->|Query Logs| LK
    UK -.->|Health Check| FE
    UK -.->|Health Check| BE
    PM -.->|Scrape| BE

    style TR fill:#ff9999
    style FE fill:#ffccff
    style BE fill:#ffccff
    style DB fill:#ffccff
    style LK fill:#ccffcc
```

---

## 5. CI/CD Pipeline Architecture

```mermaid
graph TB
    subgraph "Developer Workflow"
        Dev[Developer]
        Local[Local Changes<br/>Terraform/Ansible/App]
    end

    subgraph "GitHub Repository"
        PR[Pull Request]
        Main[main Branch<br/>Protected]
    end

    subgraph "GitHub Actions - Validation (on PR)"
        TFValidate[Terraform Validate<br/>fmt, validate, plan, tfsec]
        AnsibleLint[Ansible Lint<br/>lint, syntax-check]
        SecScan[Security Scan<br/>git-secrets, Trivy]
        AppBuild[App Build<br/>npm test, build]
    end

    subgraph "GitHub Actions - Deployment (on Merge)"
        Approval[Manual Approval<br/>Required]
        Snapshot[Create Snapshots<br/>Proxmox]
        TFApply[Terraform Apply<br/>Infrastructure]
        AnsibleRun[Ansible Playbooks<br/>Configuration]
        AppDeploy[App Deployment<br/>Docker Compose]
        HealthCheck[Health Checks<br/>curl all URLs]
        Rollback[Rollback on Failure<br/>Restore Snapshots]
    end

    subgraph "Self-Hosted Runner"
        Runner[GitHub Runner<br/>On Proxmox/LXC<br/>Has SSH Access]
    end

    subgraph "Proxmox Infrastructure"
        Containers[LXC Containers<br/>proxy, utilities,<br/>monitoring, app-demo]
    end

    Dev --> Local
    Local --> PR
    PR --> TFValidate
    PR --> AnsibleLint
    PR --> SecScan
    PR --> AppBuild

    TFValidate --> |Pass| Main
    AnsibleLint --> |Pass| Main
    SecScan --> |Pass| Main
    AppBuild --> |Pass| Main

    Main --> Approval
    Approval --> |Approved| Snapshot
    Snapshot --> TFApply
    TFApply --> AnsibleRun
    AnsibleRun --> AppDeploy
    AppDeploy --> HealthCheck
    HealthCheck --> |Success| Containers
    HealthCheck --> |Failure| Rollback
    Rollback --> Containers

    Runner -.->|Executes| TFValidate
    Runner -.->|Executes| AnsibleLint
    Runner -.->|Executes| TFApply
    Runner -.->|Executes| AnsibleRun
    Runner -.->|SSH| Containers

    style PR fill:#e1f5ff
    style Main fill:#e8f5e8
    style Approval fill:#fff4e1
    style HealthCheck fill:#ffe8e8
    style Rollback fill:#ff9999
```

---

## 6. Observability Stack Architecture

```mermaid
graph TB
    subgraph "All LXC Containers"
        C1[proxy<br/>Promtail Agent]
        C2[utilities<br/>Promtail Agent]
        C3[monitoring<br/>Promtail Agent]
        C4[app-demo<br/>Promtail Agent]
    end

    subgraph "Metrics Collection"
        NodeExp1[Node Exporter]
        NodeExp2[Node Exporter]
        NodeExp3[Node Exporter]
        NodeExp4[Node Exporter]
        AppMetrics[App Metrics<br/>Backend /metrics]
    end

    subgraph "Monitoring Container"
        Prom[Prometheus<br/>Metrics Storage<br/>15d Retention]
        Loki[Loki<br/>Log Aggregation<br/>7d Retention]
        Graf[Grafana<br/>Visualization]
    end

    subgraph "Grafana Dashboards"
        D1[Infrastructure<br/>Dashboard<br/>CPU/RAM/Disk]
        D2[Service Health<br/>Dashboard<br/>Uptime/Latency]
        D3[Application<br/>Dashboard<br/>API Metrics]
        D4[Log Explorer<br/>Dashboard<br/>Centralized Logs]
    end

    C1 --> |Logs| Loki
    C2 --> |Logs| Loki
    C3 --> |Logs| Loki
    C4 --> |Logs| Loki

    NodeExp1 --> |Scrape| Prom
    NodeExp2 --> |Scrape| Prom
    NodeExp3 --> |Scrape| Prom
    NodeExp4 --> |Scrape| Prom
    AppMetrics --> |Scrape| Prom

    Prom --> Graf
    Loki --> Graf

    Graf --> D1
    Graf --> D2
    Graf --> D3
    Graf --> D4

    style Loki fill:#ccffcc
    style Prom fill:#ccccff
    style Graf fill:#ffcccc
    style D1 fill:#e8f5e8
    style D2 fill:#e8f5e8
    style D3 fill:#e8f5e8
    style D4 fill:#e8f5e8
```

---

## 7. Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant CI as GitHub Actions
    participant Runner as Self-Hosted Runner
    participant PVE as Proxmox VE
    participant TF as Terraform
    participant Ansible as Ansible
    participant LXC as LXC Containers

    Dev->>Git: git push (create PR)
    Git->>CI: Trigger validation workflows
    CI->>Runner: Run terraform validate
    Runner->>Runner: terraform fmt -check
    Runner->>Runner: terraform validate
    Runner->>Runner: tfsec scan
    Runner-->>CI: ✅ Validation passed

    CI->>Runner: Run ansible lint
    Runner->>Runner: ansible-lint
    Runner->>Runner: ansible-playbook --syntax-check
    Runner-->>CI: ✅ Lint passed

    CI->>Runner: Run security scan
    Runner->>Runner: git-secrets
    Runner->>Runner: Trivy scan
    Runner-->>CI: ✅ Security passed

    CI-->>Git: ✅ All checks passed
    Dev->>Git: Merge PR to main

    Git->>CI: Trigger deployment workflow
    CI-->>Dev: ⏸️ Awaiting manual approval
    Dev->>CI: ✅ Approve deployment

    CI->>Runner: Start deployment
    Runner->>PVE: Create snapshots (all LXCs)
    PVE-->>Runner: ✅ Snapshots created

    Runner->>TF: terraform init
    Runner->>TF: terraform apply -auto-approve
    TF->>PVE: Create/update LXC containers
    PVE-->>TF: ✅ Containers ready
    TF-->>Runner: ✅ Infrastructure deployed

    Runner->>Ansible: ansible-playbook playbooks/*
    Ansible->>LXC: SSH connection
    Ansible->>LXC: Install Docker, services
    Ansible->>LXC: Configure applications
    LXC-->>Ansible: ✅ Services running
    Ansible-->>Runner: ✅ Configuration complete

    Runner->>LXC: Health checks (curl URLs)
    LXC-->>Runner: HTTP 200 OK
    Runner-->>CI: ✅ Deployment successful
    CI-->>Git: Comment on PR
    Git-->>Dev: 📧 Deployment notification

    alt Health Check Failure
        LXC-->>Runner: ❌ HTTP error
        Runner->>PVE: Restore snapshots
        PVE-->>Runner: ✅ Rollback complete
        Runner-->>CI: ⚠️ Deployment failed, rolled back
        CI-->>Git: Comment on PR
        Git-->>Dev: 📧 Failure notification
    end
```

---

## 8. Security Architecture

```mermaid
graph TB
    subgraph "External Threats"
        Internet[Internet Traffic]
        Attacker[Potential Attackers]
    end

    subgraph "Perimeter Security"
        Router[BBox Router<br/>NAT + Firewall]
        Traefik[Traefik<br/>Rate Limiting<br/>TLS 1.3<br/>Security Headers]
    end

    subgraph "Container Security (all LXCs)"
        UFW[UFW Firewall<br/>Whitelist Rules]
        Fail2ban[Fail2ban<br/>SSH Protection]
        Updates[Unattended Upgrades<br/>Auto Security Patches]
    end

    subgraph "Application Security"
        SSL[Let's Encrypt SSL<br/>DNS-01 Challenge]
        Auth[Service Authentication<br/>JWT, User/Pass]
        HTTPS[HTTPS Only<br/>HTTP → HTTPS Redirect]
    end

    subgraph "CI/CD Security"
        PreCommit[Pre-Commit Hooks<br/>git-secrets<br/>detect-secrets]
        TFSec[tfsec<br/>Terraform Security]
        Trivy[Trivy<br/>Docker Image Scan]
        OWASP[OWASP Dependency<br/>Check]
    end

    subgraph "Secrets Management"
        AnsibleVault[Ansible Vault<br/>AES256 Encrypted]
        GitHubSecrets[GitHub Secrets<br/>Encrypted Storage]
        NoGit[.gitignore<br/>No secrets in Git]
    end

    Internet --> Router
    Attacker --> Router
    Router --> |Port 80/443| Traefik
    Traefik --> UFW
    UFW --> Fail2ban
    Fail2ban --> Updates

    Traefik --> SSL
    SSL --> Auth
    Auth --> HTTPS

    PreCommit -.->|Prevent| NoGit
    TFSec -.->|Scan| Traefik
    Trivy -.->|Scan| UFW
    OWASP -.->|Check| Updates

    AnsibleVault -.->|Store| Auth
    GitHubSecrets -.->|Store| PreCommit

    style Router fill:#ff9999
    style Traefik fill:#ffcc99
    style UFW fill:#99ff99
    style SSL fill:#99ccff
    style PreCommit fill:#cc99ff
    style AnsibleVault fill:#ffcccc
```

---

## 9. Data Flow Diagram

```mermaid
graph LR
    subgraph "User Request"
        User[User Browser]
    end

    subgraph "Edge Layer"
        DNS[OVH DNS<br/>*.oldevops.fr → IP]
        Router[BBox Router<br/>NAT]
    end

    subgraph "Proxy Layer"
        Traefik[Traefik<br/>SSL Termination<br/>Routing by Host]
    end

    subgraph "Application Layer"
        Frontend[React Frontend<br/>Static Assets]
        Backend[Node.js API<br/>Business Logic]
    end

    subgraph "Data Layer"
        PostgreSQL[PostgreSQL<br/>Application Data]
        Redis[Redis<br/>Cache/Sessions]
    end

    subgraph "Observability Layer"
        Prometheus[Prometheus<br/>Metrics]
        Loki[Loki<br/>Logs]
    end

    User --> |1. HTTPS Request| DNS
    DNS --> |2. Resolve IP| Router
    Router --> |3. Forward 443| Traefik
    Traefik --> |4. Terminate SSL| Traefik
    Traefik --> |5. Route by Host| Frontend
    Traefik --> |5. Route by Host| Backend

    Frontend --> |6. API Call| Backend
    Backend --> |7. Query| PostgreSQL
    Backend --> |7. Cache| Redis
    PostgreSQL --> |8. Data| Backend
    Redis --> |8. Cached Data| Backend
    Backend --> |9. Response| Frontend
    Frontend --> |10. HTML/JS| User

    Backend -.->|Metrics| Prometheus
    Backend -.->|Logs| Loki
    Traefik -.->|Access Logs| Loki

    style User fill:#e1f5ff
    style Traefik fill:#ff9999
    style Frontend fill:#ffccff
    style Backend fill:#ffccff
    style PostgreSQL fill:#99ccff
```

---

## 10. Backup and Recovery Flow

```mermaid
graph TB
    subgraph "Scheduled Backup (Daily 2 AM)"
        Cron[Cron Job<br/>Proxmox Host]
    end

    subgraph "Backup Operations"
        Snapshot[Create LXC Snapshots<br/>All Containers]
        DBDump[Database Dumps<br/>PostgreSQL, MySQL]
        TFExport[Terraform State Export<br/>OVH S3]
        VaultBackup[Ansible Vault Backup<br/>secrets.yml]
    end

    subgraph "Local Storage"
        LocalBackup[/var/backups/<br/>infra-oldevops/<br/>Retention: 7 days]
    end

    subgraph "Offsite Storage"
        S3[OVH S3 Bucket<br/>Retention: 30 days<br/>Versioned]
    end

    subgraph "Monitoring"
        Alert[Backup Monitoring<br/>Success/Failure Alerts]
        Dashboard[Grafana Dashboard<br/>Last Backup Time]
    end

    subgraph "Recovery Operations"
        Restore[Restoration Script<br/>scripts/restore.sh]
        Verify[Verification<br/>Monthly Test]
    end

    Cron --> Snapshot
    Cron --> DBDump
    Cron --> TFExport
    Cron --> VaultBackup

    Snapshot --> LocalBackup
    DBDump --> LocalBackup
    TFExport --> LocalBackup
    VaultBackup --> LocalBackup

    LocalBackup --> |rclone sync| S3

    LocalBackup -.->|Monitor| Alert
    S3 -.->|Monitor| Alert
    Alert --> Dashboard

    S3 --> |Disaster Recovery| Restore
    Restore --> Verify

    style Cron fill:#fff4e1
    style LocalBackup fill:#e8f5e8
    style S3 fill:#99ccff
    style Alert fill:#ff9999
    style Restore fill:#ffcc99
```

---

## Notes on Diagrams

### Rendering
- All diagrams use **Mermaid** syntax
- Render automatically on GitHub
- Can be exported to PNG/SVG using Mermaid CLI or online editor

### Diagram Updates
- Update diagrams when architecture changes
- Version diagrams with code (in Git)
- Reference diagram version in ADRs

### Diagram Sources
- **Mermaid Live Editor**: https://mermaid.live/
- **Mermaid Documentation**: https://mermaid-js.github.io/mermaid/

### Legend

| Symbol | Meaning |
|--------|---------|
| → | Data flow / Traffic |
| -.-> | Monitoring / Logging / Reference |
| 🆕 | New component (future state) |
| Solid box | Existing component |
| Dashed box | External system |

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Next Review**: After each phase implementation
**Related Documents**:
- Brownfield Architecture Overview: `brownfield-architecture-overview.md`
- Current State Detailed: `current-state-detailed.md`

---

**Prepared by**: DevOps Architecture Team
