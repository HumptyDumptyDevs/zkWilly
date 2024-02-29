data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

variable "env" {
  description = "The environment to deploy to"
  type        = string
  default     = "dev"
}

variable "project" {
    description = "The project name"
    type        = string
    default     = "zkwilly"
}

variable "ecr_repo_names" {
  type    = list(string)
  default = ["fetch-blocks", "fetch-transactions", "process-transactions"]
}