# Documentation - Rôle Ansible github-runner

Documentation de référence pour le rôle Ansible `github-runner` utilisé pour déployer le GitHub Actions Self-Hosted Runner.

## 📋 Vue d'ensemble

**Emplacement** : `ansible/roles/github-runner/`

**Objectif** : Installer et configurer un GitHub Actions Self-Hosted Runner avec tous les outils nécessaires pour le CI/CD (Terraform, Ansible, tfsec, trufflehog).

## 🛠️ Outils Installés

| Outil          | Version | Usage                              | Installation      |
|----------------|---------|-------------------------------------|-------------------|
| Terraform      | 1.7.0   | Validation infrastructure          | Binary download   |
| Ansible        | >= 2.14 | Validation playbooks               | pip3              |
| ansible-lint   | 6.22.2  | Linting des rôles Ansible          | pip3              |
| tfsec          | 1.28.5  | Scan sécurité Terraform            | Binary download   |
| trufflehog     | latest  | Détection de secrets               | Binary download   |
| GitHub Runner  | 2.321.0 | Exécution des workflows            | Binary download   |

## 📂 Structure du Rôle

```
ansible/roles/github-runner/
├── defaults/
│   └── main.yml       # Variables par défaut (versions, chemins, labels)
├── tasks/
│   └── main.yml       # Tâches d'installation complètes
└── handlers/
    └── main.yml       # Handler pour redémarrage du service
```

## ⚙️ Variables

### Variables Requises (depuis vault)

```yaml
github_repo_owner: "{{ vault_github_repo_owner }}"      # Propriétaire du repo
github_repo_name: "{{ vault_github_repo_name }}"        # Nom du repo
github_runner_token: "{{ vault_github_runner_token }}"  # Token GitHub (expire 1h)
```

### Variables Optionnelles (defaults/main.yml)

```yaml
# Configuration Runner
github_runner_version: "2.321.0"
github_runner_user: "runner"
github_runner_group: "runner"
github_runner_home: "/home/runner"
github_runner_work_dir: "/home/runner/_work"
github_runner_labels: "self-hosted,Linux,X64,proxmox"
github_runner_name: "{{ ansible_hostname }}-runner"

# Versions Outils
terraform_version: "1.7.0"
ansible_lint_version: "6.22.2"
tfsec_version: "1.28.5"
```

## 🔄 Processus d'Installation (tasks/main.yml)

### 1. Dépendances Système
- Installation des packages : curl, wget, git, jq, unzip, tar, python3, pip3, build-essential

### 2. Utilisateur Runner
- Création de l'utilisateur `runner` (système)
- Home directory : `/home/runner`
- Shell : `/bin/bash`

### 3. Installation Terraform
- Téléchargement du zip depuis releases.hashicorp.com
- Extraction dans `/usr/local/bin/terraform`
- Vérification de l'installation

### 4. Installation Ansible + ansible-lint
- Installation via pip3
- Ansible >= 2.14
- ansible-lint 6.22.2 (version fixe)

### 5. Installation tfsec
- Téléchargement du binaire depuis GitHub releases
- Installation dans `/usr/local/bin/tfsec`
- Vérification de l'installation

### 6. Installation trufflehog
- Téléchargement tar.gz depuis GitHub releases
- Extraction dans `/usr/local/bin/`

### 7. GitHub Actions Runner
- Téléchargement depuis GitHub releases
- Extraction dans `/home/runner/actions-runner/`
- Ownership : `runner:runner`

### 8. Configuration Runner
- Check si déjà configuré (fichier `.runner`)
- Si non configuré : exécution de `config.sh --unattended`
- Enregistrement auprès de GitHub avec le token
- Ajout des labels personnalisés

### 9. Service Systemd
- Installation du service via `svc.sh install`
- Nom du service : `actions.runner.<owner>-<repo>.<hostname>-runner.service`
- Enable + Start du service
- Démarrage automatique au boot

## 🔐 Gestion du Token GitHub

### Génération du Token

```bash
# 1. URL GitHub
https://github.com/<owner>/<repo>/settings/actions/runners/new

# 2. Sélectionner "Linux"

# 3. Copier le token dans la commande config.sh
# Format : GHRT_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ⚠️ Important : Expiration 1 heure

Le token GitHub pour enregistrer un runner **expire après 1 heure**.

**Workflow recommandé :**
1. Générer le token sur GitHub
2. Immédiatement mettre à jour le vault
3. Lancer le playbook Ansible
4. Le runner s'enregistre avec le token frais

**Si le token expire :**
```bash
# Régénérer sur GitHub
# Mettre à jour le vault
ansible-vault edit vault/secrets.yml

