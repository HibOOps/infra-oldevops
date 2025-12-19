resource "proxmox_lxc" "this" {
  vmid         = var.vmid
  hostname     = var.hostname
  target_node  = var.target_node
  ostemplate   = var.template
  password     = var.password
  unprivileged = var.unprivileged
  onboot       = var.start_on_boot
  start        = var.start_on_create
  description  = var.description
  ssh_public_keys = join("\n", var.ssh_public_keys)
  tags            = var.tags

  # CPU and Memory
  cores  = var.cores
  memory = var.memory
  swap   = var.swap

  # Disk configuration
  rootfs {
    storage = var.storage
    size    = "${var.disk}G"
  }

  # Network configuration
  network {
    name    = "eth0"
    bridge  = var.bridge
    ip      = var.ip
    gw      = var.gateway
  }

}

# Outputs
output "id" {
  description = "The ID of the container"
  value       = proxmox_lxc.this.id
}

output "ip_address" {
  description = "The primary IP address of the container"
  value       = var.ip
}

output "hostname" {
  description = "The hostname of the container"
  value       = proxmox_lxc.this.hostname
}

