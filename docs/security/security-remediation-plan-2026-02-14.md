# Security Remediation Plan

**Project:** Infra-OlDevOps
**Document Date:** 2026-02-14
**Last Updated:** 2026-03-31
**Prepared By:** Infrastructure Validation Task (BMad Platform Engineering)
**Status:** Active — Partially Remediated
**Review Cycle:** Monthly

---

## Executive Summary

This security remediation plan addresses critical security gaps identified during comprehensive infrastructure validation of the Infra-OlDevOps homelab environment. While this is a homelab environment, several identified risks require immediate attention to prevent potential security incidents and data loss.

### Key Findings

**Current Security Posture:** 🟡 **MEDIUM RISK** (Security Maturity Level 2/5 - Developing)
*(Updated 2026-03-31 — was 🔴 HIGH RISK at initial assessment)*

**Critical Issues Status (2026-03-31):**
- ~~**4 Critical-severity risks**~~ → **2 RESOLVED** (CRIT-003 Backup ✅, CRIT-004 Traefik ✅)
- **2 Critical-severity risks** still requiring attention (CRIT-001, CRIT-002)
- **1 High-severity risk** requiring remediation (HIGH-001)
- **2 Medium-severity risks** acceptable with mitigation
- **1 Low-severity risk** (acceptable for homelab context)

**Overall Compliance:** ~45% against infrastructure security checklist *(was 15% at 2026-02-14)*

**Estimated Remediation Timeline:** 2-4 weeks remaining to achieve security baseline

**Budget Impact:** Minimal - mostly configuration changes and documentation

---

## Current State Assessment

### Infrastructure Overview

**Platform:** Proxmox VE with LXC containers
**Containers (updated 2026-03-31):**
- Container 200 / `192.168.1.200` (proxy): ✅ **Deployed** — Traefik operational, SSL via Let's Encrypt, routing demo.oldevops.fr *(was "Planned, not deployed" at 2026-02-14)*
- Container 201 / `192.168.1.201` (utilities): ✅ **Deployed** — Snipe-IT, Vaultwarden, NetBox operational *(was "Unreachable" at 2026-02-14)*
- Container 202 / `192.168.1.202` (monitoring): ✅ Fully operational — Prometheus, Grafana, Loki, Alertmanager, Uptime Kuma
- Container 210 / `192.168.1.210` (ci_runner): ✅ Operational — GitHub Actions self-hosted runner
- Container 250 / `192.168.1.250` (app_demo): ✅ Deployed — PriceSync (React + API + PostgreSQL), **unprivileged LXC**

**Services Deployed:**
- Monitoring: Prometheus, Alertmanager, Grafana, Loki, Uptime Kuma (all on .202)
- Utilities: Vaultwarden, Snipe-IT, NetBox (on .201)
- Proxy: Traefik + Let's Encrypt (on .200)
- Application: PriceSync demo app at https://demo.oldevops.fr (on .250)
- CI/CD: GitHub Actions runner (on .210)

### Security Controls Inventory

**Implemented Controls (updated 2026-03-31):**
✅ Non-root service users (Loki, Grafana, Prometheus)
✅ Ansible Vault for secrets management (basic)
✅ TLS for external traffic via Traefik + Let's Encrypt *(operational since Story 1.7)*
✅ Log aggregation infrastructure (Loki + Promtail deployed on all LXC)
✅ Centralized reverse proxy with SSL (Traefik on .200) *(new since 2026-02-14)*
✅ Backup and disaster recovery automation *(Story 1.11 Done)*
✅ Security scanning in CI/CD pipeline (Trivy) *(Story 1.12 Done)*
✅ Container hardening (UFW, SSH key-only, non-root) *(Story 1.12 Done)*
✅ app_demo container unprivileged (LXC .250)

**Remaining Missing Controls:**
❌ Least privilege access — other LXC containers still privileged (.200, .201, .202, .210)
❌ Security audit logging (auditd not deployed — ST-002 pending)
❌ Container isolation (privileged mode on .200/.201/.202/.210) — MT-001 pending
❌ Data-at-rest encryption (accepted for homelab — MED-002)
✅ Vault password sécurisé — `.vault_pass` chiffré (IM-001 resolved)
❌ Incident response procedures (formal IR plan not documented)

---

## Risk Register

### Critical Risks (Risk Score: 16-25)

