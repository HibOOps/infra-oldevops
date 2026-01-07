# Architecture Documentation - Quick Reference

**Project**: Infra-OlDevOps Professional Portfolio Transformation
**Version**: 1.0
**Date**: 2026-01-07

---

## Document Index

This directory contains comprehensive architecture documentation for the brownfield transformation of the Infra-OlDevOps homelab infrastructure.

### Core Documents

| Document | Description | Audience | Read Time |
|----------|-------------|----------|-----------|
| **[Brownfield Architecture Overview](brownfield-architecture-overview.md)** | Complete architecture guide covering current state, future state, migration strategy, risks, and implementation roadmap | All stakeholders | 45-60 min |
| **[Current State Detailed](current-state-detailed.md)** | In-depth analysis of existing infrastructure, services, and capabilities | Technical team, DevOps | 30-40 min |
| **[Architecture Diagrams](architecture-diagrams.md)** | Visual Mermaid diagrams for network, services, CI/CD, and observability | All stakeholders | 15-20 min |

### Supporting Documents (To Be Created)

| Document | Description | Story Reference |
|----------|-------------|-----------------|
| `decisions/ADR-001-lxc-vs-vms.md` | ADR: LXC containers vs VMs | Pre-project |
| `decisions/ADR-002-traefik-vs-nginx.md` | ADR: Traefik vs Nginx/HAProxy | Pre-project |
| `decisions/ADR-003-github-actions.md` | ADR: GitHub Actions vs Jenkins/GitLab CI | Story 1.1-1.3 |
| `decisions/ADR-004-react-nodejs.md` | ADR: React + Node.js stack | Story 1.6 |
| `decisions/ADR-005-loki-vs-elk.md` | ADR: Loki vs ELK Stack | Story 1.9 |
| `decisions/ADR-006-self-hosted-runner.md` | ADR: Self-hosted vs cloud runner | Story 1.2 |
| `security.md` | Security architecture and threat model | Story 1.12 |
| `network.md` | Detailed network topology and segmentation | Story 1.8 (future) |
| `tech-stack.md` | Complete technology inventory with versions | Story 1.13 |

---

## Quick Navigation

### For Recruiters / Non-Technical Stakeholders

**Start here**: [Brownfield Architecture Overview](brownfield-architecture-overview.md)
- Read: Executive Summary (Section 1)
- Read: Success Criteria (Section 1.3)
- Skim: Current vs Future State (Sections 2-3)
- View: [Architecture Diagrams](architecture-diagrams.md)

**Key Questions Answered**:
- What skills does this project demonstrate?
- What technologies are used?
- How complex is the infrastructure?
- What DevOps practices are implemented?

---

### For Technical Reviewers / DevOps Engineers

**Start here**: [Current State Detailed](current-state-detailed.md)
- Read: Infrastructure Inventory (Section 1)
- Read: Service Architecture (Section 3)
- Read: Current Limitations (Section 8)

**Then**: [Brownfield Architecture Overview](brownfield-architecture-overview.md)
- Read: Future State Architecture (Section 3)
- Read: Migration Strategy (Section 5)
- Read: Risk Assessment (Section 6)

**Finally**: [Architecture Diagrams](architecture-diagrams.md)
- View: CI/CD Pipeline (Section 5)
- View: Observability Stack (Section 6)

**Key Questions Answered**:
- How is the infrastructure currently deployed?
- What changes are being made?
- How will migration be performed safely?
- What are the technical risks?

---

### For Implementation Team

**Phase-by-Phase Guide**:

**Before Starting**:
1. Read: [Brownfield Architecture Overview](brownfield-architecture-overview.md) - Section 7 (Implementation Roadmap)
2. Read: [Current State Detailed](current-state-detailed.md) - Section 9 (Assessment)

**Phase 1: CI/CD Foundation (Week 1)**
- Reference: Brownfield Overview - Section 7.8 (Stories 1.1-1.3)
- Reference: Architecture Diagrams - Section 5 (CI/CD Pipeline)
- Deliverable: GitHub Actions workflows functional

**Phase 2: Application Infrastructure (Week 2)**
- Reference: Brownfield Overview - Section 7.8 (Stories 1.4-1.5)
- Reference: Architecture Diagrams - Section 3 (Future State Network)
- Deliverable: app-demo container deployed

**Phase 3: Application Development (Weeks 3-4)**
- Reference: Brownfield Overview - Section 7.8 (Stories 1.6-1.8)
- Reference: Architecture Diagrams - Section 4 (Future State Services)
- Deliverable: Full-stack app live

**Phase 4: Observability (Week 5)**
- Reference: Brownfield Overview - Section 7.8 (Stories 1.9-1.10)
- Reference: Architecture Diagrams - Section 6 (Observability Stack)
- Deliverable: Loki + dashboards

