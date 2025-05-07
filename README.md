# 🌤️ Weather Forecast App – DevOps Project by Dubi Thal

## 🎯 Overview
This is a Flask-based weather forecast web application deployed in a Docker container on an AWS EC2 instance. The project uses Jenkins for CI/CD and Terraform for infrastructure management. GitHub and DockerHub are integrated for version control and image storage.
**Weather data is retrieved via the [OpenWeatherMap API](https://openweathermap.org/api).**

## 🧱 Infrastructure Setup
- **Cloud Provider**: AWS (Free Tier)
- **Provisioning Tool**: Terraform

**Resources Created**:
- VPC
- Subnet
- Internet Gateway
- Security Group
- EC2 Instance (Amazon Linux 2) – named "jenkins" but used to run both Jenkins and the Flask app

## ⚙️ Tools & Technologies
| Tool        | Purpose                         |
|-------------|----------------------------------|
| Flask       | Web framework for Python        |
| Docker      | Containerization                |
| Jenkins     | CI/CD server (running in Docker)|
| Git         | Version control                 |
| GitHub      | Source code hosting             |
| DockerHub   | Image repository                |
| Terraform   | Infrastructure-as-Code          |
| NGINX       | Reverse proxy and HTTPS support |

## 🐳 Docker Setup
The project contains two Docker Compose setups:

- **app/** – Contains the Flask application and NGINX reverse proxy.
- **jenkins/** – Contains the Jenkins server, fully Dockerized with customized Dockerfile and plugins.

Jenkins is configured via Docker Compose and listens on port 8080.
NGINX serves as a secure reverse proxy for the Flask app (port 443) and handles HTTPS via Let's Encrypt certificates.

## 🔁 CI/CD Pipeline (Jenkins)
The Jenkins pipeline (defined in `Jenkinsfile`) performs the following:
- Clones the GitHub repository
- Builds the Docker image for the Flask app
- Pushes the image to DockerHub
- *(Upcoming)* Deploys to Kubernetes using manifests stored in `k8s/`

## 🚀 Additional Features Implemented
- ✅ HTTPS support via Let's Encrypt and NGINX
- ✅ Reverse proxy for Flask via NGINX (port 443)
- ✅ Split docker-compose files for Jenkins and Flask/NGINX
- ✅ EC2 infrastructure provisioned with Terraform
- ✅ CI/CD pipeline running inside Dockerized Jenkins
- ✅ Environment variables and `.env` support in Flask app
- ✅ K8s manifests prepared for deployment (Minikube testing in progress)

- 🔜 Run automated tests (e.g., Pytest)
- 🔜 Integrate Prometheus & Grafana for monitoring
- 🔜 Use a lightweight K8s solution 
- 🔜 Store configuration/secrets with AWS SSM or Secrets Manager