#### CRIT-001: Lateral Movement After Container Compromise
- **Risk Score:** 20 (Likelihood: 4 × Impact: 5)
- **Description:** Privileged container mode with nesting enabled allows container escape to Proxmox host, compromising entire infrastructure
- **Attack Vector:** Exploit vulnerability in any service → shell access → privilege escalation → container escape → full infrastructure compromise
- **Business Impact:** Complete infrastructure compromise, data loss, service unavailability
- **Current Mitigation:** None
- **Target Mitigation:** Convert to unprivileged containers, disable nesting, implement AppArmor profiles

#### CRIT-002: No Security Audit Trail
- **Risk Score:** 20 (Likelihood: 5 × Impact: 4)
- **Description:** No centralized authentication or access logging prevents detection and investigation of security incidents
- **Attack Vector:** Any unauthorized access goes undetected, no forensic capability
- **Business Impact:** Cannot detect breaches, no incident investigation capability, compliance failure
- **Current Mitigation:** Basic application logs collected by Loki
- **Target Mitigation:** Centralized auth logging, auditd deployment, security dashboards

#### ~~CRIT-003: Data Loss from No Backups~~ — ✅ RESOLVED (2026-03-31)
- **Risk Score at closure:** 20 → **0**
- **Resolution:** Story 1.11 (Backup et Disaster Recovery Automation) completed
- **Implemented:** Automated backup solution with restore testing, RPO/RTO validated (<30 min)
- **Residual Risk:** None — backup monitoring operational

#### ~~CRIT-004: Missing Traefik Deployment~~ — ✅ RESOLVED (2026-03-31)
- **Risk Score at closure:** 20 → **0**
- **Resolution:** Story 1.7 (Application de Démonstration - Intégration Traefik) completed
- **Implemented:** Traefik deployed on container .200, Let's Encrypt SSL, routing all services via *.oldevops.fr, HTTPS enforced
- **Residual Risk:** Rate limiting and centralized authentication (Authelia) deferred to LT-001

### High Risks (Risk Score: 10-15)

#### HIGH-001: Ansible Vault Password in Repository
- **Risk Score:** 10 (Likelihood: 2 × Impact: 5)
- **Description:** `.vault_pass` file stored in git repository means anyone with repo access can decrypt all secrets
- **Attack Vector:** Repository access (intentional or accidental public exposure) → decrypt vault → full credential compromise
- **Business Impact:** Complete credential exposure (database passwords, API keys, service credentials)
- **Current Mitigation:** Repository is private
- **Target Mitigation:** Remove from repo, use environment variable or external secrets manager

### Medium Risks (Risk Score: 6-9)

#### MED-001: Direct Loki Access Bypass
- **Risk Score:** 9 (Likelihood: 3 × Impact: 3)
- **Description:** Loki port 3100 exposed to host (0.0.0.0:3100) allows direct access bypassing intended Docker network restriction
- **Attack Vector:** Direct connection to Loki API from LAN or internet (if router misconfigured)
- **Business Impact:** Log tampering, data exfiltration, DoS via resource exhaustion
- **Current Mitigation:** Internal network only (assumed)
- **Target Mitigation:** Remove host port binding, access only via Docker network

#### MED-002: No Data-at-Rest Encryption
- **Risk Score:** 8 (Likelihood: 2 × Impact: 4)
- **Description:** No filesystem encryption means physical theft exposes all data
- **Attack Vector:** Physical server theft, disk disposal without wiping
- **Business Impact:** Exposure of all application data and credentials
- **Current Mitigation:** Physical security (assumed)
- **Target Mitigation:** LUKS encryption for production; document acceptance for homelab

### Low Risks (Risk Score: 1-5)

#### LOW-001: Unencrypted Internal Traffic
- **Risk Score:** 4 (Likelihood: 2 × Impact: 2)
- **Description:** HTTP used for internal container-to-container communication
- **Attack Vector:** Man-in-the-middle on internal network
- **Business Impact:** Credential interception, data eavesdropping
- **Current Mitigation:** Trusted internal network
- **Target Mitigation:** **ACCEPTED** - Document security boundary assumption

---

## Remediation Roadmap

### Phase 1: Immediate Actions (0-7 days)

**Target Completion:** 2026-02-21

#### IM-001: Remove Vault Password from Repository
- **Addresses:** HIGH-001
- **Effort:** 1 hour
- **Steps:**
  1. Add `.vault_pass` to `.gitignore`
  2. Remove from git history: `git filter-branch --tree-filter 'rm -f ansible/.vault_pass' HEAD`
  3. Configure environment variable: `export ANSIBLE_VAULT_PASSWORD_FILE=~/.ansible_vault_pass`
  4. Update documentation
  5. Rotate all secrets in vault (assume compromised)
