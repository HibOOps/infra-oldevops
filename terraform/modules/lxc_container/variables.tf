variable "vmid" {}
variable "hostname" {}
variable "target_node" {}
variable "template" {}
variable "password" {}
variable "cores" {
  default = 2
}
variable "memory" {
  default = 512
}
variable "swap" {
  default = 512
}
variable "disk" {
  default = 4
}
variable "storage" {}
variable "bridge" {}
variable "ip" {}
variable "gateway" {}
