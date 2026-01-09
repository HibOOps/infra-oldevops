#!/usr/bin/env bash
# Script pour récupérer le mot de passe Ansible Vault
# Usage:
#   - En local: export ANSIBLE_VAULT_PASSWORD="votre_mot_de_passe"
#   - En CI/CD: Injecté via GitHub Secrets automatiquement

set -euo pipefail

# Priorité 1: Variable d'environnement ANSIBLE_VAULT_PASSWORD (pour CI/CD)
if [[ -n "${ANSIBLE_VAULT_PASSWORD:-}" ]]; then
    echo "${ANSIBLE_VAULT_PASSWORD}"
    exit 0
fi

# Priorité 2: Fichier local .vault_pass (pour dev local)
VAULT_PASS_FILE="${ANSIBLE_VAULT_PASS_FILE:-.vault_pass}"
if [[ -f "${VAULT_PASS_FILE}" ]]; then
    cat "${VAULT_PASS_FILE}"
    exit 0
fi

# Aucune source de mot de passe trouvée
echo "ERROR: Aucun mot de passe vault trouvé !" >&2
echo "Définissez ANSIBLE_VAULT_PASSWORD ou créez le fichier .vault_pass" >&2
exit 1
