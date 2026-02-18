#!/bin/bash
# Script de déploiement complet - Infrastructure Consolidée
# Terraform (Infrastructure) + Ansible (Services)

set -e

echo "=== 🏗️ Démarrage du déploiement de l'Infrastructure ==="

# 1. Déploiement de l'infrastructure avec Terraform
echo "Étape 1 : Déploiement des LXC avec Terraform..."
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
cd ..

# 2. Attente de la disponibilité des conteneurs
echo "Étape 2 : Attente du démarrage des conteneurs (15s)..."
sleep 15

# 3. Configuration SSH et Sécurité
echo "Étape 3 : Configuration de la sécurité SSH..."
cd ansible
# Terraform a déjà injecté les clés, on peut directement configurer via Ansible
ansible-playbook -i inventory.ini playbooks/ssh-setup.yml

# 4. Déploiement des services
echo "Étape 4 : Déploiement des services Docker..."
ansible-playbook -i inventory.ini playbooks/traefik.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/utilities.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/monitoring.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbooks/app-demo.yml --ask-vault-pass

echo "=== ✅ Déploiement Terminé ==="
echo "Accès aux services :"
echo "  - Proxy (Traefik)   : https://proxy.oldevops.fr"
echo "  - Vaultwarden       : https://vault.oldevops.fr"
echo "  - Snipe-IT          : https://inventory.oldevops.fr"
echo "  - Uptime Kuma       : https://status.oldevops.fr"
echo "  - Zabbix / Grafana  : https://monitoring.oldevops.fr"
echo "  - App Demo          : https://app.oldevops.fr"
