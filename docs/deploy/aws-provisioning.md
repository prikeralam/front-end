# AWS provisioning

The AWS side of the frontend deploy pipeline (`.github/CONTRIBUTING.md` section 5), in account
`949820257880`, region `ap-south-1`. The backend's stacks (`pri-staging`, `pri-account-budget`) are
described in `website-backend`'s `docs/deploy/aws-provisioning.md`; the `pri-monthly` budget there
covers this stack too. Staging exists; production is not provisioned yet.

| Stack | Template | What it holds |
|---|---|---|
| `pri-frontend-staging` | `deploy/aws/staging.yml` | EC2 host, static IP, security group, deploy key pair, instance role (Session Manager only) |

## Staging

- **Host:** `t3.micro`, Ubuntu 24.04 amd64 (the image is amd64-only), 20 GB gp3, 2 GB swap, standard CPU credits
  (no surplus billing). Runs `deploy/docker-compose.yml`: the Next.js server and nginx. No database or bucket:
  the frontend is stateless, and media comes from the backend's bucket.
- **Hostname:** `<ip-with-dashes>.sslip.io`, currently `13-234-6-255.sslip.io` (static IP `13.234.6.255`).
  A real subdomain later means an A record, a new certbot certificate, and `SERVER_NAME` in `APP_ENV_FILE`.
- **Backend:** `API_URL=https://15-206-144-63.sslip.io` (the backend's staging host).
- **TLS:** certbot on the host, first issued at boot. Renewals use the standalone server: the renewal hooks stop
  the nginx container for a few seconds to free port 80.
- **Access:** SSH as `ubuntu` with the deploy key, open to 0.0.0.0/0 because GitHub-hosted runners have no fixed
  IPs (key-only). Session Manager also works through the instance role if the key is lost.
- **Bootstrap log:** `/var/log/pri-bootstrap.log` on the host.
- **Cost:** the free tier's 750 t3.micro hours a month cover one instance running all month, and the backend's
  staging host already uses them, so this second host is billed (roughly $8/month for the instance, plus the
  public IPv4 address, at ap-south-1 on-demand rates).

### Recreating or updating it

Run in Git Bash with `MSYS_NO_PATHCONV=1`, or the `/aws/...` parameter path gets rewritten.

```bash
aws ssm get-parameter --region ap-south-1 \
  --name /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \
  --query Parameter.Value --output text
aws cloudformation deploy --region ap-south-1 --stack-name pri-frontend-staging \
  --template-file deploy/aws/staging.yml --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides ImageId=<ami> "SshPublicKey=$(cat ~/.ssh/pri-frontend-staging-deploy.pub)"
```

A new stack gets a new IP, and so a new hostname: update `APP_ENV_FILE` and `EC2_HOST`, and re-pin
`EC2_SSH_KNOWN_HOSTS`. Check the scanned key against the `SSH HOST KEY FINGERPRINTS` block in
`aws ec2 get-console-output` before trusting it (on Windows, set `PYTHONUTF8=1` or the CLI fails to print it).

### GitHub `staging` Environment

| Secret | Value |
|---|---|
| `EC2_HOST` | `13.234.6.255` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | private deploy key (kept locally at `~/.ssh/pri-frontend-staging-deploy`) |
| `EC2_SSH_KNOWN_HOSTS` | the verified `ssh-keyscan -t ed25519 13.234.6.255` line (kept at `~/.ssh/pri-frontend-staging.known_hosts`) |
| `APP_ENV_FILE` | `ENVIRONMENT=staging`, `SERVER_NAME=13-234-6-255.sslip.io`, `API_URL=https://15-206-144-63.sslip.io` (kept at `~/.pri-deploy/frontend-staging.env`) |

Repository variable `IMAGE_HOSTS`: `pri-staging-949820257880.s3.amazonaws.com,pri-staging-949820257880.s3.ap-south-1.amazonaws.com,staging.priresearch.in,priresearch.in,www.priresearch.in`
(the backend's staging bucket, in both hostname forms S3 presigns with, where uploaded photos live; and the site's own
hosts, which serve the seeded person photos from `public/people/`, see website-backend #42. Add the production bucket
when it exists).

## Production (not provisioned)

Same template with its own stack name, key and hostname, deployed from `main` through the `production`
Environment.
