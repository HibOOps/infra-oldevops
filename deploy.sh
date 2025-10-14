#!/bin/bash
# Complete deployment script - Terraform + Ansible

set -e

echo "=== Starting Infrastructure Deployment ==="

# 1. Deploy infrastructure with Terraform
echo "Step 1: Deploying infrastructure with Terraform..."
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
cd ..

# 2. Wait for containers to be ready
echo "Step 2: Waiting for containers to be ready..."
sleep 10

# 3. Bootstrap SSH on containers
echo "Step 3: Bootstrapping SSH access..."
cd ansible
ansible-playbook -i inventory.ini playbooks/bootstrap-lxc.yml

# 4. Configure SSH properly
echo "Step 4: Configuring SSH security..."
ansible-playbook -i inventory.ini playbooks/ssh-setup.yml

# 5. Test connectivity
echo "Step 5: Testing connectivity..."
ansible lxc_containers -i inventory.ini -m ping

echo "=== Deployment Complete ==="
echo "You can now SSH to containers:"
echo "  ssh 10.0.0.2  (reverse-proxy)"
echo "  ssh 10.0.0.10 (uptime-kuma)"
echo "  ssh 10.0.0.20 (snipeit)"
echo "  ssh 10.0.0.30 (vaultwarden)"
echo "  ssh 10.0.0.40 (zabbix)"
