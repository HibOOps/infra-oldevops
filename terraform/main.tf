# Configuration des tags communs
locals {
  common_tags = "terraform;production;story-1.3-validated"
}

# 1. Conteneur Proxy (Traefik)
module "proxy" {
  source          = "./modules/lxc_container"
  vmid            = 200
  hostname        = "proxy"
  target_node     = var.proxmox_node
  template        = var.debian_template
  password        = var.container_password
  storage         = var.storage_pool
  tags            = local.common_tags
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources
  cores  = 2
  memory = 1024
  swap   = 512
  disk   = 8

  # Réseau
  bridge  = var.lxc_bridge
  ip      = "192.168.1.200/24"
  gateway = "192.168.1.254"
}

# 2. Conteneur Utilities (Snipe-IT, Vaultwarden)
module "utilities" {
  source          = "./modules/lxc_container"
  vmid            = 201  # Aligned with actual deployed VMID
  hostname        = "utilities"
  target_node     = var.proxmox_node
  template        = var.debian_template
  password        = var.container_password
  storage         = var.storage_pool
  tags            = "${local.common_tags};utilities"
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources
  cores  = 6
  memory = 8192
  swap   = 1024
  disk   = 40

  # Réseau
  bridge  = var.lxc_bridge
  ip      = "192.168.1.201/24"
  gateway = "192.168.1.254"
}

# 3. Conteneur Monitoring (Zabbix, Uptime Kuma, Prometheus, Grafana)
module "monitoring" {
  source          = "./modules/lxc_container"
  vmid            = 240  # Aligned with actual deployed VMID (corrected from 202)
  hostname        = "monitoring"
  target_node     = var.proxmox_node
  template        = var.debian_template
  password        = var.container_password
  storage         = var.storage_pool
  tags            = "${local.common_tags};monitoring"
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources
  cores  = 4
  memory = 6144
  swap   = 2048
  disk   = 50

  # Réseau
  bridge  = var.lxc_bridge
  ip      = "192.168.1.202/24"
  gateway = "192.168.1.254"
}

# 4. Conteneur CI/CD Runner (GitHub Actions Self-Hosted)
# WARNING: This container runs the GitHub Actions runner that executes Terraform.
# It must never be destroyed or modified by Terraform apply - doing so kills the workflow.
# Migration plan: move to an external VPS (OVH/Hetzner) with VPN access to homelab.
module "ci_runner" {
  source          = "./modules/lxc_container"
  vmid            = 210
  hostname        = "ci-runner"
  target_node     = var.proxmox_node
  template        = var.debian_template
  password        = var.container_password
  storage         = var.storage_pool
  tags            = "${local.common_tags};cicd;github-runner"
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = false

  # Resources - Runner needs good specs for parallel jobs
  cores  = 4
  memory = 4096
  swap   = 1024
  disk   = 30

  # Réseau
  bridge  = var.lxc_bridge
  ip      = "192.168.1.210/24"
  gateway = "192.168.1.254"
}

# 5. Conteneur App Demo (Application de démonstration)
module "app_demo" {
  source          = "./modules/lxc_container"
  vmid            = 250
  hostname        = "app-demo"
  target_node     = var.proxmox_node
  template        = var.debian_template
  password        = var.container_password
  storage         = var.storage_pool
  tags            = "${local.common_tags};app-demo"
  ssh_public_keys = var.ssh_public_keys
  unprivileged    = true

  # Resources
  cores  = 2
  memory = 2048
  swap   = 512
  disk   = 20

  # Réseau
  bridge  = var.lxc_bridge
  ip      = "192.168.1.250/24"
  gateway = "192.168.1.254"
}