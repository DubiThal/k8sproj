#!/bin/bash

NAMESPACE="monitoring"
VAULT_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=vault -o jsonpath="{.items[0].metadata.name}")

echo "[*] Initializing Vault..."
kubectl exec -n $NAMESPACE $VAULT_POD -- vault operator init -key-shares=3 -key-threshold=2 -format=json > vault-init.json

echo "[*] Unsealing Vault..."
UNSEAL_KEYS=$(jq -r '.unseal_keys_b64[]' vault-init.json | head -n 2)

for key in $UNSEAL_KEYS; do
  kubectl exec -n $NAMESPACE $VAULT_POD -- vault operator unseal $key
done

ROOT_TOKEN=$(jq -r .root_token vault-init.json)
echo "[*] Vault initialized and unsealed."
echo "[*] Root Token: $ROOT_TOKEN"

echo "[*] Logging in to Vault..."
kubectl exec -n $NAMESPACE $VAULT_POD -- vault login $ROOT_TOKEN

