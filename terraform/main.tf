# Configuration des tags communs
locals {
  common_tags = ["managed-by:terraform", "environment:production"]
}

# Reverse Proxy (Nginx Proxy Manager)
module "reverse_proxy" {
  source      = "./modules/lxc_container"
  vmid        = 200
  hostname    = "proxy.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool

  # Resources
  cores       = 2
  memory      = 1024
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "172.20.0.2/24"
  gateway     = "172.20.0.1"
}


# Import other container configurations
module "uptime_kuma" {
  source      = "./modules/lxc_container"
  vmid        = 210
  hostname    = "uptimekuma.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool

  # Resources
  cores       = 1
  memory      = 512
  swap        = 512
  disk        = 4

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "172.20.0.10/24"
  gateway     = "172.20.0.1"
}

module "snipeit" {
  source      = "./modules/lxc_container"
  vmid        = 220
  hostname    = "snipe.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool

  # Resources
  cores       = 2
  memory      = 2048
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "172.20.0.20/24"
  gateway     = "172.20.0.1"
}

module "vaultwarden" {
  source      = "./modules/lxc_container"
  vmid        = 230
  hostname    = "vault.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool

  # Resources
  cores       = 2
  memory      = 1024
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "172.20.0.30/24"
  gateway     = "172.20.0.1"
}

module "zabbix" {
  source      = "./modules/lxc_container"
  vmid        = 240
  hostname    = "monitoring.${var.domain}"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool

  # Resources
  cores       = 2
  memory      = 2048
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "172.20.0.40/24"
  gateway     = "172.20.0.1"
}
# dans leurs fichiers respectifs dans les dossiers containers/ et vm/