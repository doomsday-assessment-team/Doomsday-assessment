resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "public_spa_bucket" {
  bucket = "doomsday-assessment-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_website_configuration" "public_spa_bucket_website" {
  bucket = aws_s3_bucket.public_spa_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "public_spa_bucket_ownership" {
  bucket = aws_s3_bucket.public_spa_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
  depends_on = [aws_s3_bucket_public_access_block.public_spa_bucket_block]
}

resource "aws_s3_bucket_public_access_block" "public_spa_bucket_block" {
  bucket = aws_s3_bucket.public_spa_bucket.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}


data "aws_iam_policy_document" "s3_public_read_policy" {
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.public_spa_bucket.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "public_spa_bucket_policy" {
  bucket = aws_s3_bucket.public_spa_bucket.id
  policy = data.aws_iam_policy_document.s3_public_read_policy.json

  depends_on = [aws_s3_bucket_public_access_block.public_spa_bucket_block]
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket created for the SPA."
  value       = aws_s3_bucket.public_spa_bucket.bucket
}

output "s3_bucket_website_endpoint" {
  description = "The S3 static website endpoint URL (HTTP only)."
  value       = aws_s3_bucket_website_configuration.public_spa_bucket_website.website_endpoint
}

output "s3_bucket_regional_domain_name" {
  description = "The regional domain name of the S3 bucket."
  value       = aws_s3_bucket.public_spa_bucket.bucket_regional_domain_name
}