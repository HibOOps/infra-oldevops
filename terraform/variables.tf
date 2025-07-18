# Proxmox Configuration
variable "proxmox_host" {
  description = "Proxmox hostname or IP address"
  type        = string
  default     = "proxmox.oldevops.fr"
}

variable "proxmox_username" {
  description = "Proxmox API username"
  type        = string
  sensitive   = true
}

variable "proxmox_password" {
  description = "Proxmox API password"
  type        = string
  sensitive   = true
}

variable "proxmox_node" {
  description = "Name of the Proxmox node"
  type        = string
  default     = "proxmox"
}

# Container Configuration
variable "debian_template" {
  description = "Name of the Debian template to use for LXC containers"
  type        = string
  default     = "local:vztmpl/debian-12-standard_12.0-1_amd64.tar.zst"
}

variable "container_password" {
  description = "Root password for the containers"
  type        = string
  sensitive   = true
  default     = "" # Should be set via environment variable or .tfvars
}

# Network Configuration
variable "lxc_bridge" {
  description = "Bridge interface for LXC containers"
  type        = string
  default     = "vmbr1"
}

variable "storage_pool" {
  description = "Default storage pool for LXC containers"
  type        = string
  default     = "local-lvm"
}

# Domain Configuration
variable "domain" {
  description = "Base domain for all services"
  type        = string
  default     = "oldevops.fr"
}

# Let's Encrypt Configuration
variable "email" {
  description = "Email address for Let's Encrypt"
  type        = string
  default     = "admin@oldevops.fr"
}

# Resource Defaults
variable "default_cores" {
  description = "Default number of CPU cores for containers"
  type        = number
  default     = 1
}

variable "default_memory" {
  description = "Default memory in MB for containers"
  type        = number
  default     = 512
}

variable "default_disk_size" {
  description = "Default disk size for containers (e.g., '8G')"
  type        = string
  default     = "8G"
}
