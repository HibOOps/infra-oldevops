# Configuration des tags communs
locals {
  common_tags = "terraform;production"
}

# 1. Conteneur Proxy (Traefik)
module "proxy" {
  source      = "./modules/lxc_container"
  vmid        = 200
  hostname    = "proxy"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags            = local.common_tags
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources
  cores       = 2
  memory      = 1024
  swap        = 512
  disk        = 8

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "192.168.20.100/24"
  gateway     = "192.168.20.1"
}

# 2. Conteneur Utilities (Snipe-IT, Vaultwarden)
module "utilities" {
  source      = "./modules/lxc_container"
  vmid        = 220
  hostname    = "utilities"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags            = "${local.common_tags};utilities"
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources
  cores       = 6
  memory      = 8192
  swap        = 1024
  disk        = 40

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "192.168.20.101/24"
  gateway     = "192.168.20.1"
}

# 3. Conteneur Monitoring (Zabbix, Uptime Kuma, Prometheus, Grafana)
module "monitoring" {
  source      = "./modules/lxc_container"
  vmid        = 240
  hostname    = "monitoring"
  target_node = var.proxmox_node
  template    = var.debian_template
  password    = var.container_password
  storage     = var.storage_pool
  tags            = "${local.common_tags};monitoring"
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources
  cores       = 4
  memory      = 6144
  swap        = 2048
  disk        = 50

  # Réseau
  bridge      = var.lxc_bridge
  ip          = "192.168.20.102/24"
  gateway     = "192.168.20.1"
}