
terraform {
  backend "s3" {
    bucket = "infraoldevops"
    key    = "terraform/homelab/terraform.tfstate"
    region = "rbx"
    # profile removed - using AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars
    endpoint                    = "https://s3.rbx.io.cloud.ovh.net/"
    skip_region_validation      = true
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    # skip_requesting_account_id  = true # Required for OVH S3 (non-AWS) - Requires Terraform >= 1.6.0
  }
}

