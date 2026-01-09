output "container_ips" {
  description = "IP addresses of the consolidated containers"
  value = {
    "Proxy"      = module.proxy.ip_address
    "Utilities"  = module.utilities.ip_address
    "Monitoring" = module.monitoring.ip_address
  }
}

output "services" {
  description = "List of deployed services with their access URLs"
  value = {
    "Reverse Proxy (Traefik)" = "https://proxy.${var.domain}"
    "Vaultwarden"             = "https://vault.${var.domain}"
    "Snipe-IT"                = "https://inventory.${var.domain}"
    "Uptime Kuma"             = "https://status.${var.domain}"
    "Zabbix"                  = "https://monitoring.${var.domain}"
    "Grafana"                 = "https://grafana.${var.domain}"
    "Prometheus"              = "https://prometheus.${var.domain}"
  }
}

output "next_steps" {
  description = "Next steps to complete the setup"
  value       = <<EOT

Next steps:
1. Apply consolidated infrastructure:
   cd terraform
   terraform apply

2. Update Ansible inventory and deploy:
   cd ../ansible
   ansible-playbook -i inventory.ini playbooks/traefik.yml --ask-vault-pass
   ansible-playbook -i inventory.ini playbooks/utilities.yml --ask-vault-pass
   ansible-playbook -i inventory.ini playbooks/monitoring.yml --ask-vault-pass
EOT
}
