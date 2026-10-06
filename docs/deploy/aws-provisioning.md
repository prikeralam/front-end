# AWS provisioning

The frontend has no AWS stack of its own. Each environment is **one EC2 host shared with the backend**, in PRI's
account `305846488655` (region `ap-south-1`), defined by `website-backend`'s `deploy/aws/host.yml` and documented in
that repo's `docs/deploy/aws-provisioning.md` (template, host layout, nginx and certificates, how to recreate it).
Staging exists; production is not provisioned yet.

## What the frontend puts on the host

- `/opt/pri-frontend`, uploaded by the deploy workflows: `deploy/docker-compose.yml` (the Next.js server on
  `127.0.0.1:3000`), the two nginx templates, `remote-deploy.sh` and the `.env`.
- An nginx site, installed by `remote-deploy.sh` through the host's `pri-nginx-site` script:
  `deploy/nginx.conf.template` (HTTPS) once the host has a certificate for `SERVER_NAME`, otherwise
  `deploy/nginx.http.conf.template` (plain HTTP). The script asks Let's Encrypt for the certificate as soon as the name
  resolves to the host.

## GitHub `staging` Environment

| Secret | Value |
|---|---|
| `EC2_HOST` | `15.252.128.131` (the shared staging host) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | the shared deploy key, kept locally at `~/.ssh/pri-staging-host-deploy` |
| `EC2_SSH_KNOWN_HOSTS` | the verified host key line, kept at `~/.ssh/pri-staging-host.known_hosts` |
| `APP_ENV_FILE` | `ENVIRONMENT=staging`, `SERVER_NAME=staging.priresearch.in`, `API_URL=https://api-staging.priresearch.in` (kept at `~/.pri-deploy/frontend-staging.env`) |

Repository variable `IMAGE_HOSTS`: `pri-staging-305846488655.s3.amazonaws.com,pri-staging-305846488655.s3.ap-south-1.amazonaws.com,staging.priresearch.in,priresearch.in,www.priresearch.in`
(the staging bucket, in both hostname forms S3 presigns with, where uploaded photos live; and the site's own hosts,
which serve the seeded person photos from `public/people/`). It is baked into the image at build time, and one image
is promoted from staging to production, so add the production bucket when it exists.

## Production (not provisioned)

The same shared-host template with `Environment=production`, deployed from `main` through the `production`
Environment, for `priresearch.in` and `www.priresearch.in`.
