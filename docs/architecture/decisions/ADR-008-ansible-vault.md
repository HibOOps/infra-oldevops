# ADR-008 : Ansible Vault + GitHub Secrets pour la gestion des secrets

**Statut** : Accepté
**Date** : 2026-01-07
**Auteur** : Équipe DevOps

---

## Contexte

L'infrastructure nécessite la gestion de nombreux secrets : mots de passe des services, tokens OVH/Proxmox, clés SSH, JWT secrets. Ces secrets doivent être sécurisés dans Git (infra) et dans les pipelines CI/CD.

## Décision

- **Secrets infrastructure** : **Ansible Vault** (AES-256) — fichier `ansible/vars/proxmox-1_vault.yml` chiffré dans Git
- **Secrets CI/CD** : **GitHub Secrets** — injectés dans les workflows via `${{ secrets.NOM }}`

## Justification

**Séparation des responsabilités** :
- Ansible Vault gère les secrets nécessaires aux playbooks (mots de passe services, API keys OVH)
- GitHub Secrets gère les secrets nécessaires aux workflows (SSH_PRIVATE_KEY, PROXMOX_API_TOKEN)

**Ansible Vault** :
- Intégré à Ansible, pas de dépendance externe
- Chiffrement AES-256, clé stockée dans Vaultwarden (vault.oldevops.fr)
- Fichiers chiffrés versionnés dans Git — collaboration sans exposer les secrets

**GitHub Secrets** :
- Natif GitHub Actions, injection automatique dans les workflows
- Pas besoin de passer le mot de passe Vault à tous les workflows
- Rotation simple depuis l'interface GitHub

**Alternatives considérées** :
- **HashiCorp Vault** : 512 MB RAM dédié, complexité opérationnelle, overkill pour homelab
- **AWS/Azure Secrets Manager** : coût, dépendance cloud externe
- **Fichiers `.env` en clair** : risque commit accidentel (mitigé mais inacceptable)
- **Chiffrement GPG** : moins intégré à l'écosystème Ansible

## Conséquences

✅ Pas de dépendance externe (Ansible Vault intégré)
✅ Secrets infrastructure dans Git sous forme chiffrée (auditables)
✅ Séparation propre infra / CI/CD
⚠️ Mot de passe Vault = SPOF — stocké dans Vaultwarden (vault.oldevops.fr)
⚠️ Rotation manuelle des secrets (acceptable pour homelab, trimestrielle)

## Implémentation

```bash
# Editer les secrets vault
ansible-vault edit ansible/vars/proxmox-1_vault.yml

# Déchiffrer pour un playbook
ansible-playbook -i inventory.ini playbooks/system.yml --ask-vault-pass
# ou via fichier de pass (CI uniquement)
ansible-playbook --vault-password-file /tmp/vault_pass playbooks/system.yml
```

```yaml
# Utilisation dans un playbook
- name: Configure Traefik OVH credentials
  template:
    src: traefik.env.j2
    dest: /opt/traefik/.env
  vars:
    ovh_app_key: "{{ vault_ovh_app_key }}"  # depuis vault
```

Secrets GitHub requis : `SSH_PRIVATE_KEY`, `PROXMOX_API_TOKEN`, `ANSIBLE_VAULT_PASSWORD`, `JWT_SECRET`.
