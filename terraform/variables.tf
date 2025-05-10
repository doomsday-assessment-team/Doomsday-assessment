variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "subnet_cidr_a" {
  description = "CIDR block for subnet A"
  default     = "10.0.1.0/24"
}

variable "subnet_cidr_b" {
  description = "CIDR block for subnet B"
  default     = "10.0.2.0/24"
}

variable "default_region" {
  description = "Default region"
  default     = "af-south-1"
}

variable "subnet_availability_zone_a" {
  description = "Availability zone for subnet A"
  default     = "af-south-1a"
}

variable "subnet_availability_zone_b" {
  description = "Availability zone for subnet B"
  default     = "af-south-1b"
}

variable "rds_db_username" {
  description = "Username for the PostgreSQL database"
  default     = "zombie"
}

variable "rds_db_name" {
  description = "Name of the PostgreSQL database"
  default     = "doomsdaydb"
}

variable "ecr_repo_name" {
  type = string
  default = "doomday-repository"
}

variable "ecs_cluster_name" {
  type = string
  default = "doomsday_ecs_cluster"
}