- **Owner:** DevOps Engineer
- **Success Criteria:** `.vault_pass` not in repo, vault password via environment variable

#### IM-002: Remove Loki Host Port Binding
- **Addresses:** MED-001
- **Effort:** 30 minutes
- **Steps:**
  1. Edit `ansible/roles/loki/templates/docker-compose.yml.j2`
  2. Remove `ports: - "3100:3100"` line
  3. Redeploy Loki via Ansible
  4. Verify Grafana can still access via Docker network
- **Owner:** DevOps Engineer
- **Success Criteria:** Loki not accessible on host port 3100, Grafana queries still work

#### IM-003: Configure Auth Log Collection
- **Addresses:** CRIT-002 (partial)
- **Effort:** 2 hours
- **Steps:**
  1. Update Promtail config to include `/var/log/auth.log`
  2. Add `/var/log/secure` scrape config
  3. Configure sudo logging with labels
  4. Redeploy Promtail to all containers
  5. Verify logs appear in Loki
- **Owner:** DevOps Engineer
- **Success Criteria:** Auth logs visible in Grafana, failed login events queryable

#### IM-004: Document Security Boundaries
- **Addresses:** LOW-001 (acceptance), MED-002 (acceptance)
- **Effort:** 2 hours
- **Steps:**
  1. Create `docs/security/security-model.md`
  2. Document trust boundaries (internal network trusted)
  3. Document accepted risks for homelab context
  4. Define future security roadmap for production
- **Owner:** DevOps Engineer
- **Success Criteria:** Security model documented, accepted risks formally recorded

**Phase 1 Total Effort:** 5.5 hours
**Phase 1 Risk Reduction:** 1 HIGH, 1 MEDIUM resolved; 1 CRITICAL partially addressed

---

### Phase 2: Short-term Actions (1-4 weeks)

**Target Completion:** 2026-03-14

#### ~~ST-001: Deploy Traefik (Story 1.7)~~ — ✅ DONE
- **Addresses:** CRIT-004 ✅ RESOLVED
- **Completed:** Story 1.7 (Intégration Traefik) — *note: was incorrectly referenced as Story 1.1*
- **Outcome:** Traefik operational on container .200, Let's Encrypt SSL active, all services routed via *.oldevops.fr, HTTPS enforced

#### ST-002: Implement Auditd on All Containers → **Story 1.17** 📝 Todo
- **Addresses:** CRIT-002 (partial)
- **Story:** [story-1.17.md](../stories/story-1.17.md)
- **Scope:** Rôle Ansible `auditd`, règles (privesc, identity, sudoers, sshd_config), collecte Promtail → Loki
- **Exception:** Container .250 (unprivileged) — auditd en mode read-only logs uniquement
- **Success Criteria:** `{job="auditd"}` visible dans Loki, tests sudo/passwd validés

#### ST-003 + ST-004: Security Dashboards & Alerts → **Story 1.18** 📝 Todo
- **Addresses:** CRIT-002 (detection + automated alerts)
- **Story:** [story-1.18.md](../stories/story-1.18.md)
- **Scope:** 3 dashboards Grafana (auth, changes, overview) + 4 alertes (brute force, privesc, file change, auditd down), email notifications
- **Success Criteria:** Alerte `SecurityBruteForce` testée bout-en-bout, email reçu en <15 min

**Phase 2 Total Effort:** ~32 hours (including Story 1.1)
**Phase 2 Risk Reduction:** 2 CRITICAL resolved, security visibility achieved

---

### Phase 3: Medium-term Actions (1-3 months)

**Target Completion:** 2026-05-14

#### MT-001: Convert Containers to Unprivileged Mode → **Story 1.19** ✅ DONE (partiel)
- **Addresses:** CRIT-001
- **Story:** [story-1.19.md](../stories/story-1.19.md)
- **Périmètre décidé (analyse risque/bénéfice 2026-03-31) :**

| Container | Décision | Raison |
|-----------|----------|--------|
| `.200` Traefik | ✅ **Convertir** (Story 1.19) | Workload Docker standard, pas de device access |
| `.201` Utilities | ✅ **Convertir** (Story 1.19) | Webapps Docker standards |
| `.202` Monitoring | ⏸️ **Déferrée** | node-exporter `pid:host` + cadvisor nécessitent tests dédiés |
| `.210` CI Runner | ❌ **Exception acceptée** | Docker builds CI nécessitent namespaces kernel — rootless Docker non supporté nativement |
| `.250` App Demo | ✅ **Déjà unprivileged** | En place depuis Story 1.4 |

