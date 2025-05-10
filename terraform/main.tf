terraform {

  backend "s3" {
    bucket = "doomsday-tf-state"
    dynamodb_table = "doomsday-state-lock-table"
    encrypt = true
    region = "af-south-1"
    key = "doomsday/main.tfstate"
  }

  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.86.1"
    }

  }
}

provider "aws" {
  region = "af-south-1"
}