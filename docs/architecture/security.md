# Architecture Sécurité — oldevops.fr

**Dernière mise à jour** : 2026-02-20
**Responsable** : Ingénieur Infrastructure (olivier.labe@oldevops.fr)

---

## Modèle de Menaces (Threat Model)

### Périmètre

L'infrastructure oldevops.fr est un homelab professionnel composé de 5 containers LXC Proxmox exposant des services via Traefik (reverse proxy TLS). L'infrastructure est accessible depuis Internet via DNS *.oldevops.fr.

### Acteurs

| Acteur | Type | Description |
|--------|------|-------------|
| Internet public | Externe hostile | Scanners, bots, attaquants opportunistes |
| Contributeurs GitHub | Externe de confiance | PRs, push vers le repo |
| Ingénieur infra | Interne | Accès SSH, déploiement Ansible |
| GitHub Actions Runner | Interne | CI/CD automatisé (CT 210) |

### Vecteurs d'Attaque Identifiés

| Vecteur | Risque | Mitigation |
|---------|--------|------------|
| Brute-force SSH | Élevé | Fail2ban (ban après 3 tentatives, ignore LAN) |
| Exposition ports non-filtrés | Élevé | UFW default-deny + whitelist LAN 192.168.1.0/24 |
| Secrets dans le code | Critique | detect-secrets (pre-commit) + Trufflehog (CI) |
| Images Docker vulnérables | Élevé | Trivy (CI, fail CVSS ≥9.0) |
| Mauvaise config Terraform | Moyen | tfsec + Checkov (CI) |
| Attaques MITM TLS | Élevé | TLS 1.3 min, ciphers modernes uniquement |
| Clickjacking / XSS | Moyen | Headers sécurité (CSP, X-Frame-Options, HSTS) |
| DDoS / abus API | Moyen | Rate limiting Traefik (1000 req/min par IP) |
| Mises à jour manquées | Moyen | unattended-upgrades (sécurité auto) |

---

## Mesures de Sécurité Implémentées

### 1. Hardening des Containers LXC

**Fichiers** : `ansible/roles/hardening/`
**Appliqué sur** : CT 200, 201, 240, 210, 250

#### UFW (Uncomplicated Firewall)
```
Politique par défaut : deny incoming / allow outgoing
Règles :
  - ALLOW from 192.168.1.0/24 (LAN — Ansible, monitoring, services internes)
  - ALLOW 22/tcp from any (SSH — safety net)
```

#### Fail2ban
```
Jail SSH :
  - maxretry : 3
  - bantime  : 3600s (1 heure)
  - findtime : 600s (fenêtre 10 min)
  - ignoreip : 127.0.0.1/8 ::1 192.168.1.0/24
```

#### Unattended-upgrades
- Mises à jour de sécurité automatiques (quotidien)
- AutocleanInterval : 7 jours

---

### 2. Sécurisation Traefik (CA12.3)

**Fichiers** : `ansible/roles/traefik/templates/`

#### TLS
- **Version minimum** : TLS 1.3 (entryPoint websecure)
- **Fallback TLS 1.2** avec ciphers modernes (ECDHE + AES-GCM/ChaCha20)
- Certificats Let's Encrypt via DNS challenge OVH

#### Headers de Sécurité (middleware `secure-headers`)
```
Strict-Transport-Security : max-age=31536000; includeSubDomains
X-Frame-Options           : DENY
X-Content-Type-Options    : nosniff
X-XSS-Protection          : 1; mode=block
Referrer-Policy           : strict-origin-when-cross-origin
Content-Security-Policy   : default-src 'self'; script-src 'self' 'unsafe-inline'; ...
X-Permitted-Cross-Domain-Policies : none
Permissions-Policy        : camera=(), microphone=(), geolocation=()
```

**Appliqué sur** : tous les routers (app, vault, snipeit, netbox, zabbix, grafana, prometheus, status, proxy dashboard)

#### Rate Limiting
- **Middleware** : `rate-limit` (1000 req/min average, burst 500)
- **Appliqué sur** : tous les routers publics

