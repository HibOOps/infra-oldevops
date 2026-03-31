# Brownfield Architecture Overview
## Infrastructure-as-Code Professional Portfolio Transformation

**Project**: Infra-OlDevOps Professional Showcase
**Type**: Brownfield Enhancement
**Version**: 1.0
**Date**: 2026-01-07
**Status**: Architecture Design

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Architecture](#2-current-state-architecture)
3. [Future State Architecture](#3-future-state-architecture)
4. [Gap Analysis](#4-gap-analysis)
5. [Migration and Integration Strategy](#5-migration-and-integration-strategy)
6. [Risk Assessment and Mitigation](#6-risk-assessment-and-mitigation)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Architecture Decisions](#8-architecture-decisions)

---

## 1. Executive Summary

### 1.1 Project Overview

This document outlines the brownfield transformation of an existing homelab infrastructure into a professional DevOps portfolio showcase. The project enhances an operational Proxmox-based infrastructure running 8 production services with modern CI/CD pipelines, a demonstration application, advanced observability, and professional documentation.

**Key Transformation Goals:**
- Transform from homelab to professional portfolio
- Add automated CI/CD pipelines (GitHub Actions)
- Deploy a modern web application (React + API + PostgreSQL)
- Enhance observability (Loki, advanced Grafana dashboards)
- Implement enterprise-grade backup and security
- Create comprehensive professional documentation

### 1.2 Strategic Approach

**Type**: Incremental Enhancement with Preservation
- Preserve 100% of existing services and infrastructure
- Add new capabilities without disrupting operations
- Gradual migration with rollback capability at each phase
- Risk-minimizing deployment strategy

### 1.3 Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Service Uptime | 100% during migration | All 8 existing services remain accessible |
| Zero Data Loss | 100% data integrity | Verified backups and restoration tests |
| CI/CD Pipeline | <10 min end-to-end | GitHub Actions execution time |
| Documentation Coverage | 100% components | All architecture, runbooks, ADRs complete |
| Security Scanning | Zero critical CVEs | Automated security scans pass |

---

## 2. Current State Architecture

### 2.1 Infrastructure Overview

**Hypervisor Platform**: Proxmox VE
**Containerization**: LXC (Debian 12)
**Network**: BBox Router 192.168.1.0/24
**Domain**: oldevops.fr (OVH DNS)
**SSL**: Let's Encrypt via DNS-01 Challenge

### 2.2 LXC Container Architecture

| Container | VMID | IP | vCPU | RAM | Disk | Services |
|-----------|------|-----|------|-----|------|----------|
| proxy | 200 | 192.168.1.200 | 2 | 1 GB | 8 GB | Traefik v3 |
| utilities | 220 | 192.168.1.201 | 6 | 8 GB | 40 GB | Vaultwarden, Snipe-IT, NetBox |
| monitoring | 240 | 192.168.1.202 | 4 | 6 GB | 50 GB | Uptime Kuma, Prometheus, Grafana |

**Total Resources**: 12 vCPU, 15 GB RAM, 98 GB Disk

### 2.3 Service Inventory

| Service | URL | Container | Port | Description |
|---------|-----|-----------|------|-------------|
| Traefik | https://proxy.oldevops.fr | proxy | 80/443 | Reverse proxy & SSL termination |
| Vaultwarden | https://vault.oldevops.fr | utilities | 8082 | Password manager |
| Snipe-IT | https://inventory.oldevops.fr | utilities | 8081 | IT asset management |
| NetBox | https://netbox.oldevops.fr | utilities | 8084 | Network documentation & DCIM |
| Uptime Kuma | https://status.oldevops.fr | monitoring | 3001 | Service monitoring |
| | https://monitoring.oldevops.fr | monitoring | 8083 | Infrastructure monitoring |
| Prometheus | https://prometheus.oldevops.fr | monitoring | 9090 | Metrics collection |
| Grafana | https://grafana.oldevops.fr | monitoring | 3000 | Metrics visualization |

### 2.4 Technology Stack

**Infrastructure as Code:**
- Terraform v1.0+ (Proxmox provider v2.9.14)
- Ansible v2.10+ with roles-based architecture
- Bash automation (deploy.sh)

**Container Platform:**
- Docker CE
- Docker Compose Plugin
- LXC privileged mode (nesting enabled)

**Networking:**
- Traefik v3 (file provider for multi-LXC routing)
- OVH DNS API (Let's Encrypt DNS-01)
- Static IP allocation (192.168.1.200-202)

**State Management:**
- Terraform state: OVH S3 backend
- Ansible Vault: secrets.yml (encrypted)
- Configuration: terraform.tfvars (git-ignored)

**Current Deployment Process:**
```bash
# Automated via deploy.sh
terraform apply → Ansible playbooks → Service verification
```

### 2.5 Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet (Public)                        │
│                      oldevops.fr (*.oldevops.fr)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   BBox Router  │
                    │  192.168.1.254 │
                    │  (NAT 80/443)  │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │       Proxmox VE Host (Physical)    │
         │            192.168.1.0/24            │
         │                                      │
         │  ┌─────────────┐  ┌─────────────┐  │
         │  │ LXC: proxy  │  │ LXC: utilities│ │
         │  │ VMID: 200   │  │ VMID: 220    │  │
         │  │ .200        │  │ .201         │  │
         │  │ 2C/1GB/8GB  │  │ 6C/8GB/40GB  │  │
         │  │             │  │              │  │
         │  │  Traefik v3 │  │ Vaultwarden  │  │
         │  │  (80/443)   │──│ Snipe-IT     │  │
         │  │             │  │ NetBox       │  │
         │  └─────────────┘  └──────────────┘  │
         │                                      │
         │  ┌──────────────────────────────┐   │
         │  │   LXC: monitoring            │   │
         │  │   VMID: 240                  │   │
         │  │   .202                       │   │
         │  │   4C/6GB/50GB                │   │
         │  │                              │   │
         │  │   | Uptime Kuma      │   │
         │  │   Prometheus | Grafana       │   │
         │  └──────────────────────────────┘   │
         └──────────────────────────────────────┘

Traffic Flow: Internet → Router → Traefik (.200) → Services (.201/.202)
```

### 2.6 Current State Strengths

✅ **Production-Ready**: 8 services running reliably
✅ **Infrastructure-as-Code**: Fully automated with Terraform + Ansible
✅ **Monitoring**: Prometheus/Grafana/ stack in place
✅ **Security**: SSL via Let's Encrypt, SSH key authentication
✅ **State Management**: Terraform state in OVH S3
✅ **Documentation**: README and MAINTENANCE docs exist

### 2.7 Current State Limitations

❌ **No CI/CD Pipeline**: Manual deployment process
❌ **No Application Deployment**: Infrastructure-only, no demo app
❌ **Limited Observability**: No centralized logging (Loki missing)
❌ **Manual Backups**: No automated backup system
❌ **Basic Security**: No automated security scanning
❌ **Limited Documentation**: No architecture diagrams, runbooks, ADRs
❌ **No Portfolio Focus**: Generic homelab, not recruiter-oriented

---

## 3. Future State Architecture

### 3.1 Enhanced Infrastructure

**New LXC Container:**
| Container | VMID | IP | vCPU | RAM | Disk | Services |
|-----------|------|-----|------|-----|------|----------|
| app-demo | 210 | 192.168.1.210 | 2 | 2 GB | 20 GB | React Frontend, Node.js API, PostgreSQL |

**Total Resources (Future)**: 14 vCPU, 17 GB RAM, 118 GB Disk

### 3.2 Application Architecture

**Demo Application Stack:**
```
┌─────────────────────────────────────────────────────┐
│          LXC: app-demo (192.168.1.210)              │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │        Docker Compose Orchestration         │    │
│  │                                             │    │
│  │  ┌──────────────┐  ┌─────────────────┐    │    │
│  │  │   Frontend   │  │     Backend     │    │    │
│  │  │   React +    │  │   Node.js/      │    │    │
│  │  │  TypeScript  │──│   Express API   │    │    │
│  │  │   + Vite     │  │  + TypeScript   │    │    │
│  │  │              │  │                 │    │    │
│  │  │  Port: 3000  │  │   Port: 5000    │    │    │
│  │  └──────────────┘  └────────┬────────┘    │    │
│  │                              │              │    │
│  │                   ┌──────────▼─────────┐   │    │
│  │                   │   PostgreSQL DB    │   │    │
│  │                   │   Port: 5432       │   │    │
│  │                   │   Volume: 10GB     │   │    │
│  │                   └────────────────────┘   │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

Exposed URLs:
- https://app.oldevops.fr → Frontend
- https://api.oldevops.fr → Backend API
```

### 3.3 CI/CD Pipeline Architecture

**GitHub Actions Workflows:**

```
┌──────────────────────────────────────────────────────────┐
│                   GitHub Repository                       │
│               infra-oldevops (main branch)               │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
    │  PR     │ │  PR    │ │ Merge  │
    │ Infra   │ │  App   │ │ Deploy │
    │Validate │ │  Test  │ │        │
    └────┬────┘ └───┬────┘ └───┬────┘
         │          │           │
    ┌────▼─────────┐│      ┌───▼──────────┐
    │ Terraform    ││      │ Manual       │
    │ fmt/validate ││      │ Approval     │
    │ tfsec scan   ││      │ (Required)   │
    │ Ansible lint ││      └───┬──────────┘
    └──────────────┘│          │
                    │     ┌────▼─────────────┐
         ┌──────────▼─────┤ Self-Hosted      │
         │ Jest (Unit)    │ GitHub Runner    │
         │ Build (Vite)   │ On Proxmox/LXC   │
         │ Trivy (Scan)   └────┬─────────────┘
         └────────────────────┬┘
                              │
                    ┌─────────▼──────────┐
                    │   Deploy via SSH   │
                    │ Terraform + Ansible│
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Health Checks     │
                    │  (All Services)    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Rollback on Fail   │
                    │ (Proxmox Snapshots)│
                    └────────────────────┘
```

**Pipeline Flows:**

1. **Infrastructure Validation** (PR):
   - Terraform fmt, validate, plan
   - tfsec security scan
   - Ansible lint, syntax check
   - git-secrets scan

2. **Application Build & Test** (PR):
   - Frontend: ESLint, Jest, build
   - Backend: Lint, unit tests
   - Docker build + Trivy scan
   - Coverage reports

3. **Deployment** (Merge to main):
   - Manual approval gate
   - Pre-deployment Proxmox snapshots
   - Terraform apply
   - Ansible playbook execution
   - Health checks (curl all URLs)
   - Rollback on failure

### 3.4 Observability Enhancement

**Loki Integration:**
```
┌───────────────────────────────────────────────────────────┐
│                     Log Aggregation                        │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  proxy   │  │utilities │  │monitoring│  │ app-demo │ │
│  │ .200     │  │  .201    │  │  .202    │  │  .210    │ │
│  │          │  │          │  │          │  │          │ │
│  │ Promtail │  │ Promtail │  │ Promtail │  │ Promtail │ │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │             │        │
│       └─────────────┴──────────────┴─────────────┘        │
│                              │                             │
│                     ┌────────▼─────────┐                  │
│                     │   Loki Server    │                  │
│                     │  (monitoring LXC)│                  │
│                     │   Port: 3100     │                  │
│                     │  Retention: 7d   │                  │
│                     └────────┬─────────┘                  │
│                              │                             │
│                     ┌────────▼─────────┐                  │
│                     │     Grafana      │                  │
│                     │  Log Explorer    │                  │
│                     │  Dashboards      │                  │
│                     └──────────────────┘                  │
└───────────────────────────────────────────────────────────┘

Features:
- Structured JSON logs
- Labels: {host, service, level}
- Query language: LogQL
- Correlation: Logs ↔ Metrics
```

**Grafana Dashboard Suite:**
1. **Infrastructure Overview**: CPU/RAM/Disk per container
2. **Service Health**: Uptime, response times, error rates
3. **Application Metrics**: API latency (p50/p95/p99), throughput
4. **Log Explorer**: Multi-container log aggregation
5. **Security Dashboard**: Failed SSH attempts, rate limiting

### 3.5 Security Enhancements

**Automated Security Scanning:**
```
GitHub Actions (PR/Merge)
    │
    ├─ Terraform: tfsec, checkov
    ├─ Docker Images: Trivy
    ├─ Dependencies: OWASP Dependency Check
    ├─ Secrets: git-secrets, detect-secrets
    └─ Pre-commit hooks
```

**Container Hardening:**
- UFW firewall (whitelist-only)
- Fail2ban (SSH protection)
- Unattended-upgrades (auto security patches)
- Minimal service exposure

**Traefik Security:**
- TLS 1.3 minimum
- HSTS, CSP headers
- Rate limiting (1000 req/min per IP)
- Internal service network isolation

### 3.6 Backup and Disaster Recovery

**Automated Backup System:**
```
Daily Cron Job (Host Proxmox)
    │
    ├─ Proxmox LXC Snapshots (all 4 containers)
    ├─ PostgreSQL/MySQL Database Dumps
    ├─ Terraform State Export (OVH S3)
    ├─ Ansible Vault Backup
    │
    ├─ Local Storage: /var/backups/infra-oldevops/ (7 days)
    └─ Offsite: OVH S3 Bucket (30 days retention)

Recovery Targets:
- RTO (Recovery Time): <30 minutes
- RPO (Recovery Point): <24 hours
```

### 3.7 Future State Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    Internet / GitHub Cloud                          │
│  ┌──────────────────┐                  ┌──────────────────┐       │
│  │  GitHub Actions  │                  │  Users (Public)  │       │
│  │  (CI/CD Runner)  │                  │  *.oldevops.fr   │       │
│  └────────┬─────────┘                  └─────────┬────────┘       │
└───────────┼──────────────────────────────────────┼─────────────────┘
            │                                       │
            │ SSH Deploy                            │ HTTPS (443)
            │                                       │
    ┌───────▼───────────────────────────────────────▼─────────────┐
    │              BBox Router 192.168.1.254                      │
    │              Port Forwarding: 80/443 → .200                 │
    └───────────────────────────┬─────────────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────────┐
         │              Proxmox VE Host                    │
         │           Backup System + Snapshots             │
         │                                                  │
         │  ┌──────────────┐  ┌──────────────┐           │
         │  │ LXC: proxy   │  │LXC:utilities │           │
         │  │ VMID: 200    │  │ VMID: 220    │           │
         │  │ 2C/1GB/8GB   │  │ 6C/8GB/40GB  │           │
         │  │              │  │              │           │
         │  │   Traefik    │  │ Vaultwarden  │           │
         │  │   + SSL      │──│ Snipe-IT     │           │
         │  │   Promtail   │  │ NetBox       │           │
         │  │              │  │ Promtail     │           │
         │  └──────────────┘  └──────────────┘           │
         │                                                  │
         │  ┌──────────────┐  ┌──────────────┐           │
         │  │LXC:monitoring│  │ LXC:app-demo │ ← NEW    │
         │  │ VMID: 240    │  │ VMID: 210    │           │
         │  │ 4C/6GB/50GB  │  │ 2C/2GB/20GB  │           │
         │  │              │  │              │           │
         │  │ Prometheus   │  │ React Frontend│          │
         │  │ Grafana      │──│ Node.js API  │          │
         │  │ Loki ← NEW   │  │ PostgreSQL   │          │
         │  │       │  │ Promtail     │          │
         │  │ Uptime Kuma  │  │              │           │
         │  │ Promtail     │  │              │           │
         │  └──────────────┘  └──────────────┘           │
         │                                                  │
         │  Legend:                                        │
         │  ── : Network Traffic                          │
         │  ← NEW : New Component                          │
         └──────────────────────────────────────────────────┘

New Components:
1. LXC app-demo (VMID 210)
2. Loki (on monitoring)
3. Promtail agents (all containers)
4. GitHub Actions runner (external/local)
5. Automated backup system
```

---

## 4. Gap Analysis

### 4.1 Infrastructure Gaps

| Current State | Desired State | Gap | Priority | Effort |
|---------------|---------------|-----|----------|--------|
| 3 LXC containers | 4 LXC containers | 1 new container (app-demo) | High | Low |
| Manual deployment | Automated CI/CD | GitHub Actions pipelines | High | Medium |
| No app deployment | Demo app running | React + API + DB | High | High |
| Basic monitoring | Advanced observability | Loki + enhanced Grafana | Medium | Medium |
| Manual backups | Automated DR | Backup system + runbooks | High | Medium |

### 4.2 Functional Gaps

| Category | Current | Target | Implementation |
|----------|---------|--------|----------------|
| **CI/CD** | None | Full pipeline | 3 GitHub Actions workflows |
| **Application** | None | Full-stack app | React + Node.js/FastAPI + PostgreSQL |
| **Logging** | Docker logs only | Centralized | Loki + Promtail |
| **Dashboards** | Basic Grafana | Versioned, comprehensive | 4-5 dashboards as code |
| **Backup** | Manual/ad-hoc | Automated daily | Ansible role + cron |
| **Security** | Basic | Automated scanning | Trivy, tfsec, OWASP, pre-commit |
| **Documentation** | README only | Complete | Architecture docs, runbooks, ADRs |

### 4.3 Non-Functional Gaps

| Requirement | Current | Target | Gap |
|-------------|---------|--------|-----|
| **Deployment Time** | ~15 min manual | <10 min automated | CI/CD pipeline |
| **Recovery Time** | Unknown | <30 min | Backup automation + testing |
| **Security Posture** | Manual | Automated scans | GitHub Actions security workflow |
| **Observability** | Metrics only | Metrics + Logs | Loki integration |
| **Documentation** | 20% coverage | 100% coverage | Architecture docs + runbooks |

### 4.4 Skills Demonstration Gaps

**For Recruiters:**

| Skill | Currently Demonstrated | Enhancement Needed |
|-------|------------------------|---------------------|
| CI/CD | ❌ No | ✅ GitHub Actions full pipeline |
| GitOps | ❌ No | ✅ Automated deployment on merge |
| Full-stack | ❌ No | ✅ React + API deployment |
| Observability | 🟡 Partial (Prometheus) | ✅ Loki + complete dashboards |
| Security | 🟡 Basic (SSH, SSL) | ✅ Automated scanning + hardening |
| DR Planning | ❌ No | ✅ Automated backups + tested restoration |
| Documentation | 🟡 Basic README | ✅ Professional architecture docs |

---

## 5. Migration and Integration Strategy

### 5.1 Overall Strategy

**Approach**: **Incremental Enhancement with Zero Downtime**

**Principles:**
1. **Preservation First**: Existing services never disrupted
2. **Additive Changes**: New components added alongside old
3. **Gradual Rollout**: One story/phase at a time
4. **Rollback Ready**: Snapshots before every change
5. **Validation Gates**: Health checks after each deployment

### 5.2 Migration Phases

**Phase 1: Foundation (Stories 1.1-1.3)**
**Duration**: ~1 week
**Risk**: Low
**Changes**: CI/CD pipeline setup (no infrastructure changes)

- Story 1.1: GitHub Actions validation workflows (Terraform, Ansible)
- Story 1.2: Self-hosted GitHub runner setup
- Story 1.3: Automated deployment pipeline

**Integration Points:**
- GitHub repository (new .github/workflows/ directory)
- Runner on Proxmox host or dedicated LXC
- No changes to existing containers

**Rollback Plan:**
- Delete workflows from GitHub
- Uninstall runner
- Continue manual deployments

---

**Phase 2: Application Infrastructure (Stories 1.4-1.5)**
**Duration**: ~3 days
**Risk**: Low
**Changes**: New LXC container + base configuration

- Story 1.4: Terraform config for app-demo LXC (VMID 210)
- Story 1.5: Ansible role for Docker setup on app-demo

**Integration Points:**
- New Terraform module in main.tf
- New Ansible playbook (app-demo.yml)
- DNS: app.oldevops.fr, api.oldevops.fr pointing to 192.168.1.200

**Validation:**
- Container boots and is SSH accessible
- Docker runs successfully
- No impact on existing containers (resource monitoring)

**Rollback Plan:**
- `terraform destroy -target=module.app-demo`
- Remove DNS records

---

**Phase 3: Application Deployment (Stories 1.6-1.8)**
**Duration**: ~2 weeks
**Risk**: Medium
**Changes**: Full-stack application + CI/CD

- Story 1.6: React + Node.js/FastAPI app development
- Story 1.7: Traefik integration (routing rules)
- Story 1.8: Application CI/CD pipeline

**Integration Points:**
- Traefik dynamic config (new routes for app/api)
- Let's Encrypt SSL for 2 new domains
- GitHub Container Registry (image storage)
- Database initialization on app-demo

**Validation:**
- https://app.oldevops.fr loads successfully
- API endpoints respond (health check)
- Database accepts connections
- CI/CD pipeline deploys successfully
- All 8 existing services still accessible

**Rollback Plan:**
- Revert Traefik config to previous version
- Stop Docker Compose on app-demo
- Remove DNS records
- Delete GitHub workflows for app

---

**Phase 4: Observability Enhancement (Stories 1.9-1.10)**
**Duration**: ~1 week
**Risk**: Low-Medium
**Changes**: Loki deployment + Grafana dashboards

- Story 1.9: Loki + Promtail on all containers
- Story 1.10: Grafana dashboards as code

**Integration Points:**
- Loki deployed on monitoring container
- Promtail agents on all 4 containers
- Grafana datasource configuration
- Dashboard JSON files in Git

**Validation:**
- Logs visible in Grafana Explore
- Dashboards load with correct data
- Prometheus still functioning
- No performance degradation

**Rollback Plan:**
- Stop Loki container
- Uninstall Promtail from containers
- Remove Grafana datasource
- Delete dashboards

---

**Phase 5: Operational Excellence (Stories 1.11-1.12)**
**Duration**: ~1 week
**Risk**: Low
**Changes**: Backup automation + security hardening

- Story 1.11: Automated backup system
- Story 1.12: Security scanning + hardening

**Integration Points:**
- Cron job on Proxmox host
- OVH S3 bucket for offsite backups
- GitHub Actions security workflows
- UFW/Fail2ban on all containers

**Validation:**
- Backup script runs successfully
- Restoration test passes
- Security scans complete without errors
- Services remain accessible

**Rollback Plan:**
- Disable cron jobs
- Remove security workflows
- Revert firewall rules

---

**Phase 6: Documentation (Stories 1.13-1.14)**
**Duration**: ~1 week
**Risk**: Very Low
**Changes**: Documentation and portfolio materials

- Story 1.13: Architecture docs, runbooks, ADRs
- Story 1.14: README transformation + portfolio page

**Integration Points:**
- docs/ directory structure
- README.md updates
- Portfolio page in React app
- Screenshots and diagrams

**Validation:**
- All links work
- Diagrams render correctly
- README is recruiter-friendly

**Rollback Plan:**
- Git revert to previous README
- Remove docs/ directory

---

### 5.3 Integration Strategy by Component

#### 5.3.1 Terraform Integration

**Approach**: Module Addition (Non-Breaking)

```hcl
# terraform/main.tf
# Existing modules preserved (proxy, utilities, monitoring)

# NEW: App-demo module
module "app_demo" {
  source      = "./modules/lxc_container"
  vmid        = 210
  hostname    = "app-demo"
  # ... configuration
}
```

**State Management:**
- Single Terraform state (OVH S3)
- New resources appended to state
- Existing resources untouched
- State locking during applies

**Validation:**
- `terraform plan` shows only new resources
- No changes to existing resources

#### 5.3.2 Ansible Integration

**Approach**: Role Addition + Playbook Extension

**New Components:**
```
ansible/
  roles/
    app-demo/          # NEW
    loki/              # NEW
    promtail/          # NEW
    backup/            # NEW
    hardening/         # NEW
  playbooks/
    app-demo.yml       # NEW
    monitoring-advanced.yml  # NEW (extends existing monitoring.yml)
```

**Execution Order (deploy.sh updated):**
```bash
# Existing (preserved)
ansible-playbook playbooks/traefik.yml
ansible-playbook playbooks/utilities.yml
ansible-playbook playbooks/monitoring.yml

# NEW additions
ansible-playbook playbooks/monitoring-advanced.yml  # Loki, Promtail
ansible-playbook playbooks/app-demo.yml             # Application
ansible-playbook playbooks/hardening.yml            # Security (all containers)
```

**Idempotency**: All playbooks remain idempotent; can be run multiple times safely

#### 5.3.3 Traefik Integration

**Approach**: File Provider Extension

**Current**: Traefik uses file provider (`dynamic_conf.yml`) for routing to utilities and monitoring

**Integration**:
```yaml
# ansible/roles/traefik/templates/dynamic_conf.yml.j2

# EXISTING services (preserved)
http:
  routers:
    vault:
      rule: "Host(`vault.oldevops.fr`)"
      service: vaultwarden
      # ... existing config

# NEW services (added)
    app-frontend:
      rule: "Host(`app.oldevops.fr`)"
      service: app-frontend
      tls:
        certResolver: ovhdns

    app-backend:
      rule: "Host(`api.oldevops.fr`)"
      service: app-backend
      tls:
        certResolver: ovhdns

  services:
    app-frontend:
      loadBalancer:
        servers:
          - url: "http://192.168.1.210:3000"

    app-backend:
      loadBalancer:
        servers:
          - url: "http://192.168.1.210:5000"
```

**Testing**:
- Config validation: `traefik validate`
- Graceful reload: `docker kill -s HUP traefik`
- Health check: curl all URLs

**Rollback**:
- Revert dynamic_conf.yml to previous version
- Reload Traefik

#### 5.3.4 DNS Integration

**Approach**: Additive DNS Records

**Current DNS (OVH):**
```
A     proxy.oldevops.fr       → PUBLIC_IP
CNAME *.oldevops.fr           → proxy.oldevops.fr
```

**No Changes Needed**: Wildcard already covers:
- app.oldevops.fr → proxy.oldevops.fr → PUBLIC_IP → Traefik
- api.oldevops.fr → proxy.oldevops.fr → PUBLIC_IP → Traefik

**SSL Certificates**:
- Let's Encrypt DNS-01 challenge (automated by Traefik)
- No manual intervention required

#### 5.3.5 GitHub Actions Integration

**Approach**: New Workflows (No Codebase Changes)

**Repository Structure:**
```
infra-oldevops/
  .github/
    workflows/            # NEW directory
      terraform-validate.yml
      ansible-lint.yml
      security-scan.yml
      deploy-infra.yml
      app-build.yml
      app-docker.yml
      app-deploy.yml
```

**Trigger Strategy:**
- PR: Validation workflows only (non-destructive)
- Merge to main: Deployment workflows (requires approval)

**Secrets (GitHub):**
- PROXMOX_HOST
- PROXMOX_API_TOKEN
- SSH_PRIVATE_KEY
- OVH_API_CREDENTIALS
- GHCR_TOKEN (GitHub Container Registry)

**Runner:**
- Option 1: Self-hosted on Proxmox host
- Option 2: Self-hosted in dedicated LXC (VMID 250)
- Labels: `self-hosted-proxmox`

#### 5.3.6 Monitoring Integration

**Approach**: Extend Existing Stack

**Prometheus** (existing):
- Add scrape targets for app-demo
- Configuration update via Ansible

**Grafana** (existing):
- Add Loki datasource
- Import new dashboards (JSON provisioning)
- Existing dashboards preserved

**Loki** (new):
- Deployed on monitoring container
- Lightweight (512 MB RAM)
- Port 3100 (internal only)

**Promtail** (new):
- Deployed on all 4 containers
- Scrapes: systemd journal, Docker logs
- Sends to Loki on 192.168.1.202:3100

**No Breaking Changes**: Existing Prometheus metrics unaffected

### 5.4 Data Migration Strategy

**No Data Migration Required**

This is a brownfield **enhancement** project, not a **migration** project. Key points:

✅ **No Database Migrations**: Existing databases (Snipe-IT MySQL, NetBox PostgreSQL, Vaultwarden SQLite) remain untouched

✅ **New Database Only**: PostgreSQL for app-demo is a fresh installation with initialization scripts

✅ **Terraform State Continuity**: Existing OVH S3 state file is extended, not replaced

✅ **Service Configuration Preserved**: All existing Docker Compose configs remain unchanged

### 5.5 Backward Compatibility

**Guaranteed Compatibility:**

1. **Container IDs**: Existing VMIDs (200, 220, 240) unchanged
2. **IP Addresses**: Static IPs (.200, .201, .202) unchanged
3. **Service URLs**: All *.oldevops.fr URLs unchanged
4. **SSH Access**: Ed25519 keys remain valid
5. **Ansible Inventory**: Existing groups (proxy, utilities, monitoring) unchanged
6. **Terraform Modules**: No breaking changes to existing modules

**Version Pinning:**
```hcl
# terraform/providers.tf
terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "= 2.9.14"  # Pinned, no upgrade
    }
  }
}
```

### 5.6 Testing Strategy

**Pre-Deployment Testing:**
1. **Local Validation**: `terraform validate`, `ansible --syntax-check`
2. **CI Pipeline**: Automated checks on PR
3. **Plan Review**: Manual review of `terraform plan` output

**Deployment Validation:**
1. **Health Checks**: Automated curl tests for all URLs
2. **Service Verification**: Docker ps, container status
3. **Resource Monitoring**: CPU/RAM/Disk usage checks
4. **Log Inspection**: Check for errors in journalctl, Docker logs

**Post-Deployment Testing:**
1. **Smoke Tests**: Access each service via browser
2. **End-to-End**: Complete user workflow (e.g., app signup → API call → DB query)
3. **Performance**: Response time baselines
4. **Backup Test**: Verify automated backup runs

**Rollback Testing:**
1. **Snapshot Restoration**: Test Proxmox snapshot rollback
2. **Terraform Destroy**: Verify clean removal of new resources
3. **Manual Rollback**: Document step-by-step procedures

---

## 6. Risk Assessment and Mitigation

### 6.1 Technical Risks

#### Risk 1: Service Interruption During Network Changes
**Probability**: Low
**Impact**: High (all services offline)
**Scenario**: Traefik configuration error breaks routing

**Mitigation**:
- ✅ Validate Traefik config with `traefik validate` before applying
- ✅ Use graceful reload (HUP signal) instead of restart
- ✅ Backup dynamic_conf.yml before changes
- ✅ Health checks in CI/CD pipeline (curl all URLs)
- ✅ Keep Traefik container running during updates (zero-downtime)

**Contingency**:
- Revert to previous dynamic_conf.yml
- Reload Traefik
- Estimated recovery: <2 minutes

---

#### Risk 2: Proxmox Resource Exhaustion
**Probability**: Low
**Impact**: Medium (performance degradation)
**Scenario**: New app-demo container + Loki + CI/CD runner exceed host capacity

**Current Resources**:
- Total: 12 vCPU, 15 GB RAM
- Proxmox Host Capacity: Unknown (needs verification)

**Mitigation**:
- ✅ Monitor Proxmox resources before adding new container
- ✅ app-demo limited to 2 vCPU, 2 GB RAM
- ✅ Loki limited to 512 MB RAM
- ✅ Gradual rollout (monitor after each addition)
- ✅ Option to reduce resources of utilities container if needed

**Contingency**:
- Reduce utilities container from 6 vCPU to 4 vCPU (still adequate)
- Move CI/CD runner to external machine (cloud VM)
- Estimated adjustment: <10 minutes

---

#### Risk 3: GitHub Actions Runner Connectivity
**Probability**: Medium
**Impact**: High (CI/CD blocked)
**Scenario**: Runner cannot access local network from GitHub cloud

**Challenges**:
- Proxmox infrastructure is on local network (192.168.1.0/24)
- BBox router with NAT
- SSH access requires local network or VPN

**Mitigation**:
- ✅ **Self-Hosted Runner**: Install runner on Proxmox host or dedicated LXC
- ✅ Runner has direct network access to all containers
- ✅ Runner authenticated with SSH keys
- ✅ Alternative: GitHub-hosted runner + Tailscale/Cloudflare Tunnel for secure access

**Contingency**:
- Plan B: Validation-only pipelines (no deployment from GitHub)
- Manual deployment via deploy.sh (existing process)
- Estimated setup: Self-hosted runner ~30 minutes

---

#### Risk 4: Terraform State Corruption
**Probability**: Very Low
**Impact**: Critical (infrastructure unmanageable)
**Scenario**: Concurrent applies corrupt OVH S3 state file

**Mitigation**:
- ✅ State locking enabled (OVH S3 backend supports locking)
- ✅ CI/CD runs sequentially (no parallel applies)
- ✅ Manual applies blocked by state lock
- ✅ Automated state backup before each apply

**Contingency**:
- Restore state from OVH S3 versioned backups
- Terraform import to rebuild state if necessary
- Estimated recovery: <1 hour (with versioned backup)

---

#### Risk 5: SSL Certificate Expiration
**Probability**: Low
**Impact**: Medium (HTTPS inaccessible)
**Scenario**: Let's Encrypt renewal fails due to DNS-01 challenge issue

**Current Setup**:
- Traefik handles automatic renewal
- DNS-01 challenge via OVH API

**Mitigation**:
- ✅ Traefik automatically renews 30 days before expiry
- ✅ Monitor certificate expiration dates (Grafana dashboard)
- ✅ OVH API credentials validated in CI/CD
- ✅ Alert on renewal failures (email/Discord)

**Contingency**:
- Manual renewal via certbot + OVH API
- Fallback: HTTP-01 challenge (requires port 80 forwarding)
- Estimated recovery: <15 minutes

---

### 6.2 Integration Risks

#### Risk 6: Ansible Vault Key Loss
**Probability**: Very Low
**Impact**: Critical (secrets inaccessible)
**Scenario**: Vault password forgotten or lost

**Mitigation**:
- ✅ Password stored in secure password manager (Vaultwarden)
- ✅ Backup of vault password in encrypted note
- ✅ Vault files backed up to OVH S3
- ✅ GitHub Secrets used for CI/CD (no Vault dependency)

**Contingency**:
- Re-encrypt Vault with new password (if old password known)
- Recreate secrets manually from known values
- Estimated recovery: 30 minutes (if secrets documented elsewhere)

---

#### Risk 7: Docker Compose Version Incompatibility
**Probability**: Low
**Impact**: Medium (service startup fails)
**Scenario**: Updated Docker Compose breaks existing compose files

**Mitigation**:
- ✅ Pin Docker Compose version in Ansible (apt install docker-compose-plugin)
- ✅ CI/CD validates compose files (`docker-compose config`)
- ✅ Test compose files locally before deployment

**Contingency**:
- Downgrade Docker Compose to previous version
- Estimated recovery: <5 minutes

---

### 6.3 Operational Risks

#### Risk 8: Backup Failure Goes Unnoticed
**Probability**: Medium
**Impact**: High (no recovery possible)
**Scenario**: Backup script silently fails

**Mitigation**:
- ✅ Backup script sends email/notification on failure
- ✅ Monitoring dashboard shows last successful backup timestamp
- ✅ Monthly backup restoration test (documented)
- ✅ OVH S3 logs backup uploads

**Contingency**:
- Manual backup via Proxmox UI
- Database dumps via ansible playbook
- Estimated recovery: 15 minutes (manual backup)

---

#### Risk 9: Git Secrets Committed Accidentally
**Probability**: Low
**Impact**: High (security breach)
**Scenario**: Developer commits .env or terraform.tfvars with secrets

**Mitigation**:
- ✅ .gitignore configured for sensitive files
- ✅ Pre-commit hooks (git-secrets, detect-secrets)
- ✅ GitHub Actions scan for secrets on PR
- ✅ Secrets stored in Ansible Vault/GitHub Secrets only

**Contingency**:
- Rotate compromised secrets immediately
- Remove secrets from Git history (`git filter-repo`)
- Estimated recovery: 1 hour (secret rotation)

---

#### Risk 10: Documentation Becomes Outdated
**Probability**: Medium
**Impact**: Low (confusion, slower troubleshooting)
**Scenario**: Code changes but docs not updated

**Mitigation**:
- ✅ Documentation as code (Markdown in Git)
- ✅ PR checklist includes "Update docs"
- ✅ Architecture Decision Records (ADRs) for major changes
- ✅ Quarterly documentation review

**Contingency**:
- Schedule documentation sprint
- Estimated effort: 2-4 hours

---

### 6.4 Risk Matrix

| Risk ID | Risk | Probability | Impact | Severity | Mitigation Status |
|---------|------|-------------|--------|----------|-------------------|
| R1 | Service interruption (Traefik) | Low | High | **Medium** | ✅ Mitigated |
| R2 | Resource exhaustion | Low | Medium | **Low** | ✅ Mitigated |
| R3 | GitHub Runner connectivity | Medium | High | **Medium-High** | ✅ Mitigated |
| R4 | Terraform state corruption | Very Low | Critical | **Medium** | ✅ Mitigated |
| R5 | SSL cert expiration | Low | Medium | **Low** | ✅ Mitigated |
| R6 | Vault key loss | Very Low | Critical | **Low** | ✅ Mitigated |
| R7 | Docker Compose incompatibility | Low | Medium | **Low** | ✅ Mitigated |
| R8 | Backup failure unnoticed | Medium | High | **Medium** | 🟡 Needs monitoring |
| R9 | Secrets committed to Git | Low | High | **Medium** | ✅ Mitigated |
| R10 | Outdated documentation | Medium | Low | **Low** | 🟡 Ongoing process |

**Overall Risk Level**: **Low-Medium** (Most risks mitigated with clear contingencies)

---

## 7. Implementation Roadmap

### 7.1 Epic and Story Overview

**Epic**: Transformation Portfolio Infrastructure Professionnelle
**Total Stories**: 14
**Estimated Duration**: 6-8 weeks
**Approach**: Sequential with validation gates

### 7.2 Story Sequence and Dependencies

```
Phase 1: CI/CD Foundation (Week 1)
├─ Story 1.1: GitHub Actions Validation Pipelines (2d)
│  └─ Deliverable: terraform-validate.yml, ansible-lint.yml, security-scan.yml
├─ Story 1.2: Self-Hosted GitHub Runner (1d)
│  └─ Deliverable: Runner on Proxmox, tested connectivity
└─ Story 1.3: Automated Deployment Pipeline (2d)
   └─ Deliverable: deploy-infra.yml with manual approval

Phase 2: Application Infrastructure (Week 2)
├─ Story 1.4: Container app-demo Terraform (1d)
│  └─ Deliverable: terraform/app-demo.tf, container deployed
└─ Story 1.5: Container app-demo Ansible Config (2d)
   └─ Deliverable: roles/app-demo/, Docker installed

Phase 3: Application Development (Weeks 3-4)
├─ Story 1.6: Application Development (Frontend + Backend) (5d)
│  └─ Deliverable: app-demo/ directory, React + API + PostgreSQL
├─ Story 1.7: Traefik Integration (2d)
│  └─ Deliverable: app.oldevops.fr, api.oldevops.fr live
└─ Story 1.8: Application CI/CD Pipeline (3d)
   └─ Deliverable: app-build.yml, app-docker.yml, app-deploy.yml

Phase 4: Observability (Week 5)
├─ Story 1.9: Loki + Promtail Deployment (3d)
│  └─ Deliverable: roles/loki/, roles/promtail/, logs in Grafana
└─ Story 1.10: Grafana Dashboards Versioned (2d)
   └─ Deliverable: 4-5 dashboards as JSON in Git

Phase 5: Operational Excellence (Week 6)
├─ Story 1.11: Backup Automation + DR (3d)
│  └─ Deliverable: roles/backup/, scripts/backup.sh, restoration test
└─ Story 1.12: Security Hardening (2d)
   └─ Deliverable: roles/hardening/, pre-commit hooks, scans passing

Phase 6: Documentation (Week 7-8)
├─ Story 1.13: Architecture Docs + Runbooks (4d)
│  └─ Deliverable: docs/architecture/, docs/runbooks/, ADRs
└─ Story 1.14: README + Portfolio Transformation (3d)
   └─ Deliverable: Updated README, portfolio page, screenshots
```

### 7.3 Critical Path

**Critical Path Stories** (Must complete sequentially):
1. Story 1.2 (GitHub Runner) → Story 1.3 (Deployment Pipeline)
2. Story 1.4 (Terraform) → Story 1.5 (Ansible) → Story 1.6 (App Dev)
3. Story 1.6 (App Dev) → Story 1.7 (Traefik) → Story 1.8 (App CI/CD)

**Parallel Opportunities**:
- Stories 1.9-1.10 (Observability) can start after Story 1.5
- Stories 1.11-1.12 (Ops Excellence) independent of application stories
- Story 1.13-1.14 (Documentation) can start anytime, finalized at end

### 7.4 Milestones

| Milestone | Stories | Target Week | Success Criteria |
|-----------|---------|-------------|------------------|
| M1: CI/CD Operational | 1.1-1.3 | End Week 1 | Pipeline deploys infrastructure automatically |
| M2: App Infrastructure Ready | 1.4-1.5 | End Week 2 | app-demo container running Docker |
| M3: Application Live | 1.6-1.8 | End Week 4 | https://app.oldevops.fr accessible |
| M4: Full Observability | 1.9-1.10 | End Week 5 | Logs centralized, dashboards complete |
| M5: Production-Grade Ops | 1.11-1.12 | End Week 6 | Backups automated, security hardened |
| M6: Portfolio Complete | 1.13-1.14 | End Week 8 | Documentation 100%, README recruiter-ready |

### 7.5 Validation Gates

**After Each Story**:
- ✅ All existing services still accessible (health check)
- ✅ No errors in logs (journalctl, Docker logs)
- ✅ Resource usage within limits (Grafana monitoring)
- ✅ Git commit with meaningful message
- ✅ Documentation updated (if applicable)

**After Each Phase**:
- ✅ Full smoke test (access all services)
- ✅ Backup created (Proxmox snapshots)
- ✅ Demo to stakeholder/self-review
- ✅ Phase summary documented

**Final Validation (Post-Story 1.14)**:
- ✅ All 8 existing services + new app functional
- ✅ CI/CD pipeline end-to-end tested
- ✅ Backup restoration tested successfully
- ✅ Security scans passing (no critical issues)
- ✅ Documentation complete (100% coverage)
- ✅ Portfolio reviewed by external person (recruiter perspective)

### 7.6 Resource Allocation

**Infrastructure**:
- Proxmox host: Continuous availability required
- Development machine: For local testing, application development
- OVH services: S3 bucket (Terraform state + backups), DNS API

**Tools**:
- Terraform v1.0+
- Ansible v2.10+
- Docker CE
- Node.js v18+ (for app development)
- React, TypeScript, Vite

**Accounts**:
- GitHub (with Actions enabled)
- OVH (API credentials for DNS, S3)
- Docker Hub / GitHub Container Registry

### 7.7 Story Prioritization

**Must Have (M)** - Essential for MVP:
- Stories 1.1-1.3 (CI/CD foundation)
- Stories 1.4-1.7 (Application infrastructure + deployment)
- Story 1.11 (Backup - risk mitigation)
- Story 1.14 (README transformation - portfolio goal)

**Should Have (S)** - Highly valuable:
- Story 1.8 (App CI/CD)
- Stories 1.9-1.10 (Observability)
- Story 1.12 (Security)
- Story 1.13 (Documentation)

**Could Have (C)** - Nice to have:
- Advanced dashboards beyond basic set
- Video demo (Story 1.14 VIDEO.md)

### 7.8 Story-by-Story Implementation Guide

#### Story 1.1: GitHub Actions - Pipeline Validation (2 days)

**Prerequisites**: None
**Blocking**: None

**Tasks**:
1. Create `.github/workflows/terraform-validate.yml`
   - Trigger: PR to main
   - Jobs: fmt check, validate, plan, tfsec scan
2. Create `.github/workflows/ansible-lint.yml`
   - Trigger: PR to main
   - Jobs: ansible-lint, syntax-check
3. Create `.github/workflows/security-scan.yml`
   - Trigger: PR to main
   - Jobs: git-secrets, detect-secrets
4. Configure branch protection on `main` (require status checks)
5. Add build status badges to README.md

**Validation**:
- Open test PR, verify all workflows run
- Introduce intentional error, verify workflow fails
- Fix error, verify workflow passes and PR can merge

**Deliverables**:
- 3 GitHub Actions workflow files
- Branch protection configured
- README with badges

---

#### Story 1.2: GitHub Actions - Self-Hosted Runner (1 day)

**Prerequisites**: Story 1.1
**Blocking**: Story 1.3

**Tasks**:
1. Choose runner location (Proxmox host or dedicated LXC VMID 250)
2. Install GitHub Actions runner software
3. Register runner with repository (label: `self-hosted-proxmox`)
4. Configure systemd service for auto-start
5. Install dependencies: Terraform, Ansible, Docker CLI, SSH client
6. Add SSH key for container access
7. Create test workflow to validate connectivity

**Validation**:
- Runner shows as online in GitHub
- Test workflow runs successfully (e.g., `terraform version`)
- Runner can SSH to containers (test: `ssh root@192.168.1.200 echo OK`)

**Deliverables**:
- Self-hosted runner operational
- Test workflow confirming connectivity

---

#### Story 1.3: GitHub Actions - Automated Deployment (2 days)

**Prerequisites**: Story 1.2
**Blocking**: Story 1.8 (App CI/CD depends on this pattern)

**Tasks**:
1. Create `.github/workflows/deploy-infra.yml`
   - Trigger: push to main
   - Environment: production (with manual approval)
2. Workflow steps:
   a. Checkout code
   b. Create Proxmox snapshots (via SSH)
   c. Terraform init + apply
   d. Ansible playbooks execution
   e. Health checks (curl all *.oldevops.fr URLs)
   f. Rollback on failure (restore snapshots)
3. Configure GitHub Secrets:
   - PROXMOX_HOST
   - SSH_PRIVATE_KEY
   - ANSIBLE_VAULT_PASSWORD
4. Test deployment on feature branch
5. Update deploy.sh to indicate manual/CI options

**Validation**:
- Merge trivial change to main (e.g., comment in Terraform)
- Approve deployment in GitHub
- Verify services remain accessible
- Verify GitHub comment with deployment status

**Deliverables**:
- deploy-infra.yml workflow
- GitHub Secrets configured
- Successful end-to-end deployment test

---

#### Story 1.4: Container Application - Terraform (1 day)

**Prerequisites**: Story 1.1 (CI/CD validation helpful)
**Blocking**: Story 1.5, 1.6

**Tasks**:
1. Create `terraform/app-demo.tf`
   - Module: lxc_container
   - VMID: 210
   - Hostname: app-demo
   - IP: 192.168.1.210/24
   - Resources: 2 cores, 2048 MB RAM, 512 MB swap, 20 GB disk
   - Template: Debian 12
   - Unprivileged: false (for Docker)
   - Nesting: true
2. Add output for app-demo IP
3. Terraform plan + apply locally
4. Verify container boots
5. Commit to Git

**Validation**:
- Container appears in Proxmox UI
- Container boots successfully
- SSH access works (`ssh root@192.168.1.210`)
- Existing containers unaffected (verify in monitoring)

**Deliverables**:
- terraform/app-demo.tf
- Container VMID 210 running

---

#### Story 1.5: Container Application - Ansible Config (2 days)

**Prerequisites**: Story 1.4
**Blocking**: Story 1.6, 1.7

**Tasks**:
1. Update `ansible/inventory.ini`:
   ```ini
   [app_demo]
   192.168.1.210
   ```
2. Create role `ansible/roles/app-demo/`
   - tasks/main.yml: Install Docker CE, Docker Compose
   - templates/docker-compose.yml.j2: Placeholder compose file
   - vars/main.yml: Environment variables (DB credentials)
3. Create `ansible/playbooks/app-demo.yml`:
   - Hosts: app_demo
   - Roles: common, app-demo
4. Run playbook: `ansible-playbook -i inventory.ini playbooks/app-demo.yml`
5. Verify Docker works: `ssh root@192.168.1.210 docker run hello-world`
6. Update `deploy.sh` to include app-demo playbook

**Validation**:
- Docker CE installed and running
- Docker Compose available
- Playbook idempotent (can run twice without errors)

**Deliverables**:
- ansible/roles/app-demo/
- ansible/playbooks/app-demo.yml
- Docker operational on 192.168.1.210

---

#### Story 1.6: Application Development (5 days)

**Prerequisites**: Story 1.5
**Blocking**: Story 1.7, 1.8

**Tasks**:
1. Create `app-demo/` directory in repository root
2. Frontend (2 days):
   - Initialize React + TypeScript + Vite
   - Implement demo feature (e.g., Todo List with API integration)
   - Configure environment variables (API URL)
   - Add tests (Jest + React Testing Library)
   - Build: `npm run build` → optimized static files
3. Backend (2 days):
   - Initialize Node.js + Express + TypeScript (or Python + FastAPI)
   - Implement RESTful API (CRUD endpoints)
   - JWT authentication
   - Connect to PostgreSQL
   - Database migrations (Prisma/TypeORM/Alembic)
   - Add tests (Jest/pytest)
4. Docker Compose (1 day):
   - Services: frontend (Nginx), backend, postgres
   - Multi-stage Dockerfile for frontend/backend
   - Health checks
   - Volumes for PostgreSQL persistence
   - Environment variables from .env
5. Local testing: `docker-compose up` and verify app works
6. README in app-demo/ with development instructions

**Validation**:
- App runs locally via docker-compose
- Frontend accessible on http://localhost:3000
- API endpoints respond on http://localhost:5000
- Database persists data across restarts
- Tests pass (npm test, pytest)

**Deliverables**:
- app-demo/frontend/ (React app)
- app-demo/backend/ (API)
- app-demo/docker-compose.yml
- app-demo/README.md

---

#### Story 1.7: Traefik Integration (2 days)

**Prerequisites**: Story 1.6
**Blocking**: Story 1.8

**Tasks**:
1. Update Ansible role `traefik` to add routing for app:
   - Edit `templates/dynamic_conf.yml.j2`
   - Add routers: app-frontend (app.oldevops.fr), app-backend (api.oldevops.fr)
   - Add services pointing to 192.168.1.210:3000, 192.168.1.210:5000
2. Update `app-demo` role to deploy docker-compose.yml:
   - Template with production environment variables
   - Deploy compose file to /opt/app-demo/ on container
   - Start services: `docker-compose up -d`
3. Run Ansible playbooks (traefik + app-demo)
4. Wait for SSL certificates (Let's Encrypt DNS-01)
5. Test URLs:
   - https://app.oldevops.fr
   - https://api.oldevops.fr/health

**Validation**:
- Frontend loads with SSL
- API responds with valid JSON
- SSL certificates issued successfully (check Traefik logs)
- Existing services still accessible

**Deliverables**:
- Updated Traefik routing configuration
- App deployed and accessible publicly
- SSL certificates for app.oldevops.fr, api.oldevops.fr

---

#### Story 1.8: Application CI/CD Pipeline (3 days)

**Prerequisites**: Story 1.3, 1.7
**Blocking**: None (completes application phase)

**Tasks**:
1. Create `.github/workflows/app-build.yml` (PR trigger):
   - Frontend: npm install, lint, test, build
   - Backend: pip/npm install, lint, test
   - Codecov integration (optional)
2. Create `.github/workflows/app-docker.yml` (push to main trigger):
   - Build Docker images (frontend, backend)
   - Tag with Git SHA and version
   - Scan with Trivy (fail on critical CVEs)
   - Push to ghcr.io (GitHub Container Registry)
3. Create `.github/workflows/app-deploy.yml` (manual trigger or push to main):
   - Pull new images from ghcr.io
   - SSH to 192.168.1.210
   - Update docker-compose.yml with new image tags
   - docker-compose up -d (rolling restart)
   - Health checks (curl app/api)
   - Rollback on failure (revert to previous images)
4. Configure GitHub Secrets:
   - GHCR_TOKEN (GitHub PAT)
5. Test full pipeline: Make trivial app change → PR → Merge → Deploy

**Validation**:
- PR triggers build/test workflow
- Merge triggers Docker build + push
- Deployment updates app successfully
- Health checks pass
- Badge added to app-demo/README.md

**Deliverables**:
- 3 GitHub Actions workflows for app
- Automated deployment from Git to production

---

#### Story 1.9: Loki + Promtail (3 days)

**Prerequisites**: Story 1.5 (app-demo container exists)
**Blocking**: Story 1.10

**Tasks**:
1. Create Ansible role `loki`:
   - Deploy Loki via Docker Compose on monitoring container
   - Configuration: retention 7 days, storage on volume
   - Port 3100 (internal only)
2. Create Ansible role `promtail`:
   - Deploy Promtail agent on all 4 containers (proxy, utilities, monitoring, app-demo)
   - Scrape: /var/log/journal (systemd), /var/lib/docker/containers (Docker logs)
   - Send logs to 192.168.1.202:3100
   - Labels: {host, service, level}
3. Update `playbooks/monitoring-advanced.yml`:
   - Apply loki role to monitoring
   - Apply promtail role to all hosts
4. Configure Grafana:
   - Add Loki datasource (http://192.168.1.202:3100)
5. Test log query in Grafana Explore

**Validation**:
- Loki container running on monitoring
- Promtail running on all 4 containers
- Logs visible in Grafana → Explore → Loki
- Query: `{host="app-demo"}` returns logs

**Deliverables**:
- ansible/roles/loki/
- ansible/roles/promtail/
- Loki datasource in Grafana

---

#### Story 1.10: Grafana Dashboards Versioned (2 days)

**Prerequisites**: Story 1.9
**Blocking**: None

**Tasks**:
1. Design dashboards:
   - **Infrastructure Overview**: CPU/RAM/Disk per container (Prometheus)
   - **Service Health**: Uptime, response time, error rates (Prometheus)
   - **Application Metrics**: API latency (p50/p95/p99), throughput (Prometheus)
   - **Log Explorer**: Multi-container logs (Loki)
2. Create dashboards in Grafana UI
3. Export to JSON
4. Store in `ansible/roles/grafana/files/dashboards/`
5. Update Grafana role to auto-provision dashboards:
   - Use Grafana provisioning API or file-based provisioning
6. Redeploy Grafana with versioned dashboards
7. Verify dashboards load with correct data

**Validation**:
- 4 dashboards visible in Grafana
- Data populates correctly (7 days history)
- Dashboards load in <3 seconds
- JSON files in Git

**Deliverables**:
- 4-5 dashboard JSON files
- Updated ansible/roles/grafana/ for provisioning

---

#### Story 1.11: Backup Automation + DR (3 days)

**Prerequisites**: None (independent)
**Blocking**: None

**Tasks**:
1. Create Ansible role `backup`:
   - Deploy script to Proxmox host: `/usr/local/bin/backup-infra.sh`
   - Script actions:
     - Create Proxmox snapshots (all 4 LXCs)
     - Dump databases (PostgreSQL, MySQL via SSH to containers)
     - Export Terraform state from OVH S3
     - Backup Ansible vault files
   - Local storage: /var/backups/infra-oldevops/ (rotation: 7 days)
   - Offsite sync: rsync/rclone to OVH S3 bucket (retention: 30 days)
2. Configure cron job: Daily at 2 AM
3. Create restoration script: `scripts/restore.sh`
4. Write runbook: `docs/runbooks/disaster-recovery.md`
   - Scenarios: Host failure, state corruption, data loss
   - Step-by-step restoration procedures
   - RTO/RPO documentation
5. Test backup: Run script manually, verify files created
6. Test restoration: Restore 1 container snapshot, verify data integrity

**Validation**:
- Backup script runs successfully
- All backup artifacts created (snapshots, dumps, state)
- Offsite backup uploaded to OVH S3
- Restoration test successful (1 container)
- Runbook complete and tested

**Deliverables**:
- ansible/roles/backup/
- scripts/backup.sh, scripts/restore.sh
- docs/runbooks/disaster-recovery.md
- Backup tested and verified

---

#### Story 1.12: Security Hardening (2 days)

**Prerequisites**: Story 1.1 (security scan workflow)
**Blocking**: None

**Tasks**:
1. Enhance `.github/workflows/security-scan.yml`:
   - Add Trivy scan for Docker images
   - Add OWASP Dependency Check (app dependencies)
   - Add Checkov scan (Terraform)
2. Create Ansible role `hardening`:
   - Install UFW, configure firewall rules (whitelist)
   - Install Fail2ban (SSH protection)
   - Disable unused services
   - Configure unattended-upgrades
3. Update Traefik configuration:
   - Enforce TLS 1.3 minimum
   - Add security headers (HSTS, CSP, X-Frame-Options)
   - Configure rate limiting (1000 req/min per IP)
4. Setup pre-commit hooks:
   - Create `.pre-commit-config.yaml`
   - Hooks: detect-secrets, terraform fmt, prettier
   - Install: `pre-commit install`
5. Document security measures in `docs/architecture/security.md`

**Validation**:
- Security scans pass (no critical CVEs)
- Pre-commit hooks prevent bad commits (test by staging .env file)
- UFW rules don't block legitimate traffic
- Fail2ban doesn't block SSH from known IPs
- Security headers present in HTTP responses (curl -I)

**Deliverables**:
- Enhanced security-scan.yml workflow
- ansible/roles/hardening/
- .pre-commit-config.yaml
- docs/architecture/security.md
- All scans passing

---

#### Story 1.13: Architecture Docs + Runbooks (4 days)

**Prerequisites**: All technical stories (1.1-1.12)
**Blocking**: Story 1.14

**Tasks**:
1. Create `docs/architecture/`:
   - `overview.md`: Current + future state architecture (this document!)
   - `network.md`: Network topology, IPs, routing
   - `tech-stack.md`: All technologies with versions
   - `decisions/`: ADRs (Architecture Decision Records)
     - ADR-001: Why LXC instead of VMs
     - ADR-002: Why Traefik instead of Nginx
     - ADR-003: Why GitHub Actions instead of Jenkins
     - ADR-004: Why Node.js vs Python for backend
2. Create `docs/runbooks/`:
   - `deployment.md`: Full deployment procedure
   - `rollback.md`: Rollback by component
   - `troubleshooting.md`: Common issues and solutions
   - `disaster-recovery.md`: (Already created in Story 1.11)
3. Create `docs/guides/`:
   - `getting-started.md`: Onboarding for contributors
   - `local-development.md`: Dev environment setup
   - `contributing.md`: Contribution standards
4. Create diagrams:
   - Network diagram (Mermaid or Draw.io)
   - CI/CD flow (Mermaid)
   - Application architecture (Mermaid)
   - Observability stack (diagram)
5. Standardize document templates (TOC, version, last updated)

**Validation**:
- All documents complete and reviewed
- All internal links work
- Diagrams render correctly on GitHub
- External review (ask colleague to read)

**Deliverables**:
- docs/architecture/ (complete)
- docs/runbooks/ (complete)
- docs/guides/ (complete)
- Architecture diagrams

---

#### Story 1.14: README + Portfolio (3 days)

**Prerequisites**: Story 1.13
**Blocking**: None (Final story!)

**Tasks**:
1. Restructure README.md:
   - Add banner/logo
   - Add badges (build, security, coverage, license)
   - Section: "Overview" (recruiter-oriented)
   - Section: "Architecture" (diagram + link to docs)
   - Section: "Technologies" (with icons/badges)
   - Section: "Services" (table with screenshots)
   - Section: "CI/CD Pipeline" (flow diagram)
   - Section: "Skills Demonstrated" (list for recruiters)
   - Keep technical details minimal (link to docs/)
2. Take professional screenshots:
   - Grafana dashboards
   - GitHub Actions pipelines
   - Application in use
   - Traefik dashboard
   - Store in docs/screenshots/
3. Create `SHOWCASE.md`:
   - Technical skills demonstrated
   - Architectural decisions with justifications
   - Measurable results (deployment time, uptime, performance)
   - Continuous improvement roadmap
4. Add portfolio page to React app (https://app.oldevops.fr/portfolio):
   - Project overview
   - Interactive architecture diagram
   - Live metrics (uptime, response time)
   - Link to GitHub repository
5. Create `docs/VIDEO.md`:
   - Script for 3-5 minute demo video
   - Key points to cover
   - Placeholder for video link (record later)
6. Final review: Check all links, badges, screenshots

**Validation**:
- README concise and recruiter-friendly (<5 min read)
- All badges functional and up-to-date
- Screenshots recent and accurate
- Portfolio page loads and looks professional
- External review (non-technical person can understand)

**Deliverables**:
- Updated README.md (portfolio-focused)
- SHOWCASE.md
- docs/screenshots/ (professional images)
- Portfolio page in app
- docs/VIDEO.md (script)

---

## 8. Architecture Decisions

### 8.1 ADR Template

All major architectural decisions are documented using Architecture Decision Records (ADRs). Each ADR follows this template:

```markdown
# ADR-XXX: [Title]

**Status**: Accepted | Proposed | Deprecated
**Date**: YYYY-MM-DD
**Authors**: [Name]

## Context
[What is the issue we're facing? What factors are relevant?]

## Decision
[What is the change we're proposing/enacting?]

## Rationale
[Why did we choose this solution? What alternatives did we consider?]

## Consequences
[What becomes easier or harder to do because of this change?]

## Implementation
[How will this decision be implemented?]
```

### 8.2 Key Architecture Decisions

#### ADR-001: LXC Containers Instead of Full VMs

**Status**: Accepted (Existing Infrastructure)
**Date**: 2025 (Pre-project)

**Context**:
- Need lightweight containerization on Proxmox
- Trade-off between isolation (VMs) and resource efficiency (containers)
- Docker services require nested containerization

**Decision**:
- Use LXC containers (privileged mode with nesting enabled)
- Not Proxmox VMs or bare-metal

**Rationale**:
- **Resource Efficiency**: LXC uses 10-20% less RAM than VMs
- **Fast Provisioning**: LXC boots in <5 seconds vs ~30 seconds for VMs
- **Docker Support**: Nesting allows Docker-in-LXC (not possible in unprivileged mode)
- **Sufficient Isolation**: For homelab/portfolio, full VM isolation not required

**Alternatives Considered**:
- Full VMs: Too resource-heavy (15GB RAM → 30GB+ with VMs)
- Unprivileged LXC: Docker doesn't work reliably
- Bare-metal: No isolation, harder rollback

**Consequences**:
- ✅ Lower resource usage
- ✅ Fast deployment
- ⚠️ Privileged containers have security trade-offs (acceptable for homelab)
- ⚠️ Less isolation than VMs (mitigated by network segmentation)

---

#### ADR-002: Traefik v3 Instead of Nginx

**Status**: Accepted (Existing Infrastructure)
**Date**: 2025 (Pre-project)

**Context**:
- Need reverse proxy with automatic SSL
- Services distributed across multiple LXC containers
- Let's Encrypt DNS-01 challenge required (no port 80 publicly exposed)

**Decision**:
- Use Traefik v3 with file provider for routing

**Rationale**:
- **Automatic SSL**: Native Let's Encrypt integration (ACME)
- **DNS-01 Support**: OVH DNS provider built-in
- **Dynamic Configuration**: File provider allows multi-LXC routing without Docker socket access
- **Modern**: Better for microservices vs Nginx

**Alternatives Considered**:
- Nginx + Certbot: Manual SSL management, no dynamic config
- HAProxy: No native Let's Encrypt support
- Caddy: Less mature, fewer integrations

**Consequences**:
- ✅ Zero-touch SSL renewal
- ✅ Easy addition of new services (edit YAML file)
- ⚠️ Learning curve (Traefik config is complex)
- ⚠️ File provider less efficient than Docker provider (acceptable for <20 services)

---

#### ADR-003: GitHub Actions Instead of Jenkins/GitLab CI

**Status**: Accepted
**Date**: 2026-01-07

**Context**:
- Need CI/CD pipeline for portfolio showcase
- Self-hosted infrastructure (local network)
- Limited resources (no dedicated CI/CD server)

**Decision**:
- Use GitHub Actions with self-hosted runner

**Rationale**:
- **Portfolio Visibility**: GitHub Actions pipelines visible to recruiters (public repo)
- **No Infrastructure**: Hosted service, minimal setup
- **Self-Hosted Runner**: Solves local network access issue
- **Native Integration**: Built into GitHub (version control + CI/CD)
- **Free Tier**: Unlimited minutes for self-hosted runners

**Alternatives Considered**:
- **Jenkins**: Requires dedicated server (512MB+ RAM), complex setup, not visible to recruiters
- **GitLab CI**: Would require moving Git repo, less recruiter visibility
- **Drone CI**: Less mature, fewer integrations
- **Ansible Tower/AWX**: Overkill for this use case

**Consequences**:
- ✅ Professional CI/CD visible on GitHub profile
- ✅ Minimal resource overhead (runner on Proxmox host)
- ✅ Easy to showcase in portfolio
- ⚠️ Self-hosted runner required for local network access
- ⚠️ GitHub lock-in (mitigated: can switch to GitLab CI later)

---

#### ADR-004: React + Node.js Instead of Alternatives

**Status**: Accepted
**Date**: 2026-01-07

**Context**:
- Need modern web application for demo
- Must demonstrate full-stack skills
- Should be recruiter-friendly (common stack)

**Decision**:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript (Alternative: Python + FastAPI)

**Rationale**:
- **React**: Industry standard, most job postings require React experience
- **TypeScript**: Shows modern JavaScript knowledge, type safety
- **Vite**: Modern build tool, faster than Webpack/CRA
- **Node.js**: Full JavaScript stack (shared types), high performance
- **Express**: Simple, well-documented, recruiter-recognizable

**Alternatives Considered**:
- **Vue.js**: Less common in job postings
- **Angular**: More complex, overkill for demo
- **Python FastAPI**: Valid alternative, modern API framework
- **Go/Rust backend**: Impressive but less relevant for DevOps portfolio (focus should be infrastructure, not backend language)

**Consequences**:
- ✅ Demonstrates mainstream skills
- ✅ TypeScript shows advanced JavaScript knowledge
- ✅ Single language (JS) for frontend + backend simplifies CI/CD
- ⚠️ Node.js backend is common (less "impressive" than Go/Rust)
  - **Mitigation**: Focus on deployment/infrastructure, not language choice

---

#### ADR-005: Loki Instead of ELK Stack

**Status**: Accepted
**Date**: 2026-01-07

**Context**:
- Need centralized logging for observability
- Limited resources (monitoring container already running 4 services)
- Must integrate with Grafana

**Decision**:
- Use Loki + Promtail instead of ELK Stack

**Rationale**:
- **Lightweight**: Loki uses 512MB RAM vs Elasticsearch 2-4GB
- **Grafana Native**: Native integration (same datasource model as Prometheus)
- **LogQL**: Query language similar to PromQL (consistency)
- **Prometheus-like**: Indexes labels, not full-text (trade-off accepted)
- **Cost**: Free and open-source (Elasticsearch licensing complex)

**Alternatives Considered**:
- **ELK (Elasticsearch, Logstash, Kibana)**: Too resource-heavy (4-6GB RAM), complex setup
- **Graylog**: Less integration with Grafana
- **Fluentd + Elasticsearch**: Still requires Elasticsearch (resource issue)

**Consequences**:
- ✅ Minimal resource overhead
- ✅ Unified observability (metrics + logs in Grafana)
- ⚠️ Limited full-text search (Loki indexes labels only)
  - **Acceptable**: For this use case, label-based queries sufficient
- ⚠️ Less powerful than Elasticsearch (trade-off for resource savings)

---

#### ADR-006: Self-Hosted Runner vs Cloud CI/CD

**Status**: Accepted
**Date**: 2026-01-07

**Context**:
- Infrastructure is on local network (192.168.1.0/24) behind NAT
- GitHub Actions runners by default run in cloud (no local network access)
- Need CI/CD to deploy to local Proxmox infrastructure

**Decision**:
- Use self-hosted GitHub Actions runner on Proxmox host or dedicated LXC

**Rationale**:
- **Direct Access**: Runner on local network can SSH to containers
- **Security**: No need to expose SSH/Proxmox API to internet
- **Free**: No GitHub Actions minutes consumed (unlimited for self-hosted)
- **Control**: Can install required tools (Terraform, Ansible)

**Alternatives Considered**:
- **GitHub-hosted + VPN/Tunnel**:
  - Option: Tailscale, Cloudflare Tunnel, WireGuard
  - **Rejected**: Adds complexity, external dependency, potential security risk
- **GitHub-hosted + Public SSH**:
  - **Rejected**: Exposes infrastructure to internet (security risk)
- **External CI/CD (Jenkins on cloud VM)**:
  - **Rejected**: Costs money, defeats purpose of homelab portfolio

**Consequences**:
- ✅ Secure (no public exposure)
- ✅ Free (no cloud costs)
- ✅ Fast (local network, no tunnel latency)
- ⚠️ Runner maintenance required (updates, monitoring)
- ⚠️ Single point of failure (if Proxmox host down, CI/CD fails)
  - **Acceptable**: Homelab infrastructure, not production

---

#### ADR-007: Monorepo vs Multi-Repo

**Status**: Accepted
**Date**: 2026-01-07

**Context**:
- Infrastructure code (Terraform, Ansible) and application code (React, API)
- Need CI/CD pipelines for both
- Consideration: single repo vs separate repos

**Decision**:
- Use monorepo approach (all code in `infra-oldevops` repository)

**Rationale**:
- **Simplicity**: Single repo to clone, single CI/CD setup
- **Cohesion**: Infrastructure and application are tightly coupled (demo application exists to showcase infrastructure)
- **Portfolio**: Easier for recruiters to navigate (one GitHub link)
- **Atomic Changes**: Infrastructure and app changes can be in same PR

**Alternatives Considered**:
- **Multi-Repo**: Separate repos for infrastructure and application
  - **Rejected**: Overhead of managing 2 repos, 2 CI/CD setups, coordination of changes

**Consequences**:
- ✅ Single source of truth
- ✅ Easier CI/CD (single .github/workflows/ directory)
- ✅ Better portfolio presentation
- ⚠️ Larger repository (acceptable for this scale)
- ⚠️ Shared CI/CD workflows (infrastructure + app in same pipeline)
  - **Mitigation**: Use path filters in GitHub Actions (trigger infra workflows only on terraform/ changes)

---

#### ADR-008: Ansible Vault vs External Secrets Manager

**Status**: Accepted (Existing), Extended
**Date**: 2026-01-07

**Context**:
- Need secure secret storage for Ansible (API keys, passwords)
- Options: Ansible Vault, HashiCorp Vault, AWS Secrets Manager, plain files

**Decision**:
- Continue using Ansible Vault for infrastructure secrets
- Use GitHub Secrets for CI/CD secrets

**Rationale**:
- **Ansible Vault**:
  - Simple, built-in, no external dependencies
  - Encrypted files in Git (secure if password managed properly)
  - Sufficient for homelab scale
- **GitHub Secrets**:
  - Native GitHub Actions integration
  - No need to pass Ansible Vault password to all workflows
  - Separation of concerns (CI/CD secrets separate from infra secrets)

**Alternatives Considered**:
- **HashiCorp Vault**:
  - **Rejected**: Requires dedicated server (512MB+ RAM), complex setup, overkill for homelab
- **AWS/Azure Secrets Manager**:
  - **Rejected**: External cloud dependency, costs money
- **Plain .env files**:
  - **Rejected**: Security risk if accidentally committed

**Consequences**:
- ✅ No external dependencies
- ✅ Encrypted at rest (Ansible Vault)
- ✅ Separation: Infra secrets (Vault) vs CI/CD secrets (GitHub)
- ⚠️ Vault password is single point of failure
  - **Mitigation**: Stored in secure password manager (Vaultwarden)
- ⚠️ Manual secret rotation (no auto-rotation)
  - **Acceptable**: Homelab, secrets rotated quarterly

---

### 8.3 Architecture Decision Process

**When to Create an ADR**:
1. Significant technology choice (database, framework, tool)
2. Architectural pattern change (monolith → microservices)
3. Infrastructure decision with long-term impact
4. Trade-offs between alternatives (document reasoning)

**ADR Workflow**:
1. Propose ADR in PR (docs/architecture/decisions/ADR-XXX-title.md)
2. Discuss in PR comments
3. Refine based on feedback
4. Merge when accepted
5. Implement decision
6. Reference ADR in relevant code/docs

**ADR Storage**:
- Location: `docs/architecture/decisions/`
- Format: Markdown
- Naming: `ADR-001-title-in-kebab-case.md`
- Status: Proposed → Accepted → Deprecated (if replaced)

---

## 9. Conclusion

### 9.1 Summary

This brownfield architecture document provides a comprehensive blueprint for transforming an existing homelab infrastructure into a professional DevOps portfolio. The project enhances operational capabilities while preserving 100% of existing services through incremental, risk-mitigated deployment.

**Key Takeaways**:
- **Brownfield Approach**: Additive enhancement, not replacement
- **Zero Downtime**: Existing services remain operational throughout
- **Portfolio Focus**: Every enhancement demonstrates recruiter-relevant skills
- **Risk Management**: Comprehensive mitigation strategies for all identified risks
- **Incremental Delivery**: 14 stories across 6 phases over 6-8 weeks

### 9.2 Success Metrics

**Technical Metrics**:
- ✅ 100% uptime of existing services during migration
- ✅ CI/CD pipeline deployment time <10 minutes
- ✅ Zero critical security vulnerabilities (CVSS ≥9.0)
- ✅ Backup restoration RTO <30 minutes
- ✅ 100% documentation coverage

**Portfolio Metrics**:
- ✅ Professional README with architecture diagrams
- ✅ Live demo application accessible (https://app.oldevops.fr)
- ✅ Comprehensive GitHub profile (Actions pipelines visible)
- ✅ Measurable results (deployment time, uptime, performance)

### 9.3 Future Enhancements (Post-MVP)

**Potential Future Stories**:
1. **Network Segmentation**: VLANs for DMZ/Backend/Monitoring zones
2. **High Availability**: Multi-node Proxmox cluster, service replication
3. **Kubernetes**: Migrate from Docker Compose to K3s (overkill for current scale)
4. **Infrastructure Testing**: Terratest, Kitchen-Terraform, Molecule (Ansible)
5. **Observability**: Distributed tracing with Tempo (if microservices expand)
6. **Cost Monitoring**: Track resource usage, simulate cloud costs

### 9.4 Lessons Learned (To Be Updated Post-Implementation)

This section will be filled in after completing the implementation:
- What went well?
- What challenges were encountered?
- What would we do differently?
- Recommendations for future brownfield projects

### 9.5 References

**Documentation**:
- PRD: `/docs/prd.md`
- Current README: `/README.md`
- Maintenance Log: `/MAINTENANCE.md`

**External Resources**:
- Terraform Proxmox Provider: https://registry.terraform.io/providers/Telmate/proxmox
- Traefik Documentation: https://doc.traefik.io/traefik/
- Ansible Best Practices: https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html
- GitHub Actions Documentation: https://docs.github.com/en/actions
- Loki Documentation: https://grafana.com/docs/loki/latest/

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Next Review**: After Phase 1 completion
**Status**: ✅ Ready for Implementation

---

**Prepared by**: DevOps Architecture Team
**Reviewed by**: [Pending Review]
**Approved by**: [Pending Approval]
