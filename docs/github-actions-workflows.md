# Documentation - GitHub Actions Workflows

Guide complet des workflows CI/CD pour la validation automatique de l'infrastructure.

## 📋 Vue d'ensemble

Ce projet utilise **3 workflows GitHub Actions** exécutés sur un **self-hosted runner** pour garantir la qualité du code infrastructure :

| Workflow | Déclencheur | Objectif | Durée estimée |
|----------|-------------|----------|---------------|
| `terraform-validate.yml` | PR modifiant `terraform/**` | Validation Terraform (fmt, validate, plan) | 1-2 min |
| `ansible-lint.yml` | PR modifiant `ansible/**` | Linting Ansible + syntax check | 30s - 1 min |
| `security-scan.yml` | Toute PR vers `main` | Scan sécurité (tfsec + trufflehog) | 1-2 min |

**Runner utilisé** : `self-hosted` (ci-runner @ 192.168.1.210)

---

## 🔄 Workflow 1 : terraform-validate.yml

### Objectif
Valider automatiquement les modifications Terraform avant merge.

### Déclenchement
```yaml
on:
  pull_request:
    paths:
      - 'terraform/**'
    branches:
      - main
```

### Étapes exécutées

#### 1. Terraform Format Check
```bash
terraform fmt -check -recursive
```
- Vérifie que tous les fichiers `.tf` sont correctement formatés
- ❌ **Bloque** la PR si du code n'est pas formaté
- 💡 **Fix** : Exécuter `terraform fmt -recursive` localement

#### 2. Terraform Init
```bash
terraform init
```
- Initialise le backend Terraform (OVH S3)
- Télécharge les providers nécessaires
- Utilise les secrets : `OVH_S3_ACCESS_KEY`, `OVH_S3_SECRET_KEY`

#### 3. Terraform Validate
```bash
terraform validate
```
- Valide la syntaxe et les références
- Vérifie la cohérence de la configuration
- ❌ **Bloque** la PR en cas d'erreur

#### 4. Terraform Plan
```bash
terraform plan -no-color
```
- Génère le plan d'exécution
- Affiche les ressources à créer/modifier/détruire
- Utilise les secrets : credentials Proxmox, container passwords

#### 5. Commentaire automatique sur la PR
- Poste un commentaire avec :
  - ✅/❌ Status de chaque étape
  - 📖 Plan Terraform complet (dans un bloc déroulant)
  - 👤 Auteur du push

### Secrets requis

```yaml
OVH_S3_ACCESS_KEY: "..."          # Access key OVH S3 pour le state
OVH_S3_SECRET_KEY: "..."          # Secret key OVH S3
PROXMOX_PASSWORD: "..."           # Mot de passe API Proxmox
PROXMOX_USERNAME: "root@pam"      # Utilisateur Proxmox
CONTAINER_PASSWORD: "..."         # Mot de passe root des containers
```

### Résultat

- ✅ **Success** : Tous les checks passent, code bien formaté, plan généré
- ❌ **Failure** : Formatage incorrect OU validation échouée OU plan échoué

---

## 🔍 Workflow 2 : ansible-lint.yml

### Objectif
Linter les playbooks et rôles Ansible, vérifier la syntaxe.

### Déclenchement
```yaml
on:
  pull_request:
    paths:
      - 'ansible/**'
    branches:
      - main
```

### Étapes exécutées

#### 1. ansible-lint
```bash
ansible-lint playbooks/ roles/
```
- Analyse tous les playbooks et rôles
- Vérifie les bonnes pratiques Ansible
- Détecte les problèmes potentiels

**Configuration** : `.ansible-lint`
- Profile : `moderate`
- Skip : règles expérimentales
- Warn : naming issues (non bloquant)

#### 2. Syntax Check (par playbook)
```bash
ansible-playbook playbooks/traefik.yml --syntax-check
ansible-playbook playbooks/utilities.yml --syntax-check
ansible-playbook playbooks/monitoring.yml --syntax-check
ansible-playbook playbooks/ci-runner.yml --syntax-check
ansible-playbook playbooks/bootstrap-lxc.yml --syntax-check
```

