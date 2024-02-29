resource "aws_ecr_repository" "repos" {
  for_each = { for repo in var.ecr_repo_names : "${var.project}-${var.env}-${repo}" => repo }

  name                 = each.key
  image_tag_mutability = "MUTABLE"
  # Add other configurations as needed
}
