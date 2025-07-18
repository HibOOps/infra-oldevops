terraform {
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.38.1"
    }
  }
  required_version = ">= 1.0.0"
}

provider "proxmox" {
  # Configuration options
  endpoint = "https://${var.proxmox_host}:8006/"
  username = var.proxmox_username
  password = var.proxmox_password
  insecure = true  # Only for development, use proper certificates in production
}

# Configuration des tags communs
locals {
  common_tags = ["managed-by:terraform", "environment:production"]
}

# Reverse Proxy (Nginx Proxy Manager)
module "reverse_proxy" {
  source = "./modules/lxc_container"
  
  vmid        = 200
  hostname    = "proxy.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  
  # Resources
  cores     = 2
  memory    = 1024
  swap      = 512
  disk_size = "8G"
  
  # Network
  network_interfaces = [
    {
      name     = "eth0"
      bridge   = var.lxc_bridge
      ip       = "172.20.0.2/24"
      gateway  = "172.20.0.1"
      mtu      = 1500
      vlan_tag = null
    }
  ]
  
  # Features
  features = {
    nesting = true
    keyctl  = true
    fuse    = true
    mknod   = true
  }
  
  # Tags
  tags = concat(local.common_tags, ["role:reverse-proxy"])
  
  # Startup options
  start_on_boot = true
  start_on_create = true
  
  description = "Reverse Proxy (Nginx Proxy Manager) for ${var.domain}"
}

# Import other container configurations
module "uptime_kuma" {
  source = "./modules/lxc_container"
  
  vmid        = 201
  hostname    = "status.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  
  # Resources
  cores     = 1
  memory    = 512
  swap      = 512
  disk_size = "4G"
  
  # Network
  network_interfaces = [
    {
      name     = "eth0"
      bridge   = var.lxc_bridge
      ip       = "172.20.0.10/24"
      gateway  = "172.20.0.1"
    }
  ]
  
  # Tags
  tags = concat(local.common_tags, ["role:monitoring"])
  
  description = "Uptime Kuma monitoring for ${var.domain}"
}

# Les autres modules (Snipe-IT, Vaultwarden, Zabbix) seront configurés de manière similaire
# dans leurs fichiers respectifs dans les dossiers containers/ et vm/