- Vérifie la syntaxe YAML de chaque playbook
- S'assure qu'ils sont exécutables
- Valide les références de rôles/tasks

#### 3. Commentaire automatique sur la PR
- Status de ansible-lint : ✅/❌
- Status de chaque playbook : ✅/❌

### Configuration ansible-lint

Fichier : `ansible/.ansible-lint`

```yaml
profile: moderate
skip_list:
  - experimental
warn_list:
  - role-name
  - var-naming[no-role-prefix]
exclude_paths:
  - vault/secrets.yml
```

### Résultat

- ✅ **Success** : Lint passé + toutes les syntaxes valides
- ❌ **Failure** : Lint échoué OU au moins 1 playbook avec erreur syntaxe

---

## 🔒 Workflow 3 : security-scan.yml

### Objectif
Scanner l'infrastructure pour des vulnérabilités de sécurité et des secrets exposés.

### Déclenchement
```yaml
on:
  pull_request:
    branches:
      - main
```

### Étapes exécutées

#### 1. tfsec - Infrastructure Security Scan
```bash
tfsec terraform/ --format json
```

**Vérifie :**
- Configuration Terraform sécurisée
- Pas de ressources exposées publiquement sans raison
- Encryption activée quand nécessaire
- Respect des best practices de sécurité

**Seuil de blocage :**
- ❌ Bloque si **CRITICAL** trouvé
- ❌ Bloque si **HIGH** trouvé
- ⚠️ Warn si MEDIUM/LOW

**Configuration** : `.tfsec/config.yml`
- Minimum severity : MEDIUM
- Ignore comments : true
- Exclude : `.terraform/`

**Artifacts générés :**
- `tfsec-results.json` (conservé 30 jours)

#### 2. trufflehog - Secrets Detection
```bash
trufflehog git file://. --since-commit HEAD~10 --only-verified
```

**Vérifie :**
- Secrets commités par erreur (API keys, tokens, passwords)
- Scan des 10 derniers commits
- Uniquement secrets **vérifiés** (validation active)

**Patterns détectés :**
- AWS keys
- GitHub tokens
- Private keys
- Passwords
- API secrets
- Et 700+ autres patterns

**Seuil de blocage :**
- ❌ Bloque si **AU MOINS 1** secret vérifié trouvé

**Artifacts générés :**
- `trufflehog-results.json` (conservé 30 jours)

#### 3. Commentaire automatique sur la PR

```markdown
### Security Scan Results 🔒

#### Infrastructure Security (tfsec) ✅
No CRITICAL or HIGH issues found

#### Secrets Detection (trufflehog) ✅
No verified secrets detected

📊 Artifacts Available:
- tfsec results (JSON)
- trufflehog results (JSON)
```

### Résultat

- ✅ **Success** : Aucune vulnérabilité CRITICAL/HIGH + aucun secret
- ❌ **Failure** : Vulnérabilités trouvées OU secrets détectés

---

## 🚀 Configuration GitHub Requise

### Secrets à ajouter

Allez dans : `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

```yaml
# Terraform / OVH
OVH_S3_ACCESS_KEY: "votre_access_key"
OVH_S3_SECRET_KEY: "votre_secret_key"

# Proxmox
PROXMOX_USERNAME: "root@pam"
PROXMOX_PASSWORD: "votre_mot_de_passe"

# Containers
CONTAINER_PASSWORD: "mot_de_passe_root_containers"

# Ansible Vault (pour futurs workflows de déploiement)
ANSIBLE_VAULT_PASSWORD: "votre_mot_de_passe_vault"
```

### Branch Protection

Allez dans : `Settings` → `Branches` → `Add rule` pour `main`

**Règles à activer :**
- ✅ Require a pull request before merging
- ✅ Require approvals: `1`
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Status checks requis :**
- `terraform-validate / Validate Terraform Configuration`
- `ansible-lint / Lint Ansible Configuration`
- `security-scan / Security Vulnerability Scan`

**Optionnel mais recommandé :**
- ✅ Do not allow bypassing the above settings (même pour les admins)
- ✅ Require conversation resolution before merging

---

## 🧪 Tester les Workflows

### Méthode 1 : Créer une PR de test

```bash
# 1. Créer une branche de test
git checkout -b test/workflows-validation