# Re-exécuter seulement le rôle github-runner
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags runner
```

## 🚀 Utilisation

### Dans un Playbook

```yaml
- name: Setup GitHub Actions Runner
  hosts: ci_runner
  become: yes
  vars_files:
    - ../vault/secrets.yml
  roles:
    - role: common              # Prérequis (Docker, etc.)
    - role: github-runner
      vars:
        github_repo_owner: "{{ vault_github_repo_owner }}"
        github_repo_name: "{{ vault_github_repo_name }}"
        github_runner_token: "{{ vault_github_runner_token }}"
```

### Commandes

```bash
# Déploiement complet
cd ansible
ansible-playbook -i inventory.ini playbooks/ci-runner.yml

# Avec tags
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags runner
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags common
```

## ✅ Vérification Post-Installation

### Sur le serveur

```bash
# Connexion SSH
ssh root@192.168.1.210

# Vérifier le service
systemctl status actions.runner.*.service

# Vérifier les outils
terraform version        # 1.7.0
ansible --version        # >= 2.14
ansible-lint --version   # 6.22.2
tfsec --version          # 1.28.5
trufflehog --version

# Vérifier les logs
journalctl -u actions.runner.*.service -f
```

### Sur GitHub

```
https://github.com/<owner>/<repo>/settings/actions/runners
```

**État attendu :**
- ✅ Runner visible dans la liste
- ✅ Status : **Idle** (vert)
- ✅ Labels : `self-hosted`, `Linux`, `X64`, `proxmox`
- ✅ Runner name : `ci-runner-runner`

## 🔧 Maintenance

### Mise à jour du Runner

```yaml
# 1. Modifier la version dans defaults/main.yml
github_runner_version: "2.325.0"  # Nouvelle version

# 2. Stopper le service
ssh root@192.168.1.210
systemctl stop actions.runner.*.service

# 3. Relancer le playbook
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags runner
```

### Mise à jour des Outils

Même processus : modifier les versions dans `defaults/main.yml` et relancer.

### Réenregistrement du Runner

Si le runner perd la connexion ou est supprimé de GitHub :

```bash
# 1. Générer nouveau token
# 2. Mettre à jour vault
ansible-vault edit vault/secrets.yml

# 3. Supprimer la config existante
ssh root@192.168.1.210
cd /home/runner/actions-runner
sudo -u runner ./config.sh remove

# 4. Relancer le playbook
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags runner
```

## 🐛 Troubleshooting

### Erreur : Token expiré

```
Error: The runner registration token has expired
```

**Solution :**
1. Régénérer le token sur GitHub (valide 1h)
2. Mettre à jour `vault/secrets.yml`
3. Relancer le playbook

### Erreur : Runner déjà enregistré

```
Error: A runner with the same name already exists
```

**Solutions :**
- Option A : Supprimer le runner sur GitHub et relancer
- Option B : Changer `github_runner_name` dans defaults/main.yml

### Service ne démarre pas

```bash
# Vérifier les logs
journalctl -u actions.runner.*.service -n 50

# Vérifier les permissions
ls -la /home/runner/actions-runner/
chown -R runner:runner /home/runner/

# Vérifier la configuration
cat /home/runner/actions-runner/.runner
```

### Outils non trouvés dans PATH

```bash
# Vérifier l'installation
which terraform
which tfsec
which trufflehog

# Vérifier les permissions
ls -l /usr/local/bin/terraform
ls -l /usr/local/bin/tfsec
```

## 📊 Idempotence

Le rôle est idempotent :
- ✅ Si le runner est déjà configuré, pas de reconfiguration
- ✅ Les outils déjà installés ne sont pas retéléchargés (via `creates`)
- ✅ Le service est redémarré uniquement si nécessaire (via handlers)
- ✅ Peut être relancé sans risque

## 🔒 Sécurité

### Points forts
- ✅ Runner exécuté sous utilisateur non-privilégié `runner`
- ✅ Token GitHub stocké dans Ansible Vault (encrypté)
- ✅ Service systemd avec isolation

### Points d'attention
- ⚠️ Runner a accès Docker (via rôle common) - nécessaire pour build images
- ⚠️ Checksums des binaires non vérifiés (TODO amélioration)
- ⚠️ Runner persistant = cache entre jobs (avantage perf, attention à la pollution)

## 📚 Références

- [GitHub Actions Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Terraform Installation](https://developer.hashicorp.com/terraform/install)
- [ansible-lint Documentation](https://ansible-lint.readthedocs.io/)
- [tfsec GitHub](https://github.com/aquasecurity/tfsec)
- [trufflehog GitHub](https://github.com/trufflesecurity/trufflehog)

## 📝 Voir aussi

- [Guide de Déploiement Complet](CI-CD-RUNNER-SETUP.md)
- [Story 1.1 - GitHub Actions Pipeline](stories/story-1.1.md)
- [Modifications du Projet](CHANGES-STORY-1.1.md)

---

**Date de création :** 2026-01-08
**Dernière mise à jour :** 2026-01-08
**Auteur :** Alex - DevOps Infrastructure Specialist
