module "uptime_kuma" {
  source          = "../modules/lxc_container"
  vmid            = 201
  hostname        = "uptime-kuma"
  target_node     = var.proxmox_node
  template        = var.debian_template
  password        = var.container_password
  storage         = var.storage_pool
  bridge          = var.lxc_bridge
  ip              = "10.0.0.10/24"
  gateway         = "10.0.0.1"
  ssh_public_keys = var.ssh_public_keys
}