- **Approche IaC :** `unprivileged = true` dans Terraform + `terraform apply` (destroy/recreate) + Ansible redeploy
- **Note config Proxmox :** Pas de `lxc.cap.drop` dans `/etc/pve/lxc/NNN.conf` — la conversion se fait uniquement via `unprivileged: 1` + idmaps gérés automatiquement par l'API Proxmox
- **Success Criteria:** .200 et .201 unprivileged, Docker fonctionnel, services applicatifs accessibles

#### MT-002: Implement AppArmor Profiles
- **Addresses:** CRIT-001 (defense in depth)
- **Effort:** 2-3 days
- **Steps:**
  1. Create AppArmor profile template for LXC containers
  2. Define allowed syscalls and capabilities
  3. Test profiles on monitoring container
  4. Deploy to all containers
  5. Monitor for policy violations
- **Owner:** DevOps Engineer
- **Success Criteria:** AppArmor profiles active, no unauthorized syscalls, services functional

#### ~~MT-003: Deploy Backup Solution (Story 1.11)~~ — ✅ DONE
- **Addresses:** CRIT-003 ✅ RESOLVED
- **Completed:** Story 1.11 (Backup et Disaster Recovery Automation)
- **Outcome:** Automated backups running, restore tested successfully (RTO <30min), backup monitoring operational

#### MT-004: Evaluate External Secrets Manager
- **Addresses:** HIGH-001 (long-term solution)
- **Effort:** 2 days (evaluation + PoC)
- **Options:** 1Password CLI, HashiCorp Vault, AWS Secrets Manager
- **Steps:**
  1. Evaluate secrets manager options
  2. Create proof-of-concept integration
  3. Document integration approach
  4. Decision: implement or defer
- **Owner:** DevOps Engineer
- **Success Criteria:** Decision documented, PoC demonstrated (if proceeding)

**Phase 3 Total Effort:** ~64 hours (including Story 1.11)
**Phase 3 Risk Reduction:** 2 CRITICAL resolved (container escape, data loss)

---

### Phase 4: Long-term Actions (3-6 months)

**Target Completion:** 2026-08-14

#### LT-001: Implement Centralized Authentication
- **Addresses:** Enhanced access control
- **Effort:** 5-7 days
- **Options:** Authelia, Authentik, Keycloak
- **Steps:**
  1. Evaluate authentication solutions
  2. Deploy authentication service
  3. Integrate with Traefik
  4. Migrate services to centralized auth
  5. Configure MFA
- **Owner:** DevOps Engineer
- **Success Criteria:** All services behind centralized authentication, MFA enabled

#### LT-002: Enable Data-at-Rest Encryption
- **Addresses:** MED-002 (if moving to production)
- **Effort:** 3-4 days
- **Steps:**
  1. Plan LUKS encryption implementation
  2. Test encrypted volumes
  3. Migrate data to encrypted volumes
  4. Document encryption key management
  5. Test disaster recovery with encryption
- **Owner:** DevOps Engineer
- **Success Criteria:** All sensitive data encrypted at rest, keys managed securely

#### LT-003: Security Audit
- **Addresses:** Overall security validation
- **Effort:** 1-2 days (external party) or 3-4 days (self-assessment)
- **Steps:**
  1. Engage security professional or conduct self-assessment
  2. Penetration testing of infrastructure
  3. Review findings
  4. Create remediation plan for new findings
- **Owner:** DevOps Engineer + External Auditor
- **Success Criteria:** Audit complete, findings documented, remediation plan created

#### LT-004: Disaster Recovery Testing
- **Addresses:** Business continuity validation
- **Effort:** 2 days (quarterly)
- **Steps:**
  1. Schedule DR drill
  2. Simulate infrastructure failure
  3. Execute recovery procedures
  4. Document recovery time and issues
  5. Update DR procedures
- **Owner:** DevOps Engineer
- **Success Criteria:** Successful recovery within RTO, procedures validated

**Phase 4 Total Effort:** ~96 hours
**Phase 4 Risk Reduction:** Enhanced security posture, validated resilience

---

## Success Metrics

### Key Performance Indicators

**Security Posture:**
- ~~Current: Security Maturity Level 1/5 (Ad Hoc)~~ → **2026-03-31: Level 2/5 (Developing)**
- Target (3 months): Level 3/5 (Defined)
- Target (6 months): Level 4/5 (Managed)

