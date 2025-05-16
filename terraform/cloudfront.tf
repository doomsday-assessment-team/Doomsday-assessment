locals {
  s3_origin_id = "S3-doomsday-assessment"
  cloudfront_origin_id = "ALB-doomsday-assessment"
}

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "doomsday-oac"
  description                       = "OAC for S3 bucket doomsday"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.public_spa_bucket.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "S3 static website distribution for doomsday"
  default_root_object = "index.html"


  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

  }

  ordered_cache_behavior {
    path_pattern     = "/config.js"
    target_origin_id = local.s3_origin_id

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  depends_on = [aws_s3_bucket_policy.public_spa_bucket_policy]
}


resource "aws_cloudfront_distribution" "alb_cf_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront for ECS ALB"
  default_root_object = null

  origin {
    domain_name = aws_lb.doomsday_app_alb.dns_name
    origin_id   = local.cloudfront_origin_id

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_read_timeout      = 30
      origin_keepalive_timeout = 5
    }

  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    target_origin_id = local.cloudfront_origin_id

    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id = "78644860-371e-416c-9ffe-fda1f3de1a74"

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}