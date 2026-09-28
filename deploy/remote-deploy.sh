#!/usr/bin/env bash
# Runs on the EC2 host, uploaded by the deploy-staging / deploy-production workflows.
# Swaps in the new .env (which pins IMAGE), restarts, smoke-tests, and puts the
# previous .env (and therefore image) back if anything fails.
set -euo pipefail

cd /opt/pri-frontend
[ -f .env.new ] || { echo ".env.new missing" >&2; exit 1; }

env_value() { grep -E "^$1=" .env | tail -n1 | cut -d= -f2-; }

if [ -f .env ]; then cp .env .env.previous; fi
mv .env.new .env

server_name=$(env_value SERVER_NAME)
[ -n "$server_name" ] || { echo "SERVER_NAME missing from the env file" >&2; exit 1; }

rollback() {
  echo "Deploy failed." >&2
  if [ -f .env.previous ]; then
    echo "Restoring $(grep -E '^IMAGE=' .env.previous | tail -n1)" >&2
    cp .env.previous .env
    docker compose up -d --remove-orphans || true
  else
    echo "No previous deploy to restore." >&2
  fi
  exit 1
}

docker compose pull web || rollback
docker compose up -d --remove-orphans || rollback

healthy=0
for _ in $(seq 1 30); do
  if curl -fsS -H "Host: $server_name" http://localhost/healthz >/dev/null; then
    healthy=1
    break
  fi
  sleep 2
done
[ "$healthy" = 1 ] || { docker compose logs --tail=50 web >&2; rollback; }

echo "Healthy: $(env_value IMAGE)"
docker image prune -f >/dev/null
