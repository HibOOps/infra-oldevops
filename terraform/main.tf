# Configuration des tags communs
locals {
  common_tags = "managed-by:terraform,environment:production"
}

# Reverse Proxy (Traefik)
module "reverse_proxy" {
  source      = "./modules/lxc_container"
  vmid        = 200
  hostname    = "proxy"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags        = local.common_tags

  # Resources
  cores       = 2
  memory      = 1024
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "10.0.0.2/24"
  gateway     = "10.0.0.1"
}

# Uptime Kuma
module "uptime_kuma" {
  source      = "./modules/lxc_container"
  vmid        = 210
  hostname    = "uptime-kuma"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags        = local.common_tags

  # Resources
  cores       = 1
  memory      = 512
  swap        = 512
  disk        = 4

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "10.0.0.10/24"
  gateway     = "10.0.0.1"
}

# Snipe-IT
module "snipeit" {
  source      = "./modules/lxc_container"
  vmid        = 220
  hostname    = "snipe-it"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags        = local.common_tags

  # Resources
  cores       = 2
  memory      = 2048
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "10.0.0.20/24"
  gateway     = "10.0.0.1"
}

# Vaultwarden
module "vaultwarden" {
  source      = "./modules/lxc_container"
  vmid        = 230
  hostname    = "vaultwarden"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags        = local.common_tags

  # Resources
  cores       = 2
  memory      = 1024
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "10.0.0.30/24"
  gateway     = "10.0.0.1"
}

# Zabbix
module "zabbix" {
  source      = "./modules/lxc_container"
  vmid        = 240
  hostname    = "zabbix-server"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags        = local.common_tags

  # Resources
  cores       = 2
  memory      = 2048
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "10.0.0.40/24"
  gateway     = "10.0.0.1"
}