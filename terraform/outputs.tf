output "grafana_admin_password" {
  value = "admin123"
}

output "grafana_url" {
  value = "kubectl port-forward svc/grafana 3000:80 -n monitoring"
}

output "vault_ui" {
  value = "kubectl port-forward svc/vault 8200:8200 -n monitoring"
}