**Risk Reduction:**
- ~~Current Critical Risks: 4~~ → **2026-03-31: 2 remaining** (CRIT-003 ✅, CRIT-004 ✅ resolved)
- Target (3 months): 0 (100% reduction) — still valid

**Compliance:**
- ~~Current: 15% checklist compliance~~ → **2026-03-31: ~45%** (Traefik + backup + CI/CD security + hardening done)
- Target (3 months): 80% compliance
- Target (6 months): 90% compliance

**Operational Metrics:**
- **Backup Success Rate:** ~~N/A~~ → ✅ **100%** (Story 1.11 Done)
- **Security Incident Detection Time:** ∞ (undetectable) → <1 hour (pending ST-003/ST-004)
- **Privileged Container Count:** 5 → 1 unprivileged (.250) → **target: 0** (MT-001 pending)
- **Secrets in Repository:** ✅ **0** — IM-001 resolved (`.vault_pass` chiffré)

### Validation Checkpoints

**Week 2 (2026-02-28):** *(status as of 2026-03-31)*
- [ ] Phase 1 complete (4/4 immediate actions) — *status unknown, verify IM-001 to IM-004*
- [x] No secrets in repository — ✅ IM-001 **RESOLVED** : `.vault_pass` chiffré
- [ ] Auth logs centralized in Loki — **⚠️ VERIFY** IM-003 completion
- [ ] Security model documented — **⚠️ VERIFY** IM-004 completion

**Month 1 (2026-03-14):** *(status as of 2026-03-31)*
- [x] Traefik deployed and operational ✅ (Story 1.7 Done)
- [ ] Phase 2 complete (4/4 short-term actions) — ST-002, ST-003, ST-004 **PENDING**
- [ ] Security dashboards operational — **⚠️ PENDING** (ST-003)
- [ ] Auditd deployed to all containers — **⚠️ PENDING** (ST-002)
- [ ] Security alerts configured — **⚠️ PENDING** (ST-004)

**Month 3 (2026-05-14):**
- [x] Backup solution operational ✅ (Story 1.11 Done)
- [x] Backup restore tested successfully ✅ (Story 1.11 Done)
- [x] .200 et .201 unprivileged ✅ (Story 1.19 Done — 2026-03-31, `terraform apply`)
- [ ] .202 et .210 unprivileged — déferrée/.210 exception acceptée (MT-001 résiduel)
- [ ] AppArmor profiles active — **⚠️ PENDING** (MT-002)

**Month 6 (2026-08-14):**
- [ ] Phase 4 complete (4/4 long-term actions)
- [ ] Centralized authentication deployed
- [ ] Data-at-rest encryption (if production)
- [ ] Security audit completed
- [ ] DR testing successful

---

## Resource Requirements

### Personnel

**Primary:** 1 DevOps Engineer (You)
- Phase 1: 6 hours (1 day)
- Phase 2: 32 hours (1 week)
- Phase 3: 64 hours (2 weeks)
- Phase 4: 96 hours (2.5 weeks)
- **Total:** ~25 working days over 6 months

**Supporting:**
- Development Team: Stories 1.1 and 1.11 implementation (already planned)
- External Security Auditor: 1-2 days (optional, Phase 4)

### Budget

**Infrastructure Costs:**
- Backup Storage: Estimate $50-100/year (external drive or cloud storage)
- External Secrets Manager: $0 (self-hosted Vault) or $5-10/month (1Password Teams)
- Security Auditor: $0 (self-assessment) or $500-1000 (professional audit)

**Software/Tools:**
- All remediation uses open-source tools (zero additional licensing)

**Total Estimated Budget:** $100-1200/year (depending on choices)

---

## Risk Acceptance Register

### Risks Accepted for Homelab Context

| Risk ID | Risk Description | Acceptance Rationale | Conditions | Review Date |
|---------|------------------|----------------------|------------|-------------|
| LOW-001 | Unencrypted internal traffic (HTTP) | Trusted internal network, no internet exposure | Internal network remains isolated | 2026-05-01 |
| MED-002 | No data-at-rest encryption | Homelab on trusted physical hardware, low threat | Physical security maintained | 2026-05-01 |

### Conditional Acceptance (Must Remediate Before Production)

| Risk ID | Risk Description | Production Blocker | Remediation Required |
|---------|------------------|-------------------|---------------------|
| MED-002 | No data-at-rest encryption | YES | LUKS encryption before production use |
| HIGH-001 | Vault password management | YES | External secrets manager before production |

