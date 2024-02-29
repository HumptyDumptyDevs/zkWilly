provider "aws" {
  region = "eu-central-1"
}

# Resource to create the S3 bucket for Terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "zkwilly-${var.env}-terraform-state" # Must be globally unique
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
  lifecycle {
    prevent_destroy = true
  }
}

terraform {
  backend "s3" {
    key    = "terraform.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.0.0"
    }
  }
}