**Phase 5: Operational Excellence (Week 6)**
- Reference: Brownfield Overview - Section 7.8 (Stories 1.11-1.12)
- Reference: Architecture Diagrams - Section 10 (Backup Flow)
- Deliverable: Backups + security hardening

**Phase 6: Documentation (Weeks 7-8)**
- Reference: Brownfield Overview - Section 7.8 (Stories 1.13-1.14)
- Create: ADRs, runbooks, portfolio materials
- Deliverable: Complete documentation

---

## Architecture at a Glance

### Current State (As-Is)

**Infrastructure**:
- 3 LXC containers on Proxmox VE
- 12 vCPU, 15 GB RAM, 98 GB Disk
- 8 services running (Traefik, Vaultwarden, Snipe-IT, NetBox, Uptime Kuma, Zabbix, Prometheus, Grafana)

**Deployment**:
- Terraform + Ansible (Infrastructure-as-Code)
- Manual deployment via deploy.sh
- Terraform state in OVH S3

**Capabilities**:
- ✅ Automated infrastructure provisioning
- ✅ Service monitoring (Prometheus, Grafana)
- ✅ SSL automation (Let's Encrypt)
- ❌ No CI/CD pipeline
- ❌ No centralized logging
- ❌ No automated backups
- ❌ Limited security hardening

---

### Future State (To-Be)

**Infrastructure**:
- 4 LXC containers (+ app-demo)
- 14 vCPU, 17 GB RAM, 118 GB Disk
- 11 services (existing + React app + Loki)

**Deployment**:
- GitHub Actions CI/CD (automated)
- Self-hosted runner on Proxmox
- Zero-downtime deployments
- Automated rollback on failure

**New Capabilities**:
- ✅ Full CI/CD pipeline (validate, build, test, deploy)
- ✅ Demo application (React + Node.js + PostgreSQL)
- ✅ Centralized logging (Loki + Promtail)
- ✅ Versioned Grafana dashboards
- ✅ Automated backups (daily snapshots + offsite)
- ✅ Security scanning (Trivy, tfsec, OWASP)
- ✅ Professional documentation (architecture, runbooks, ADRs)

---

## Key Metrics

### Resource Allocation

| Container | Current Resources | Future Resources | Change |
|-----------|-------------------|------------------|--------|
| proxy | 2C / 1GB / 8GB | 2C / 1GB / 8GB | No change |
| utilities | 6C / 8GB / 40GB | 6C / 8GB / 40GB | No change |
| monitoring | 4C / 6GB / 50GB | 4C / 6GB / 50GB | No change |
| app-demo | - | 2C / 2GB / 20GB | **NEW** |
| **Total** | 12C / 15GB / 98GB | 14C / 17GB / 118GB | +2C / +2GB / +20GB |

### Service Inventory

| Category | Current | Future | New Services |
|----------|---------|--------|--------------|
| Infrastructure | 1 (Traefik) | 1 (Traefik) | - |
| Business Apps | 3 (Vault, Snipe, NetBox) | 3 | - |
| Monitoring | 4 (Zabbix, Kuma, Prom, Graf) | 5 | +Loki |
| Demo App | 0 | 3 | +React, +API, +PostgreSQL |
| **Total** | 8 | 12 | +4 |

### Implementation Timeline

| Phase | Duration | Stories | Key Deliverables |
|-------|----------|---------|------------------|
| Phase 1 | 1 week | 1.1-1.3 | CI/CD pipelines |
| Phase 2 | 1 week | 1.4-1.5 | app-demo container |
| Phase 3 | 2 weeks | 1.6-1.8 | Full-stack application |
| Phase 4 | 1 week | 1.9-1.10 | Observability |
| Phase 5 | 1 week | 1.11-1.12 | Backups + security |
| Phase 6 | 2 weeks | 1.13-1.14 | Documentation |
| **Total** | **8 weeks** | **14 stories** | Production-ready portfolio |

---

## Technology Stack

### Infrastructure
- **Hypervisor**: Proxmox VE
- **Containers**: LXC (Debian 12)
- **IaC**: Terraform v1.0+, Ansible v2.10+
- **Networking**: Traefik v3, OVH DNS
- **State Management**: OVH S3

### CI/CD
- **Pipeline**: GitHub Actions
- **Runner**: Self-hosted (Proxmox)
- **Testing**: Terraform validate, ansible-lint, tfsec
- **Security**: Trivy, OWASP, git-secrets

### Application (New)
- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker Compose

### Observability
- **Metrics**: Prometheus, Grafana
- **Logging**: Loki, Promtail (new)
- **Monitoring**: Zabbix, Uptime Kuma
- **Dashboards**: Grafana (versioned as code)

### Security
- **SSL**: Let's Encrypt (DNS-01 via OVH)
- **Secrets**: Ansible Vault, GitHub Secrets
- **Firewall**: UFW (new)
- **Intrusion Prevention**: Fail2ban (new)
- **Scanning**: Trivy, tfsec, OWASP (new)

---

## Success Criteria Checklist

### Technical Excellence
- [ ] 100% service uptime during migration
- [ ] CI/CD pipeline <10 min end-to-end
- [ ] Zero critical CVEs (CVSS ≥9.0)
- [ ] Backup restoration <30 min
- [ ] 100% documentation coverage

### Portfolio Goals
- [ ] Professional README with badges/diagrams
- [ ] Live demo app (https://app.oldevops.fr)
- [ ] GitHub Actions pipelines visible
- [ ] Architecture documentation complete
- [ ] Measurable results documented

### DevOps Skills Demonstrated
- [x] Infrastructure-as-Code (Terraform, Ansible)
- [ ] CI/CD Pipelines (GitHub Actions)
- [ ] GitOps (Automated deployment)
- [ ] Full-Stack Development (React + API)
- [ ] Observability (Prometheus, Loki, Grafana)
- [ ] Security (Scanning, hardening, secrets management)
- [ ] Disaster Recovery (Automated backups, tested restoration)
- [ ] Professional Documentation (Architecture, runbooks, ADRs)

---

## Risk Management

### Overall Risk Level: **Low-Medium**

**Top 5 Risks**:
1. ⚠️ GitHub Runner connectivity (Medium) - **Mitigation**: Self-hosted runner
2. ⚠️ Service interruption during Traefik changes (Medium) - **Mitigation**: Config validation, graceful reload
3. ⚠️ Proxmox resource exhaustion (Low) - **Mitigation**: Resource monitoring, gradual rollout
4. ⚠️ Terraform state corruption (Low) - **Mitigation**: State locking, automated backups
5. ⚠️ Backup failure unnoticed (Medium) - **Mitigation**: Monitoring, alerts

**All Risks Documented**: See [Brownfield Overview](brownfield-architecture-overview.md) - Section 6

---

## Architecture Decisions (ADRs)

**Key Decisions**:
1. **LXC vs VMs**: LXC chosen for resource efficiency
2. **Traefik vs Nginx**: Traefik chosen for automatic SSL + file provider
3. **GitHub Actions vs Jenkins**: GitHub Actions chosen for portfolio visibility
4. **React + Node.js**: Mainstream stack for recruiter appeal
5. **Loki vs ELK**: Loki chosen for resource efficiency
6. **Self-Hosted Runner**: Chosen for local network access + security
7. **Monorepo**: Single repo for infrastructure + application

**All ADRs**: See [Brownfield Overview](brownfield-architecture-overview.md) - Section 8

---

## Getting Started

### Prerequisites
1. Read [Brownfield Architecture Overview](brownfield-architecture-overview.md)
2. Verify Proxmox host has sufficient resources (+2 vCPU, +2GB RAM)
3. Create Proxmox snapshots of all containers (backup before changes)
4. Ensure GitHub account and OVH credentials are ready

### Next Steps
1. **Immediate**: Review architecture documents
2. **Week 1**: Implement Phase 1 (CI/CD Foundation)
3. **Week 2-4**: Implement application infrastructure and development
4. **Week 5-6**: Add observability and operational excellence
5. **Week 7-8**: Complete documentation and portfolio

---

## Document Maintenance

### Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-07 | Architecture Team | Initial architecture documentation |

### Review Schedule
- **After Phase 1**: Update diagrams, validate assumptions
- **After Phase 3**: Update service architecture with app-demo
- **After Phase 6**: Final documentation review
- **Quarterly**: Architecture review and updates

### Document Owners
- **Brownfield Overview**: Architecture Team
- **Current State**: DevOps Team
- **Diagrams**: Architecture Team
- **ADRs**: Technical Lead (per decision)

---

## Questions?

### For Architecture Questions
- Review: [Brownfield Architecture Overview](brownfield-architecture-overview.md)
- Reference: [Architecture Diagrams](architecture-diagrams.md)
- Contact: Architecture Team

### For Current State Questions
- Review: [Current State Detailed](current-state-detailed.md)
- Reference: Repository (terraform/, ansible/)
- Contact: DevOps Team

### For Implementation Questions
- Review: Implementation Roadmap (Brownfield Overview - Section 7)
- Reference: Story-by-Story Guide (Section 7.8)
- Contact: Implementation Team

---

**Document Status**: ✅ Ready for Review and Implementation
**Last Updated**: 2026-01-07
**Next Review**: After Phase 1 completion (Week 1)

---

**Prepared by**: DevOps Architecture Team
**Project**: Infra-OlDevOps Professional Portfolio Transformation
**Version**: 1.0
