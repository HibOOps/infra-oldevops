# Configuration GitHub Environment "production"

**Date**: 2026-01-09
**Story**: 1.3a - Pipeline de Déploiement Automatisé
**Workflow**: `.github/workflows/deploy-infra.yml`

---

## 🎯 Objectif

Configurer un GitHub Environment nommé `production` avec approbation manuelle obligatoire pour tous les déploiements automatisés de l'infrastructure.

---

## 📋 Prérequis

- Accès admin au repository GitHub `HibOOps/infra-oldevops`
- Le workflow `.github/workflows/deploy-infra.yml` doit être présent dans le repository

---

## 🔧 Configuration Étape par Étape

### Étape 1 : Accéder aux Environments

1. Aller sur : https://github.com/HibOOps/infra-oldevops
2. Cliquer sur **Settings** (⚙️ en haut à droite)
3. Dans le menu de gauche, cliquer sur **Environments**
4. Cliquer sur **New environment**

### Étape 2 : Créer l'Environment "production"

1. **Name** : Entrer `production`
2. Cliquer sur **Configure environment**

### Étape 3 : Configurer les Protections

#### 3.1 - Required reviewers (Approbation Obligatoire)

1. ✅ Cocher **Required reviewers**
2. Dans le champ, ajouter votre compte GitHub (ex: `olabe` ou votre username)
3. ⚠️ **Important** : Au moins 1 reviewer doit approuver avant le déploiement

#### 3.2 - Deployment branches (Protection de Branche)

1. Sous **Deployment branches**, sélectionner **Selected branches**
2. Cliquer sur **Add deployment branch rule**
3. Entrer `master` comme nom de branche
4. Cliquer sur **Add rule**

#### 3.3 - Environment secrets (Optionnel)

Si vous voulez isoler certains secrets spécifiquement pour production, vous pouvez les ajouter ici.
Sinon, les secrets du repository seront utilisés (recommandé pour commencer).

**Secrets nécessaires (déjà configurés au niveau repository) :**
- `OVH_S3_ACCESS_KEY`
- `OVH_S3_SECRET_KEY`
- `PROXMOX_PASSWORD`
- `PROXMOX_USERNAME`
- `CONTAINER_PASSWORD`
- `ANSIBLE_VAULT_PASSWORD`

### Étape 4 : Sauvegarder

1. Cliquer sur **Save protection rules** en bas de la page
2. L'environment `production` est maintenant configuré ✅

---

## 🚀 Fonctionnement du Déploiement

### Déclenchement Automatique

Le workflow `deploy-infra.yml` se déclenche automatiquement sur **push vers master**.

### Processus de Déploiement

1. **Commit mergé dans master** → Le workflow démarre
2. **Attente d'approbation** → Le workflow s'arrête et attend
   - Vous recevez une notification GitHub
   - Status : "Waiting for approval"
3. **Approbation manuelle** → Vous approuvez le déploiement
   - Aller sur : https://github.com/HibOOps/infra-oldevops/actions
   - Cliquer sur le workflow en cours
   - Cliquer sur **Review deployments**
   - Cocher `production`
   - Cliquer sur **Approve and deploy**
4. **Déploiement** → Le workflow exécute les étapes :
   - Backup du Terraform state
   - Terraform init
   - Terraform plan
   - Terraform apply
   - Ansible playbook traefik
   - Ansible playbook utilities
   - Ansible playbook monitoring
5. **Notification** → Un commentaire est posté sur le commit avec le résumé

---

## 📊 Interface d'Approbation

### Quand un déploiement est en attente :

```
🟡 Deploy to Production
   Waiting for approval from required reviewers

   [Review pending deployments]
```

### Pour approuver :

1. Cliquer sur **Review pending deployments**
2. Une popup s'affiche avec :
   ```
   ☐ production

   Comment (optional): ___________________________

   [Reject]  [Approve and deploy]
   ```
3. Cocher `production`
4. (Optionnel) Ajouter un commentaire : "Approved - Deployment validated"
5. Cliquer sur **Approve and deploy**

---

## ⚠️ Bonnes Pratiques

### Avant d'Approuver un Déploiement

✅ **À vérifier** :
1. Le commit inclut-il des changements dangereux ?
2. Les workflows de validation (Terraform, Ansible, Security) ont-ils passé sur la PR ?
3. Y a-t-il eu une review de code ?
4. Est-ce le bon moment pour déployer ? (pas en pleine journée de production)

### Rejeter un Déploiement

Si quelque chose ne va pas, vous pouvez **rejeter** :
1. Cliquer sur **Review pending deployments**
2. Cliquer sur **Reject**
3. Ajouter un commentaire expliquant pourquoi
4. Le workflow s'arrêtera avec status "cancelled"

---

## 🔍 Monitoring et Logs

### Voir l'Historique des Déploiements

1. Aller sur : https://github.com/HibOOps/infra-oldevops/deployments
2. Vous verrez tous les déploiements avec :
   - Date/Heure
   - Commit SHA
   - Status (Success/Failure)
   - Qui a approuvé

### Voir les Logs d'un Déploiement

1. Aller sur : https://github.com/HibOOps/infra-oldevops/actions
2. Cliquer sur le workflow concerné
3. Cliquer sur le job "Deploy to Production"
4. Voir les logs détaillés de chaque étape

---

## 🆘 Dépannage

### Problème : Le workflow ne demande pas d'approbation

**Cause** : L'environment n'est pas configuré correctement ou le nom ne correspond pas.

**Solution** :
1. Vérifier que l'environment s'appelle exactement `production`
2. Vérifier que le workflow utilise bien `environment: production`
3. Vérifier que "Required reviewers" est activé

### Problème : Je ne peux pas approuver (bouton grisé)

**Cause** : Vous êtes l'auteur du commit et vous êtes aussi le seul reviewer.

**Solution** :
1. Ajouter un 2ème reviewer dans l'environment (collègue, compte secondaire)
2. OU désactiver temporairement "Required reviewers" (non recommandé)

### Problème : Le déploiement échoue après approbation

**Cause** : Erreur Terraform ou Ansible.

**Solution** :
1. Consulter les logs du workflow
2. Identifier l'étape qui a échoué
3. Corriger le problème en local
4. Commit + push la correction
5. Un nouveau déploiement sera déclenché

---

## 📚 Ressources

- [GitHub Docs - Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Docs - Reviewing deployments](https://docs.github.com/en/actions/managing-workflow-runs/reviewing-deployments)

---

**Prochaines étapes** : Une fois l'environment configuré, tester le workflow avec un petit changement Terraform (ex: modifier un tag).