---

## Escalation & Governance

### Issue Severity Classification

**Critical (P0):** Security compromise possible, data loss risk, no workarounds
- **Escalation:** Immediate remediation required
- **Notification:** Document owner

**High (P1):** Significant security gap, workarounds available
- **Escalation:** Remediation within 1 week
- **Notification:** Document owner

**Medium (P2):** Security improvement needed, acceptable mitigations exist
- **Escalation:** Remediation within 1 month
- **Notification:** Monthly review

**Low (P3):** Best practice deviation, minimal risk
- **Escalation:** Remediation within 3 months or accepted
- **Notification:** Quarterly review

### Change Control

All security remediations must follow change management process:
1. **Planning:** Document change in this remediation plan
2. **Testing:** Test in non-production environment
3. **Approval:** Self-approved for homelab; stakeholder approval for production
4. **Implementation:** Execute during planned maintenance window
5. **Validation:** Verify security control effectiveness
6. **Documentation:** Update security documentation

---

## Appendix A: Quick Reference

### Immediate Action Checklist (This Week)

**Priority 1 (Today):**
- [ ] Remove `.vault_pass` from git repository
- [ ] Remove Loki port 3100 host binding
- [ ] Configure auth log collection in Loki

**Priority 2 (This Week):**
- [ ] Document security model and accepted risks
- [ ] Create initial security dashboard in Grafana
- [ ] Review Story 1.1 (Traefik) timeline

### Commands Reference

**Remove vault password from git history:**
```bash
# Add to .gitignore
echo '.vault_pass' >> ansible/.gitignore

# Remove from history (CAUTION: rewrites git history)
git filter-branch --tree-filter 'rm -f ansible/.vault_pass' HEAD

# Alternative: Use BFG Repo-Cleaner
# java -jar bfg.jar --delete-files .vault_pass
```

**Configure environment variable for vault password:**
```bash
# In ~/.bashrc or ~/.zshrc
export ANSIBLE_VAULT_PASSWORD_FILE=~/.ansible_vault_pass

# Store vault password securely
echo "your-vault-password" > ~/.ansible_vault_pass
chmod 600 ~/.ansible_vault_pass
```

**Test Loki without host port binding:**
```bash
# From within Grafana container or Docker network
docker exec grafana curl -s http://loki:3100/ready

# Should return "ready"
```

---

## Appendix B: Security Tools Inventory

### Current Security Tools

| Tool | Purpose | Status | Version |
|------|---------|--------|---------|
| Ansible Vault | Secrets encryption | ✅ Active | Ansible 2.x |
| Loki | Log aggregation | ✅ Active | 2.9.4 |
| Grafana | Security dashboards | ✅ Active | Latest |
| Traefik | Reverse proxy, TLS | ✅ Active (Story 1.7) | Latest |
| Auditd | System auditing | ❌ Pending (ST-002) | - |
| AppArmor | Container isolation | ❌ Pending (MT-002) | - |

### Planned Security Tools

| Tool | Purpose | Timeline | Priority |
|------|---------|----------|----------|
| ~~Traefik~~ | Central access control | ✅ Done (Story 1.7) | ✅ |
| Auditd | Security auditing | Pending (ST-002) | Critical |
| AppArmor | Syscall restriction | Pending (MT-002) | High |
| Authelia/Authentik | Centralized auth | Month 4-6 (LT-001) | Medium |
| HashiCorp Vault | Secrets management | Month 3-4 (MT-004) | Medium |
| ~~Restic/Borg~~ | Encrypted backups | ✅ Done (Story 1.11) | ✅ |

---

## Document Control

**Version History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-14 | Initial security remediation plan | Infrastructure Validation Task |
| 1.1 | 2026-03-31 | Update: CRIT-003 (Backup) + CRIT-004 (Traefik) resolved; container inventory corrected; compliance updated to ~45%; story references fixed (Traefik = Story 1.7 not 1.1) | Agent PO |

**Review Schedule:**
- **Weekly:** Phase 1 progress tracking (2026-02-21 until complete)
- **Bi-weekly:** Phase 2 progress tracking (2026-03-14 until complete)
- **Monthly:** Overall plan review and adjustment (first Monday of each month)
- **Quarterly:** Risk acceptance review and compliance validation

**Document Owner:** DevOps Engineer (Infrastructure Owner)

**Next Review Date:** 2026-02-21 (Phase 1 completion validation)

---

**END OF SECURITY REMEDIATION PLAN**
