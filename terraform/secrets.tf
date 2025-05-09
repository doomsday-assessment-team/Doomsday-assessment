resource "random_password" "password" {
  length = 16
  special = true
  override_special = "!#$&*()-=+[]{}<>:?"  # all tf special characters without '/', '@', '"', ' ' (rds requirement)
}

resource "aws_secretsmanager_secret" "doomsday-secret" {
  name = "doomsday-rds-db-secretss"

}

resource "aws_secretsmanager_secret_version" "s-version" {
  secret_id = aws_secretsmanager_secret.doomsday-secret.id
  secret_string = <<EOF
    {
      "username": "${var.rds_db_username}",
      "password": "${random_password.password.result}"
    }
  EOF
}