#!/usr/bin/env python3
"""CI helper: validate Keycloak realm JSON structure."""
import json
import sys

path = "infra/compose/sso-dev/realm/factory-platform-realm.json"
try:
    with open(path) as f:
        d = json.load(f)
except Exception as e:
    print(f"FAIL: cannot parse {path}: {e}")
    sys.exit(1)

clients = [c.get("clientId") for c in d.get("clients", [])]
users = d.get("users", [])
roles = d.get("roles", {}).get("realm", [])
print(f"OK realm {d.get('realm','?')}:")
print(f"  clients: {len(clients)} ({', '.join(clients[:5])}...)")
print(f"  users:   {len(users)}")
print(f"  roles:   {len(roles)}")