data "aws_secretsmanager_secret" "google_secrets" {
  name = "doomsday-google"
}

data "aws_secretsmanager_secret" "jwt_secrets" {
  name = "doomsday-jwt-secret"
}

data "aws_secretsmanager_secret_version" "google_secret_version" {
  secret_id = data.aws_secretsmanager_secret.google_secrets.id
}

locals {
  google_secrets = jsondecode(data.aws_secretsmanager_secret_version.google_secret_version.secret_string)
}