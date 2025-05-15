output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.doomsday_app_alb.dns_name
}

output "rds_endpoint" {
  description = "PostgreSQL RDS instance endpoint"
  value       = aws_db_instance.doom_db_instance.endpoint
}

output "rds_address" {
  description = "PostgreSQL RDS instance endpoint"
  value       = aws_db_instance.doom_db_instance.address
}

output "website_url" {
  description = "The full HTTPS URL for the website"
  value       = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}

output "backend_url" {
  description = "The full HTTPS URL for the backend"
  value       = "https://${aws_cloudfront_distribution.alb_cf_distribution.domain_name}"
}
