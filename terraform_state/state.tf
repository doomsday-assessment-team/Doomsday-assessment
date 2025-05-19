
resource "aws_s3_bucket" "state_bucket" {

  bucket = "doomsday-tf-state"

  lifecycle {
    prevent_destroy = true
  }

}

resource "aws_s3_bucket_versioning" "state_bucket_versioning" {
  bucket = aws_s3_bucket.state_bucket.id

  versioning_configuration {
    status = "Enabled"
  }

}

resource "aws_s3_bucket_server_side_encryption_configuration" "state_enc" {
  bucket = aws_s3_bucket.state_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state_access" {
  bucket = aws_s3_bucket.state_bucket.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "state_lock_table" {
  name = "doomsday-state-lock-table"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "LockID"

  lifecycle {
    prevent_destroy = true
  }

  attribute {
    name = "LockID"
    type = "S"
  }
}