#### API Dashboard
- `api.insecure: false` — dashboard Traefik accessible uniquement via HTTPS sur `proxy.oldevops.fr`

---

### 3. Scanning CI/CD (CA12.1)

**Fichier** : `.github/workflows/security-scan.yml`
**Déclencheur** : chaque Pull Request vers `main`

| Scanner | Cible | Seuil d'échec |
|---------|-------|---------------|
| **tfsec** | Terraform IaC | CRITICAL ou HIGH |
| **Checkov** | Terraform IaC | Tout échec |
| **Trivy** | Images Docker | CRITICAL (CVSS ≥ 9.0) |
| **Trufflehog** | Historique Git | Tout secret vérifié |

Résultats exportés en artifacts (30 jours de rétention) et commentaire automatique sur la PR.

---

### 4. Pre-Commit Hooks (CA12.4)

**Fichier** : `.pre-commit-config.yaml`

| Hook | Rôle |
|------|------|
| `detect-secrets` | Détection de secrets dans le code |
| `check-yaml` | Validation syntaxe YAML |
| `check-json` | Validation syntaxe JSON |
| `no-commit-to-branch` | Protection branche `main` |
| `terraform_fmt` | Formatage automatique Terraform |
| `terraform_validate` | Validation Terraform |
| `ansible-lint` | Qualité code Ansible |

**Installation** :
```bash
pip install pre-commit
pre-commit install
# Initialiser la baseline detect-secrets :
detect-secrets scan > .secrets.baseline
```

---

### 5. Gestion des Secrets

| Secret | Stockage | Accès |
|--------|----------|-------|
| Mots de passe DB, API keys | Ansible Vault (AES256) | `ansible/vault/secrets.yml` |
| Vault password | `.vault_pass` (local, gitignored) | `ansible/scripts/get-vault-password.sh` |
| GitHub Secrets CI/CD | GitHub Actions Secrets | Runner CT 210 uniquement |
| Credentials Terraform | Variables d'env CI/CD | Ne jamais committer |

---

## Procédure de Gestion des Vulnérabilités

### Criticité et SLA de Correction

| Sévérité CVSS | Délai de correction |
|---------------|---------------------|
| CRITICAL (≥9.0) | 24 heures |
| HIGH (7.0–8.9) | 7 jours |
| MEDIUM (4.0–6.9) | 30 jours |
| LOW (<4.0) | Backlog / best-effort |

### Processus

1. **Détection** : CI/CD (Trivy, tfsec, Checkov) ou rapport externe
2. **Évaluation** : Vérifier si la vulnérabilité est exploitable dans ce contexte
3. **Documenter** : Ouvrir une issue GitHub avec le CVE, la sévérité et le plan de mitigation
4. **Corriger** : PR avec fix + tests de non-régression
5. **Valider** : Re-scan CI/CD propre avant merge
6. **Déployer** : Via pipeline CD automatique

### Vulnérabilités Acceptées (Exception List)

Vulnérabilités connues non-corrigées avec justification :

| CVE | Package | Raison | Review date |
|-----|---------|--------|-------------|
| *(aucune à date)* | - | - | - |

---

## Checklist Sécurité — Nouvelles Features

Avant toute PR touchant l'infrastructure ou une nouvelle feature :

- [ ] Aucun secret en clair dans le code (detect-secrets OK)
- [ ] Images Docker scannées par Trivy (0 CRITICAL)
- [ ] Terraform validé par tfsec + Checkov
- [ ] Headers de sécurité appliqués sur tout nouveau router Traefik
- [ ] UFW : tout nouveau port justifié et documenté
- [ ] Variables sensibles stockées dans Ansible Vault (jamais dans defaults)
- [ ] Accès SSH key-only (pas de password auth)
- [ ] Logs d'accès centralisés dans Loki

---

## Références

- [Runbook Disaster Recovery](../runbooks/disaster-recovery.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Traefik Security Headers](https://doc.traefik.io/traefik/middlewares/http/headers/)
- [CIS Benchmarks Debian](https://www.cisecurity.org/benchmark/debian_linux)
- [Fail2ban Documentation](https://www.fail2ban.org/wiki/index.php/MANUAL_0_8)
