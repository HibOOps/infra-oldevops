# Modifications Projet - Story 1.1 (Phase 1)

Récapitulatif des fichiers créés/modifiés pour la mise en place du GitHub Actions Self-Hosted Runner.

## 📁 Fichiers Créés

### Infrastructure Terraform

```
terraform/main.tf
```
- ✅ Ajout du module `ci_runner` (VMID 210, IP 192.168.1.210)

### Configuration Ansible

```
ansible/
├── roles/github-runner/
│   ├── defaults/main.yml         # Variables par défaut du runner
│   ├── tasks/main.yml            # Tâches d'installation
│   └── handlers/main.yml         # Handlers pour redémarrage
├── playbooks/ci-runner.yml       # Playbook principal pour le runner
├── scripts/get-vault-password.sh # Script de récupération mot de passe vault
└── vault/secrets.yml.example     # Template pour les secrets
```

### Documentation

```
docs/
├── CI-CD-RUNNER-SETUP.md         # Guide de déploiement complet
└── CHANGES-STORY-1.1.md          # Ce fichier
```

## 🔧 Fichiers Modifiés

### Configuration Ansible

```
ansible/ansible.cfg
```
- ✅ Ajout de `vault_password_file = scripts/get-vault-password.sh`
- ✅ Ajout de `inventory = inventory.ini`

```
ansible/inventory.ini
```
- ✅ Ajout du groupe `[ci_runner]` avec l'IP 192.168.1.210

### Sécurité

```
.gitignore
```
- ✅ Ajout de `ansible/.vault_pass` (fichier mot de passe local)
- ✅ Exclusion modifiée pour permettre `ansible/vault/secrets.yml` encrypté

### Secrets Vault

```
ansible/vault/secrets.yml
```
- ✅ Ajout des variables :
  - `vault_github_repo_owner`
  - `vault_github_repo_name`
  - `vault_github_runner_token`

## 📊 Infrastructure Actuelle

Après déploiement, votre infrastructure comportera :

| VMID | Hostname   | IP              | CPU | RAM  | Disk | Services                          |
|------|------------|-----------------|-----|------|------|-----------------------------------|
| 200  | proxy      | 192.168.1.200   | 2   | 1GB  | 8GB  | Traefik                           |
| 210  | ci-runner  | 192.168.1.210   | 4   | 4GB  | 30GB | GitHub Actions Runner (NOUVEAU)   |
| 220  | utilities  | 192.168.1.201   | 6   | 8GB  | 40GB | Snipe-IT, Vaultwarden             |
| 240  | monitoring | 192.168.1.202   | 4   | 6GB  | 50GB | Uptime Kuma, Grafana      |

## 🛠️ Outils Installés sur le Runner

- **Terraform** : 1.7.0
- **Ansible** : >= 2.14
- **ansible-lint** : 6.22.2
- **tfsec** : 1.28.5
- **trufflehog** : latest
- **GitHub Actions Runner** : 2.321.0
- **Docker** : latest (via rôle common)

## 🔐 Secrets Management

### Approche Professionnelle Mise en Place

1. **Local (développement)** :
   - Mot de passe vault dans `ansible/.vault_pass`
   - Fichier ignoré par Git

2. **CI/CD (GitHub Actions)** :
   - Mot de passe vault dans GitHub Secret : `ANSIBLE_VAULT_PASSWORD`
   - Script `get-vault-password.sh` détecte automatiquement l'environnement

3. **Secrets applicatifs** :
   - Stockés dans `ansible/vault/secrets.yml` (encrypté avec Ansible Vault)
   - Template disponible dans `secrets.yml.example`

## ✅ Validation

### Tests à effectuer avant de passer à la suite :

- [ ] Container LXC créé et démarré (VMID 210)
- [ ] Connexion SSH fonctionnelle : `ssh root@192.168.1.210`
- [ ] Ansible ping réussi : `ansible ci_runner -m ping`
- [ ] Playbook exécuté avec succès
- [ ] Runner visible sur GitHub (status: Idle)
- [ ] Tous les outils installés et fonctionnels

### Commandes de validation :

```bash
# Terraform
cd terraform && terraform state list | grep ci_runner

# Ansible
cd ansible && ansible ci_runner -m ping

# Runner
ssh root@192.168.1.210 "systemctl status actions.runner.*.service"

# Outils
ssh root@192.168.1.210 "terraform version && ansible-lint --version && tfsec --version"
```

## 🚀 Prochaines Étapes (Story 1.1 Phase 2)

Une fois le runner déployé et validé :

1. **Créer les workflows GitHub Actions** :
   - `.github/workflows/terraform-validate.yml`
   - `.github/workflows/ansible-lint.yml`
   - `.github/workflows/security-scan.yml`

2. **Configurer les branch protections** :
   - Protéger `main`
   - Requérir les checks avant merge

3. **Tester avec une PR** :
   - Créer une branche de test
   - Modifier un fichier Terraform/Ansible
   - Vérifier que les workflows s'exécutent sur le runner

## 📝 Notes Importantes

### Token GitHub Expiration
⚠️ Le token GitHub pour enregistrer le runner **expire après 1 heure**.
- Générez-le juste avant le déploiement
- Si expiré : régénérez et relancez le playbook avec `--tags runner`

### Persistance du Runner
✅ Le runner est **persistant** (recommandé pour homelab) :
- Ne se détruit pas après chaque job
- Cache les dépendances pour plus de rapidité
- Service systemd démarre au boot du container

### Sécurité
🔒 Le fichier `ansible/vault/secrets.yml` est encrypté et PEUT être commité sur Git.
❌ Ne commitez JAMAIS `ansible/.vault_pass` (déjà dans .gitignore).

---

**Auteur :** Alex (DevOps Infrastructure Specialist)
**Date :** 2026-01-08
**Story :** [Story 1.1 - GitHub Actions Pipeline](stories/story-1.1.md)
