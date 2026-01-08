# Guide de Déploiement - GitHub Actions Self-Hosted Runner

Ce guide décrit le déploiement du container LXC dédié au GitHub Actions Self-Hosted Runner.

## 📋 Prérequis

- [x] Accès au serveur Proxmox
- [x] Terraform installé localement
- [x] Ansible installé localement
- [x] Token GitHub généré (valide 1h)
- [x] Fichier `ansible/.vault_pass` configuré
- [x] Variables définies dans `ansible/vault/secrets.yml`

## 🚀 Étape 1 : Générer le Token GitHub

Le token GitHub est **valide 1 heure** seulement. Générez-le juste avant le déploiement :

```bash
# 1. Allez sur GitHub
https://github.com/VOTRE_USERNAME/infra-oldevops/settings/actions/runners/new

# 2. Sélectionnez "Linux"

# 3. Copiez le TOKEN qui apparaît dans la commande config.sh
# Il ressemble à : GHRT_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔐 Étape 2 : Mettre à jour le Token dans Vault

```bash
cd ansible
ansible-vault edit vault/secrets.yml

# Modifiez la ligne :
vault_github_runner_token: "GHRT_VOTRE_TOKEN_ICI"

# Sauvegardez et fermez (:wq)
```

## 🏗️ Étape 3 : Déployer le Container avec Terraform

```bash
cd terraform

# Vérifier le plan
terraform plan -out=tfplan

# Devrait afficher : +1 resource to create (module.ci_runner)

# Appliquer
terraform apply tfplan
```

**Résultat attendu :**
- Container LXC créé : VMID 210
- Hostname : ci-runner
- IP : 192.168.1.210/24
- Ressources : 4 CPU, 4GB RAM, 30GB Disk

## 🔧 Étape 4 : Bootstrap SSH (première fois uniquement)

Si c'est la première fois que vous déployez ce container :

```bash
cd ../ansible

# Mettre à jour le bootstrap playbook pour inclure le nouveau container
# Puis exécuter :
ansible-playbook -i proxmox_host, playbooks/bootstrap-lxc.yml \
  -e "container_id=210" \
  -e "container_name=ci-runner"
```

**Note :** Si votre clé SSH est déjà dans le template Debian, cette étape n'est pas nécessaire.

## ⚙️ Étape 5 : Configurer le Runner avec Ansible

```bash
cd ansible

# Test de connexion
ansible ci_runner -i inventory.ini -m ping

# Déploiement complet
ansible-playbook -i inventory.ini playbooks/ci-runner.yml

# Ou par étapes avec tags :
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags common
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags runner
```

**Durée estimée :** 5-10 minutes

**Ce qui est installé :**
- Docker + docker-compose
- Terraform 1.7.0
- Ansible + ansible-lint 6.22.2
- tfsec 1.28.5
- trufflehog (latest)
- GitHub Actions Runner 2.321.0

## ✅ Étape 6 : Vérification

### 6.1 Vérifier le Runner sur GitHub

```bash
# Ouvrir dans le navigateur :
https://github.com/VOTRE_USERNAME/infra-oldevops/settings/actions/runners
```

Vous devriez voir :
- ✅ Runner name : `ci-runner-runner`
- ✅ Status : **Idle** (vert)
- ✅ Labels : `self-hosted`, `Linux`, `X64`, `proxmox`

### 6.2 Vérifier depuis le container

```bash
# SSH dans le container
ssh root@192.168.1.210

# Vérifier le service runner
systemctl status actions.runner.*.service

# Vérifier les outils installés
terraform version
ansible --version
ansible-lint --version
tfsec --version
trufflehog --version
```

## 🔄 Régénération du Token (si expiré)

Si le token a expiré pendant le déploiement :

```bash
# 1. Régénérer sur GitHub (voir Étape 1)

# 2. Mettre à jour le vault
ansible-vault edit vault/secrets.yml

# 3. Re-exécuter seulement le rôle runner
ansible-playbook -i inventory.ini playbooks/ci-runner.yml --tags runner
```

## 🐛 Troubleshooting

### Le container ne démarre pas

```bash
# Vérifier les logs Proxmox
ssh root@192.168.0.10
pct status 210
pct start 210
```

### Ansible ne peut pas se connecter

```bash
# Tester la connexion
ssh -i ~/.ssh/id_ed25519 root@192.168.1.210

# Vérifier le fingerprint
ssh-keyscan 192.168.1.210
```

### Le runner ne s'enregistre pas

```bash
# Vérifier les logs du runner
ssh root@192.168.1.210
journalctl -u actions.runner.*.service -f

# Possibles causes :
# - Token expiré (régénérez)
# - Problème réseau (vérifier connectivité internet)
# - Repo privé sans permissions (vérifier le token scope)
```

### Erreur "Vault password incorrect"

```bash
# Vérifier le contenu de .vault_pass
cat ansible/.vault_pass

# Tester le décryptage
ansible-vault view vault/secrets.yml
```

## 📚 Prochaines Étapes

Maintenant que le runner est déployé, vous pouvez :

1. ✅ Créer les workflows GitHub Actions (`.github/workflows/`)
2. ✅ Configurer les branch protections
3. ✅ Tester avec une PR

Voir : [Story 1.1 - GitHub Actions Pipeline](../stories/story-1.1.md)

## 🔒 Sécurité

### Secrets à ne JAMAIS commiter :
- ❌ `ansible/.vault_pass` (mot de passe vault)
- ❌ `terraform/*.tfvars` (credentials Proxmox/OVH)
- ✅ `ansible/vault/secrets.yml` (OK car encrypté !)

### Secrets GitHub à configurer :
- `ANSIBLE_VAULT_PASSWORD` : Mot de passe pour décrypter vault (pour CI/CD)
- Autres secrets seront ajoutés lors de la création des workflows

---

**Date de création :** 2026-01-08
**Dernière mise à jour :** 2026-01-08
