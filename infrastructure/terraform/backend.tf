terraform {
  backend "s3" {
    bucket = "todoapp-terraform-state-2025"
    key    = "terraform.tfstate"
    region = "eu-central-1"
  }
}