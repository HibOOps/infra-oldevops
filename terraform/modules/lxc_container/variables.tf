variable "vmid" {}
variable "hostname" {}
variable "target_node" {}
variable "template" {}
variable "password" {}
variable "cores" {
  description = "Number of CPU cores for the container"
  type        = number
  default     = 2
}
variable "memory" {
  description = "Memory in MB for the container"
  type        = number
  default     = 512
}
variable "swap" {
  description = "Swap in MB for the container"
  type        = number
  default     = 512
}
variable "disk" {
  description = "Disk size in GB for the container"
  type        = number
  default     = 4
}
variable "storage" {
  description = "Proxmox storage pool to use"
  type        = string
}
variable "bridge" {
  description = "Network bridge to use (e.g., vmbr0)"
  type        = string
}
variable "ip" {
  description = "IP address with CIDR for the container (e.g., 172.20.0.2/24)"
  type        = string
}
variable "gateway" {
  description = "Gateway IP address for the container"
  type        = string
}
variable "unprivileged" {
  description = "If true, the container will be unprivileged"
  type        = bool
  default     = true
}
variable "start_on_boot" {
  description = "Start the container at boot"
  type        = bool
  default     = true
}
variable "start_on_create" {
  description = "Start the container after creation"
  type        = bool
  default     = true
}
variable "description" {
  description = "Description for the container"
  type        = string
  default     = "Managed by Terraform"
}
variable "tags" {
  description = "Tags for the container (comma-separated string)"
  type        = string
  default     = "managed-by:terraform"
}
variable "ssh_public_keys" {
  description = "SSH public keys to inject (optional)"
  type        = string
  default     = ""
}
