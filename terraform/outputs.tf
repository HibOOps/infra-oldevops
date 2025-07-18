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
    "Reverse Proxy" = "https://proxy.${var.domain}"
    "Uptime Kuma"  = "https://status.${var.domain}"
    "Snipe-IT"     = "https://inventory.${var.domain}"
    "Vaultwarden"  = "https://vault.${var.domain}"
    "Zabbix"       = "https://monitoring.${var.domain}"
  }
}

output "next_steps" {
  description = "Next steps to complete the setup"
  value = <<EOT

Next steps:
1. Configure DNS records to point to your Proxmox host's public IP:
   - A record: proxy.${var.domain} -> [YOUR_PUBLIC_IP]
   - CNAME records: *.${var.domain} -> proxy.${var.domain}

2. Initialize Terraform:
   terraform init

3. Create a terraform.tfvars file with your variables:
   proxmox_username = "your_username@pve"
   proxmox_password = "your_password"
   container_password = "secure_password"
   email = "your.email@example.com"

4. Plan and apply the configuration:
   terraform plan -out=tfplan
   terraform apply "tfplan"

5. After applying, configure the reverse proxy with the provided IPs.
EOT
}
