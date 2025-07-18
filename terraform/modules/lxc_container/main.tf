resource "proxmox_lxc" "this" {
  vmid         = var.vmid
  hostname     = var.hostname
  target_node  = var.target_node
  ostemplate   = var.template
  password     = var.password
  unprivileged = var.unprivileged
  onboot       = var.start_on_boot
  start        = var.start_on_create
  description  = var.description != "" ? var.description : "Managed by Terraform - ${var.hostname}"

  # CPU and Memory
  cores  = var.cores
  memory = var.memory
  swap   = var.swap

  # Disk configuration
  rootfs {
    storage = var.storage
    size    = var.disk_size
  }

  # Network configuration
  dynamic "network" {
    for_each = var.network_interfaces
    content {
      name     = network.value.name
      bridge   = network.value.bridge
      ip       = network.value.ip
      gw       = network.value.gateway
      ip6      = lookup(network.value, "ip6", "")
      gw6      = lookup(network.value, "gateway6", "")
      mtu      = lookup(network.value, "mtu", 1500)
      tag      = lookup(network.value, "vlan_tag", null)
      rate     = lookup(network.value, "rate", null)  # MB/s (MegaBytes per second)
    }
  }

  # Features
  features {
    nesting = var.features.nesting
    keyctl  = var.features.keyctl
    fuse    = var.features.fuse
    mknod   = var.features.mknod
  }

  # SSH keys if provided
  ssh_public_keys = var.ssh_public_keys

  # Mount points
  dynamic "mountpoint" {
    for_each = var.mount_points
    content {
      key      = mountpoint.key
      slot     = mountpoint.value.slot
      storage  = mountpoint.value.storage
      mp       = mountpoint.value.mount_point
      size     = mountpoint.value.size
      acl      = lookup(mountpoint.value, "acl", true)
      backup   = lookup(mountpoint.value, "backup", true)
      quota    = lookup(mountpoint.value, "quota", false)
      replicate = lookup(mountpoint.value, "replicate", true)
      shared   = lookup(mountpoint.value, "shared", false)
    }
  }

  # Tags for easier management
  tags = var.tags

  # Lifecycle
  lifecycle {
    ignore_changes = [
      ostemplate,
      network,
      rootfs,
      features,
      mountpoint
    ]
  }
}

# Outputs
output "id" {
  description = "The ID of the container"
  value       = proxmox_lxc.this.id
}

output "ip_address" {
  description = "The primary IP address of the container"
  value       = var.network_interfaces[0].ip
}

output "hostname" {
  description = "The hostname of the container"
  value       = proxmox_lxc.this.hostname
}

output "status" {
  description = "The status of the container"
  value       = proxmox_lxc.this.status
}
