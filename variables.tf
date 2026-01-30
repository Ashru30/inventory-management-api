variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "aws_profile" {
  type    = string
  default = "default"
}

variable "cidr_block" {
  type    = string
  default = "10.0.0.0/16"
}

variable "private_subnets" {
  type    = number
  default = 2
}

variable "database" {
  type    = string
  default = "webapp"
}

variable "artifact_location" {
  type    = string
  default = "lambda.zip"
}

variable "domain" {
  type    = string
  default = "api.example.com"
}

variable "api_stage" {
  type    = string
  default = "prod"
}
