resource "aws_db_subnet_group" "ge_db_subnet_group" {
  name        = "ge-db-subnet-group"
  subnet_ids = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
  description = "Subnet group for the PostgreSQL RDS instance"
}

locals {
  db_creds = jsondecode(aws_secretsmanager_secret_version.s-version.secret_string)
}

resource "aws_db_instance" "doom_db_instance" {
  identifier           = "doomday-db"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  db_name              = var.rds_db_name
  username             = local.db_creds.username
  password             = local.db_creds.password
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name = aws_db_subnet_group.ge_db_subnet_group.name
  multi_az             = false
  publicly_accessible  = true
  skip_final_snapshot  = true
}

