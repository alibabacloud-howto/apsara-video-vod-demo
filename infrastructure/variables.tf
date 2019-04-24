variable "top_domain_name" {
  description = "Top domain name registered in Alibaba Cloud (e.g. my-sample-domain.xyz)."
}

variable "sub_domain_name" {
  description = "Sub domain name for this demo (e.g. vod-demo)."
}

variable "ecs_root_password" {
  description = "Root password of the ECS instance."
}

variable "vod_service_access_key_id" {
  description = "Access key ID of your RAM user with the AliyunVoDFullAccess policy."
}

variable "vod_service_access_key_secret" {
  description = "Access key secret of your RAM user with the AliyunVoDFullAccess policy."
}

variable "vod_service_region_id" {
  description = "Region of the VOD service (e.g. ap-southeast-1)."
}

variable "vod_service_template_group_id" {
  description = "ID of the 'multiple-sizes' template."
}
