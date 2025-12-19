
terraform {
    backend "s3" {
    bucket                      = "infraoldevops"
    key                         = "terraform/homelab/terraform.tfstate"
    region                      = "rbx"
    profile                     = "oldevops"
    endpoint                    = "https://s3.rbx.io.cloud.ovh.net/"
    skip_region_validation      = true
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    }
}

