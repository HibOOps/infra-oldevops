resource "proxmox_lxc" "this" {
  vmid         = var.vmid
  hostname     = var.hostname
  target_node  = var.target_node
  ostemplate   = var.template
  password     = var.password
  unprivileged = true

  cores   = var.cores
  memory  = var.memory
  swap    = var.swap
  disk    = var.disk
  storage = var.storage

  network {
    name   = "eth0"
    bridge = var.bridge
    ip     = var.ip
    gw     = var.gateway
  }

  features {
    nesting = true
  }

  start = true
}
