# Configuration des GitHub Secrets

Guide pour configurer les secrets nécessaires aux workflows GitHub Actions.

## 🔐 Secrets Requis

Les workflows ont besoin d'accéder à des informations sensibles (credentials Proxmox, OVH S3, etc.). Ces informations doivent être stockées dans GitHub Secrets.

---

## 📋 Liste Complète des Secrets

### 1. OVH S3 (Backend Terraform State)

| Secret | Description | Exemple |
|--------|-------------|---------|
| `OVH_S3_ACCESS_KEY` | Access Key OVH S3 | `xxxxxxxxxxxxxxxxxxxxx` |
| `OVH_S3_SECRET_KEY` | Secret Key OVH S3 | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

**Utilisation :** Terraform backend pour lire/écrire le state sur OVH Object Storage.

**Où les trouver :**
1. Console OVH → Public Cloud → Object Storage
2. S3 Users → Votre utilisateur
3. Credentials affiché lors de la création

---

### 2. Proxmox API

| Secret | Description | Exemple |
|--------|-------------|---------|
| `PROXMOX_USERNAME` | Utilisateur API Proxmox | `root@pam` |
| `PROXMOX_PASSWORD` | Mot de passe Proxmox | `votre_mot_de_passe` |

**Utilisation :** Terraform pour créer/gérer les containers LXC.

**Notes :**
- Utilisez le même utilisateur que pour vos déploiements locaux
- Si vous utilisez un token API, adaptez les workflows

---

### 3. Containers LXC

| Secret | Description | Exemple |
|--------|-------------|---------|
| `CONTAINER_PASSWORD` | Mot de passe root des containers | `votre_mot_de_passe_containers` |

**Utilisation :** Terraform pour définir le mot de passe root initial des containers.

**Notes :**
- Même mot de passe que dans votre `terraform.tfvars` local
- Utilisé lors de la création initiale seulement

---

### 4. Ansible Vault (Optionnel pour cette phase)

| Secret | Description | Exemple |
|--------|-------------|---------|
| `ANSIBLE_VAULT_PASSWORD` | Mot de passe pour décrypter vault | `votre_mot_de_passe_vault` |

**Utilisation :** Workflows futurs de déploiement Ansible automatique.

**Notes :**
- Même mot de passe que dans votre `.vault_pass` local
- Non utilisé par les workflows actuels (validation seulement)
- **IMPORTANT pour Phase 3** (auto-déploiement)

---

## 🛠️ Comment Ajouter les Secrets

### Étape 1 : Accéder aux Settings

```
https://github.com/HibOOps/infra-oldevops/settings/secrets/actions
```

Ou manuellement :
1. Allez sur votre repo GitHub
2. Cliquez sur `Settings`
3. Dans la sidebar : `Secrets and variables` → `Actions`
4. Cliquez sur `New repository secret`

### Étape 2 : Ajouter chaque secret

Pour chaque secret de la liste :

1. **Name** : Nom exact du secret (ex: `OVH_S3_ACCESS_KEY`)
2. **Secret** : La valeur (sera masquée)
3. Cliquez sur `Add secret`

### Étape 3 : Vérifier

Une fois tous les secrets ajoutés, vous devriez voir :

```
✅ OVH_S3_ACCESS_KEY         Updated X days ago
✅ OVH_S3_SECRET_KEY         Updated X days ago
✅ PROXMOX_USERNAME          Updated X days ago
✅ PROXMOX_PASSWORD          Updated X days ago
✅ CONTAINER_PASSWORD        Updated X days ago
✅ ANSIBLE_VAULT_PASSWORD    Updated X days ago (optionnel)
```

---

## 🧪 Tester les Secrets

### Test 1 : Terraform Workflow

```bash
# Créer une branche de test
git checkout -b test/secrets-validation

# Modifier un fichier Terraform
echo "# Test" >> terraform/main.tf

# Commit et push
git add terraform/main.tf
git commit -m "test: validate secrets configuration"
git push -u origin test/secrets-validation

# Créer une PR
gh pr create --title "Test: Secrets validation" --body "Testing workflow secrets"
```

