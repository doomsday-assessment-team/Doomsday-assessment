output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.doomsday_app_alb.dns_name
}

output "rds_endpoint" {
  description = "PostgreSQL RDS instance endpoint"
  value       = aws_db_instance.doom_db_instance.endpoint
}