# 2. Modifier un fichier Terraform (exemple)
echo "# Test comment" >> terraform/main.tf

# 3. Commit et push
git add terraform/main.tf
git commit -m "test: validate workflows"
git push -u origin test/workflows-validation

# 4. Créer une PR sur GitHub
gh pr create --title "Test: Workflows validation" --body "Testing CI/CD workflows"

# 5. Observer les workflows s'exécuter
# Aller sur : https://github.com/<org>/infra-oldevops/pulls
```

### Méthode 2 : Tester localement

```bash
# Terraform
cd terraform
terraform fmt -check -recursive
terraform init
terraform validate
terraform plan

# Ansible
cd ../ansible
ansible-lint playbooks/ roles/
ansible-playbook playbooks/ci-runner.yml --syntax-check

# Sécurité
cd ../terraform
tfsec .

cd ..
trufflehog git file://. --since-commit HEAD~5
```

---

## 📊 Badges de Status

Ajoutez ces badges dans votre `README.md` :

```markdown
[![Terraform Validation](https://github.com/HibOOps/infra-oldevops/actions/workflows/terraform-validate.yml/badge.svg)](https://github.com/HibOOps/infra-oldevops/actions/workflows/terraform-validate.yml)

[![Ansible Lint](https://github.com/HibOOps/infra-oldevops/actions/workflows/ansible-lint.yml/badge.svg)](https://github.com/HibOOps/infra-oldevops/actions/workflows/ansible-lint.yml)

[![Security Scan](https://github.com/HibOOps/infra-oldevops/actions/workflows/security-scan.yml/badge.svg)](https://github.com/HibOOps/infra-oldevops/actions/workflows/security-scan.yml)
```

---

## 🐛 Troubleshooting

### Workflow ne se déclenche pas

**Problème :** La PR ne déclenche pas les workflows.

**Solutions :**
1. Vérifier que la branche cible est `main`
2. Vérifier que les chemins modifiés matchent les `paths:` du workflow
3. Vérifier que le runner est en ligne : https://github.com/<org>/infra-oldevops/settings/actions/runners

### Runner offline

**Problème :** "No runner available"

**Solutions :**
```bash
# SSH sur le runner
ssh root@192.168.1.210

# Vérifier le service
systemctl status actions.runner.*.service

# Redémarrer si nécessaire
systemctl restart actions.runner.*.service

# Vérifier les logs
journalctl -u actions.runner.*.service -f
```

### Terraform init échoue

**Problème :** "Error loading state: access denied"

**Solutions :**
1. Vérifier que les secrets `OVH_S3_ACCESS_KEY` et `OVH_S3_SECRET_KEY` sont configurés
2. Vérifier les permissions du bucket S3 OVH
3. Tester l'accès au state localement

### ansible-lint trouve trop d'erreurs

**Problème :** Lint bloque la PR avec des erreurs mineures.

**Solutions :**
1. Éditer `.ansible-lint` pour ajouter des règles à `warn_list` ou `skip_list`
2. Corriger les vrais problèmes identifiés
3. Utiliser `# noqa: [rule-name]` pour ignorer des lignes spécifiques

### tfsec trouve des faux positifs

**Problème :** tfsec bloque pour des issues non pertinentes.

**Solutions :**
1. Ajouter `# tfsec:ignore:<check-id>` au-dessus de la ressource Terraform
2. Ajouter le check à `exclude:` dans `.tfsec/config.yml`
3. Documenter pourquoi l'exception est justifiée

---

## 📚 Références

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform CI/CD](https://developer.hashicorp.com/terraform/tutorials/automation)
- [ansible-lint](https://ansible-lint.readthedocs.io/)
- [tfsec](https://aquasecurity.github.io/tfsec/)
- [trufflehog](https://github.com/trufflesecurity/trufflehog)

---

**Auteur :** Alex - DevOps Infrastructure Specialist
**Date :** 2026-01-08
**Story :** [Story 1.1 - GitHub Actions Pipeline](stories/story-1.1.md)