**Vérifier dans les logs du workflow :**
- ✅ `terraform init` réussit → Secrets OVH S3 OK
- ✅ `terraform plan` réussit → Secrets Proxmox OK

### Test 2 : Security Workflow

Le workflow `security-scan.yml` n'a pas besoin de secrets spécifiques, il utilise uniquement `GITHUB_TOKEN` (auto-généré).

Vérifiez simplement qu'il s'exécute sans erreur.

---

## 🔒 Sécurité des Secrets

### Bonnes Pratiques

✅ **DO:**
- Utiliser des secrets différents pour dev/staging/prod (quand applicable)
- Rotation régulière des credentials (tous les 90 jours recommandé)
- Accès limité au repo (seuls les collaborateurs autorisés)
- Audit régulier des secrets utilisés

❌ **DON'T:**
- Ne jamais logger les secrets dans les workflows
- Ne jamais exporter les secrets dans des artifacts
- Ne jamais commiter de secrets dans le code (même encrypté faiblement)
- Ne jamais partager les secrets via Slack/Email

### GitHub Protections Automatiques

GitHub protège automatiquement vos secrets :
- 🔒 Masqués dans les logs (`***`)
- 🔒 Non accessibles dans les forks
- 🔒 Non exportables une fois créés
- 🔒 Audit log des accès

### Rotation des Secrets

Quand changer un secret :

1. **OVH S3** : Tous les 90 jours ou si compromis
   - Générer nouvelles credentials OVH
   - Mettre à jour GitHub Secret
   - Tester un workflow

2. **Proxmox** : Si mot de passe changé sur le serveur
   - Changer dans GitHub Secrets
   - Changer localement (`terraform.tfvars`)

3. **Container Password** : Rarement nécessaire
   - Seulement si vous recréez tous les containers

4. **Ansible Vault Password** : Si compromis
   - Changer le mot de passe vault
   - Re-encrypter `vault/secrets.yml`
   - Mettre à jour GitHub Secret
   - Mettre à jour `.vault_pass` local

---

## 🐛 Troubleshooting

### Erreur : "Secret not found"

**Symptôme :** Workflow échoue avec `secret OVH_S3_ACCESS_KEY not found`

**Solution :**
1. Vérifier l'orthographe exacte du secret
2. Vérifier qu'il est bien ajouté dans `Settings` → `Secrets`
3. Les secrets sont case-sensitive !

### Erreur : "Access denied" avec Terraform

**Symptôme :** `terraform init` échoue avec erreur d'authentification

**Solution :**
1. Vérifier que `OVH_S3_ACCESS_KEY` et `OVH_S3_SECRET_KEY` sont corrects
2. Tester localement avec les mêmes credentials
3. Vérifier les permissions du bucket S3

### Erreur : Proxmox API authentication failed

**Symptôme :** `terraform plan` échoue avec erreur Proxmox API

**Solution :**
1. Vérifier `PROXMOX_USERNAME` et `PROXMOX_PASSWORD`
2. Tester l'authentification localement
3. Vérifier que l'utilisateur a les permissions nécessaires

### Secret Updated mais toujours ancienne valeur

**Symptôme :** Le workflow utilise toujours l'ancienne valeur

**Solution :**
- Attendre 1-2 minutes (propagation GitHub)
- Relancer le workflow manuellement
- Vérifier que vous avez bien sauvegardé le nouveau secret

---

## 📋 Checklist de Configuration

Avant de créer votre première PR :

- [ ] Tous les secrets ajoutés dans GitHub
- [ ] Secrets testés localement avec mêmes valeurs
- [ ] OVH S3 access testé (`aws s3 ls` avec credentials)
- [ ] Proxmox API access testé (connexion web UI fonctionne)
- [ ] Branche `main` protégée avec status checks requis
- [ ] Au moins 1 PR de test créée et passée
- [ ] Workflows s'exécutent sans erreur
- [ ] Commentaires automatiques apparaissent sur la PR

---

## 📚 Voir Aussi

- [Documentation Workflows](github-actions-workflows.md)
- [Guide Déploiement Runner](CI-CD-RUNNER-SETUP.md)
- [Story 1.1](stories/story-1.1.md)

---

**Auteur :** Alex - DevOps Infrastructure Specialist
**Date :** 2026-01-08
