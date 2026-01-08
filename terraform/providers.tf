terraform {
  required_providers {
    proxmox = {
      source  = "Telmate/proxmox"
      version = "~> 2.9.14" # Dernière version stable de Telmate/proxmox
    }
  }
  required_version = ">= 1.0.0"
}

provider "proxmox" {
  # Configuration options
  # URL de l'API construire dynamiquement si non spécifiée
  pm_api_url = var.proxmox_api_url != "" ? var.proxmox_api_url : "https://${var.proxmox_host}:8006/api2/json"

  # Utiliser le mot de passe pour les pleins pouvoirs (nécessaire pour privileged LXC et feature flags)
  pm_user     = var.proxmox_username
  pm_password = var.proxmox_password

  pm_tls_insecure = true
  pm_parallel     = 3
  pm_timeout      = 1200
}
