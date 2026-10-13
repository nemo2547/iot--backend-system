terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.0"
    }
  }
}

provider "docker" {}

# ดึง Image ubuntu:22.04
resource "docker_image" "ubuntu" {
  name         = "ubuntu:22.04"
  keep_locally = true
}

# จำลอง Cloud Server เป็น Docker Container บนเครื่อง
resource "docker_container" "iot_server" {
  image = docker_image.ubuntu.image_id
  name  = "iot-cloud-server-mock"
  
  # สั่งให้รันค้างไว้ไม่ให้ exited
  command = ["tail", "-f", "/dev/null"]

  # เปิดพอร์ตจำลองสำหรับ SSH และ Web App
  ports {
    internal = 22
    external = 2222
  }
  ports {
    internal = 3000
    external = 3000
  }
}

output "server_ip" {
  value       = "127.0.0.1"
  description = "Localhost IP for testing"
}