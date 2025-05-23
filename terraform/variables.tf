variable "proxmox_node" {
  default = "proxmox"
}
variable "debian_template" {
  default = "local:vztmpl/debian-12-standard_12.0-1_amd64.tar.zst"
}
variable "container_password" {
  default = "derfugue59"
}
variable "lxc_bridge" {
  default = "vmbr1"
}
variable "storage_pool" {
  default = "local-lvm"
}
