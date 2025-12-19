output "reverse_proxy_ip" {
  description = "IP address of the reverse proxy container"
  value       = module.reverse_proxy.ip_address
}

output "reverse_proxy_hostname" {
  description = "Hostname of the reverse proxy"
  value       = "proxy.${var.domain}"
}

output "services" {
  description = "List of deployed services with their access URLs"
  value = {
    "Reverse Proxy (Traefik)" = "https://proxy.${var.domain}"
    "Uptime Kuma"            = "https://status.${var.domain}"
    "Snipe-IT"               = "https://inventory.${var.domain}"
    "Vaultwarden"            = "https://vault.${var.domain}"
    "Zabbix"                 = "https://monitoring.${var.domain}"
  }
}

output "next_steps" {
  description = "Next steps to complete the setup"
  value = <<EOT

Next steps:
1. Configure DNS records on OVH:
   - A record: proxy.${var.domain} -> [YOUR_PUBLIC_IP]
   - CNAME records: *.${var.domain} -> proxy.${var.domain}

2. Deploy Infrastructure:
   terraform init
   terraform apply "tfplan"

3. Deploy Services with Ansible:
   cd ../ansible
   # Encrypt secrets if not done: ansible-vault encrypt vault/secrets.yml
   ansible-playbook -i inventory.ini playbooks/traefik.yml --ask-vault-pass
   ansible-playbook -i inventory.ini playbooks/uptime-kuma.yml
   ansible-playbook -i inventory.ini playbooks/vaultwarden.yml
   ansible-playbook -i inventory.ini playbooks/snipeit.yml
   ansible-playbook -i inventory.ini playbooks/zabbix.yml
EOT
}
