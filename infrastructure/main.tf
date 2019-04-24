/**
 * Create the infrastructure for the VOD demo.
 *
 * @author Alibaba Cloud
 */

provider "alicloud" {}

// VPC and VSwitch
resource "alicloud_vpc" "voddemo_vpc" {
  name = "voddemo-vpc"
  cidr_block = "192.168.0.0/16"
}

data "alicloud_zones" "default" {
}
resource "alicloud_vswitch" "voddemo_vswitch" {
  name = "voddemo-vswitch"
  vpc_id = "${alicloud_vpc.voddemo_vpc.id}"
  cidr_block = "192.168.0.0/24"
  availability_zone = "${data.alicloud_zones.default.zones.0.id}"
}

// Security group
resource "alicloud_security_group" "voddemo_security_group" {
  name = "voddemo-security-group"
  vpc_id = "${alicloud_vpc.voddemo_vpc.id}"
}
resource "alicloud_security_group_rule" "voddemo_security_rule_22" {
  type = "ingress"
  ip_protocol = "tcp"
  policy = "accept"
  port_range = "22/22"
  security_group_id = "${alicloud_security_group.voddemo_security_group.id}"
  cidr_ip = "0.0.0.0/0"
}
resource "alicloud_security_group_rule" "voddemo_security_rule_80" {
  type = "ingress"
  ip_protocol = "tcp"
  policy = "accept"
  port_range = "80/80"
  security_group_id = "${alicloud_security_group.voddemo_security_group.id}"
  cidr_ip = "0.0.0.0/0"
}

// ECS instance
data "alicloud_instance_types" "medium" {
  cpu_core_count = 2
  memory_size = 4
}
data "alicloud_images" "ubuntu_images" {
  owners = "system"
  name_regex = "^ubuntu_18"
}
resource "alicloud_instance" "voddemo_ecs" {
  instance_name = "voddemo-ecs"
  host_name = "voddemo-ecs"
  password = "${var.ecs_root_password}"

  image_id = "${data.alicloud_images.ubuntu_images.images.0.id}"
  instance_type = "${data.alicloud_instance_types.medium.instance_types.0.id}"

  system_disk_category = "cloud_ssd"
  system_disk_size = 20

  vswitch_id = "${alicloud_vswitch.voddemo_vswitch.id}"
  security_groups = [
    "${alicloud_security_group.voddemo_security_group.id}"
  ]
}

// EIP
resource "alicloud_eip" "voddemo_eip" {
  name = "voddemo-eip"
  bandwidth = 1
}
resource "alicloud_eip_association" "voddemo_eip_association" {
  allocation_id = "${alicloud_eip.voddemo_eip.id}"
  instance_id = "${alicloud_instance.voddemo_ecs.id}"

  provisioner "file" {
    connection {
      host = "${alicloud_eip.voddemo_eip.ip_address}"
      user = "root"
      password = "${var.ecs_root_password}"
    }
    source = "resources/nginx-voddemo.conf"
    destination = "/tmp/nginx-voddemo.conf"
  }

  provisioner "file" {
    connection {
      host = "${alicloud_eip.voddemo_eip.ip_address}"
      user = "root"
      password = "${var.ecs_root_password}"
    }
    source = "resources/voddemo.service"
    destination = "/tmp/voddemo.service"
  }

  provisioner "file" {
    connection {
      host = "${alicloud_eip.voddemo_eip.ip_address}"
      user = "root"
      password = "${var.ecs_root_password}"
    }
    source = "../target/vod-demo-1.0.0.jar"
    destination = "/tmp/voddemo.jar"
  }

  provisioner "file" {
    connection {
      host = "${alicloud_eip.voddemo_eip.ip_address}"
      user = "root"
      password = "${var.ecs_root_password}"
    }
    source = "../src/main/resources/application.properties"
    destination = "/tmp/application.properties"
  }

  provisioner "file" {
    connection {
      host = "${alicloud_eip.voddemo_eip.ip_address}"
      user = "root"
      password = "${var.ecs_root_password}"
    }
    source = "resources/install_voddemo.sh"
    destination = "/tmp/install_voddemo.sh"
  }

  provisioner "remote-exec" {
    connection {
      host = "${alicloud_eip.voddemo_eip.ip_address}"
      user = "root"
      password = "${var.ecs_root_password}"
    }
    inline = "/tmp/install_voddemo.sh '${var.vod_service_access_key_id}}' '${var.vod_service_access_key_secret}}' '${var.vod_service_region_id}}' '${var.vod_service_template_group_id}}'"
  }
}

// Domain record
resource "alicloud_dns_record" "app_record_oversea" {
  name = "${var.top_domain_name}"
  type = "A"
  host_record = "${var.sub_domain_name}"
  routing = "oversea"
  value = "${alicloud_eip.voddemo_eip.ip_address}"
  ttl = 600
}
resource "alicloud_dns_record" "app_record_default" {
  name = "${var.top_domain_name}"
  type = "A"
  host_record = "${var.sub_domain_name}"
  routing = "default"
  value = "${alicloud_eip.voddemo_eip.ip_address}"
  ttl = 600
}