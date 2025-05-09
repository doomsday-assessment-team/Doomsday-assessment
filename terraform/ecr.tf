resource "aws_ecr_repository" "ge_ecr_repository" {
  name = var.ecr_repo_name
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "/ecs/ecs-logs"
}

resource "aws_ecr_lifecycle_policy" "ge_app_lifecycle_policy" {
  repository = aws_ecr_repository.ge_ecr_repository.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Delete untagged images"
        selection = {
          tagStatus   = "untagged"
          countType   = "imageCountMoreThan"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}