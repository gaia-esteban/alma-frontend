# Server Hardening & Deployment Plan

Action plan for the Ubuntu production host that runs `alma-frontend`. Each
item is tagged with priority and a one-line *why this matters*. Ordered by
priority, not by implementation order. The companion incident response
runbook is at the bottom of this document.

**Context:** This plan is the server-side counterpart to the codebase
hardening already shipped (CI build pipeline, Dependabot, audit gate,
standalone bundle, Next.js 15.5.15). Codebase changes alone don't close
the doors that let the prior breach escalate from RCE to a fileless C2
implant — that requires host-level controls.

**Operating assumption:** the next vulnerability in our dependency tree
will be discovered after we ship a build using it. Defenses must contain
a successful RCE, not just prevent one.

---

## P0 — do these first (this week)

### 1. Default-deny outbound network policy

**Why:** The breach implant called home to `209.14.84.37:1220`. With a
default-deny outbound posture, that callback is dropped at the host before
any data leaves. Single highest-leverage control.

**Action:**

```bash
# Replace with your actual API host & version manager mirrors
sudo ufw default deny outgoing
sudo ufw default deny incoming
sudo ufw allow in 22/tcp                                  # SSH (restrict by source IP if possible)
sudo ufw allow in 443/tcp                                 # public HTTPS via reverse proxy
sudo ufw allow out 53                                     # DNS
sudo ufw allow out 123/udp                                # NTP
sudo ufw allow out to <api-host-ip> port 8080 proto tcp   # backend API
sudo ufw allow out 443/tcp                                # OS package mirrors, certbot — tighten later
sudo ufw enable
```

Tighten `443` to specific destinations (Ubuntu archive mirror, Let's Encrypt
ACME) after baseline traffic is observed for ~1 week.

The Node app needs **zero** outbound access for normal operation — all calls
go through the reverse proxy to the backend. The only outbound traffic from
the app box should be: DNS, NTP, OS updates, and the API host.

### 2. Build artifacts in CI, deploy artifacts to prod (no toolchain on host)

**Why:** The implant ran `wget` and executed a binary. With no `wget`,
`curl`, `npm`, `git`, or compilers installed, that flow breaks. CI already
produces a hashed standalone bundle — prod just unpacks and runs it.

**Action:**

- Remove from prod: `npm`, `nodejs-source`, `git`, `gcc`, `make`, `wget` (use
  `apt purge`). Keep only: `node` (v22), `systemd`, the reverse proxy.
- Deploy via `scp` of the CI artifact + sha256 verification before unpack:

```bash
# pull from CI/artifact storage to a deploy host with restricted creds
sha256sum -c alma-frontend-<sha>.tar.gz.sha256 || exit 1
sudo systemctl stop alma-frontend
sudo rm -rf /opt/alma-frontend.new
sudo mkdir /opt/alma-frontend.new
sudo tar -xzf alma-frontend-<sha>.tar.gz -C /opt/alma-frontend.new
sudo chown -R nextapp:nextapp /opt/alma-frontend.new
sudo mv /opt/alma-frontend /opt/alma-frontend.old
sudo mv /opt/alma-frontend.new /opt/alma-frontend
sudo systemctl start alma-frontend
# rollback = mv /opt/alma-frontend.old /opt/alma-frontend && systemctl restart
```

### 3. Run Node as a dedicated unprivileged user (not root)

**Why:** Prior breach evidence showed a fake `systemd-logind` masquerading
in `/var/tmp` and using 60% RAM — the implant had enough privilege to
allocate that. A non-root user with no shell can't do most of what the
attacker did.

**Action:**

```bash
sudo useradd --system --no-create-home \
  --shell /usr/sbin/nologin --home-dir /nonexistent nextapp
sudo chown -R nextapp:nextapp /opt/alma-frontend
```

The user has: no login shell, no home dir, no sudo, no group membership
beyond its own. Even with RCE in the Node process, lateral escalation is
materially harder.

### 4. systemd unit with hardening directives

**Why:** Defense in depth on top of the unprivileged user. `PrivateTmp=true`
alone would have prevented the fake `systemd-logind` from being placed at
`/var/tmp/systemd-logind` visible to other processes.

**Action:** Drop the following at `/etc/systemd/system/alma-frontend.service`:

```ini
[Unit]
Description=AlMa Frontend (Next.js standalone)
After=network.target

[Service]
Type=simple
User=nextapp
Group=nextapp
WorkingDirectory=/opt/alma-frontend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=-/etc/alma-frontend.env  # see item 6 — better: LoadCredential

# --- hardening ---
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=strict
ProtectHome=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectKernelLogs=true
ProtectControlGroups=true
ProtectClock=true
ProtectHostname=true
ProtectProc=invisible
RestrictNamespaces=true
RestrictRealtime=true
RestrictSUIDSGID=true
LockPersonality=true
MemoryDenyWriteExecute=true
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources @mount @debug @cpu-emulation @obsolete @raw-io @reboot @swap
CapabilityBoundingSet=
AmbientCapabilities=
ReadWritePaths=/opt/alma-frontend/.next/cache
UMask=0077

[Install]
WantedBy=multi-user.target
```

Verify after enabling:

```bash
sudo systemd-analyze security alma-frontend
# target: exposure level OK or better (< 3.0)
```

### 5. Secrets out of `.env.local` on disk → systemd `LoadCredential`

**Why:** A compromised Node process can `cat .env.local` trivially. Move
non-public secrets out of the on-disk file. (Public `NEXT_PUBLIC_*` values
are baked into the JS bundle and aren't sensitive — keep those in env.)

**Action:** For each backend secret (e.g. an API token used server-side):

```bash
# store encrypted
sudo systemd-creds encrypt --name=alma-api-token \
  /etc/credstore.encrypted/alma-api-token.cred -

# add to systemd unit
LoadCredential=alma-api-token:/etc/credstore.encrypted/alma-api-token.cred
```

In Node, read with `fs.readFileSync(process.env.CREDENTIALS_DIRECTORY +
'/alma-api-token', 'utf8').trim()`. Credential is only readable by the
service uid, lives in tmpfs, never touches the filesystem in plaintext.

Audit current usage:
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEBHOOK_URL`, `NEXT_PUBLIC_APP_NAME`,
  `NEXT_PUBLIC_APP_VERSION` — all intentionally public, fine in env.
- Anything else (none today, but be vigilant going forward) → credentials.

---

## P1 — within 2-3 weeks

### 6. Read-only root + writable carve-outs

**Why:** Stops the wget-and-execute pattern wholesale. Combined with
`ProtectSystem=strict` in the unit, the only writable path is the explicit
`ReadWritePaths` (the Next.js cache). Adversary can't drop a binary in the
app dir.

**Action:** Already covered by the systemd unit above (`ProtectSystem=strict`
+ `ReadWritePaths=/opt/alma-frontend/.next/cache`). Verify post-deploy:

```bash
sudo -u nextapp touch /opt/alma-frontend/foo  # must fail
```

### 7. Reverse proxy in front of Node (Caddy or nginx)

**Why:** Node binds only to `127.0.0.1`, so it can't be reached directly
from the internet. The proxy terminates TLS, applies rate limits, adds
security headers, and absorbs malformed requests before they hit Node's
HTTP parser (relevant to the request smuggling / deserialization CVEs we
just patched).

**Action:** Caddyfile at `/etc/caddy/Caddyfile`:

```
auto.digital.almafconsultora.com {
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }
    rate_limit {
        zone per_ip {
            key {remote_host}
            events 100
            window 1m
        }
    }
    reverse_proxy 127.0.0.1:3000
}
```

### 8. unattended-upgrades for OS security patches

**Why:** Closes the gap between Ubuntu USN and a human running `apt update`.
The next CVE will probably be in OpenSSL or the kernel, not Next.js.

**Action:**

```bash
sudo apt install unattended-upgrades apt-listchanges
sudo dpkg-reconfigure -plow unattended-upgrades
# verify /etc/apt/apt.conf.d/50unattended-upgrades enables -security
```

### 9. auditd rules for the breach pattern we observed

**Why:** Detect the next attempt during execution, not after C2 is
established. Rules are derived from the indicators captured during the
incident.

**Action:** `/etc/audit/rules.d/alma.rules`:

```
# alert on exec from world-writable / temp dirs
-a always,exit -F arch=b64 -S execve -F dir=/tmp -k exec_from_tmp
-a always,exit -F arch=b64 -S execve -F dir=/var/tmp -k exec_from_tmp
-a always,exit -F arch=b64 -S execve -F dir=/dev/shm -k exec_from_tmp

# alert on download tools (should not exist on prod, but defense in depth)
-w /usr/bin/wget -p x -k download_tool
-w /usr/bin/curl -p x -k download_tool

# track changes to systemd unit dir
-w /etc/systemd/system/ -p wa -k systemd_change
-w /usr/lib/systemd/system/ -p wa -k systemd_change

# track persistence locations
-w /etc/cron.d/ -p wa -k persistence
-w /etc/cron.daily/ -p wa -k persistence
-w /var/spool/cron/ -p wa -k persistence
-w /etc/ld.so.preload -p wa -k persistence
-w /root/.ssh/ -p wa -k persistence

# any new user / group creation
-w /etc/passwd -p wa -k user_change
-w /etc/shadow -p wa -k user_change
-w /etc/sudoers -p wa -k user_change
-w /etc/sudoers.d/ -p wa -k user_change
```

Forward `auditd` logs to the central log destination (item 12). Page on
any `exec_from_tmp` or `download_tool` event.

### 10. Immutable infrastructure — rebuild, never patch

**Why:** You spent days during the recent incident validating eradication
on a contaminated host. With immutable infra, recovery is "redeploy from
the known-good image" — minutes, not days.

**Action:** Codify host setup in Packer + cloud-init (or Ansible if you
prefer config-management). The host build should produce an image that
already includes:
- The hardened systemd unit
- The non-root user
- The egress firewall rules
- `unattended-upgrades` enabled
- `auditd` rules deployed
- The reverse proxy

App deploys swap a tarball. Host changes swap an entire image.

---

## P2 — within 1-2 months

### 11. File integrity monitoring (AIDE)

**Why:** Catches modifications to system binaries, systemd units, and
authorized_keys files between scheduled scans. Daily diffs go to the
central log destination.

**Action:**

```bash
sudo apt install aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
# nightly cron: aide --check; mail diff to ops; rotate baseline weekly
```

Watch paths: `/usr/bin`, `/usr/sbin`, `/usr/lib/systemd`, `/etc/systemd`,
`/etc/cron.*`, `/root/.ssh`, `/home/*/.ssh`, `/opt/alma-frontend` (excl.
`.next/cache`).

### 12. Centralized log shipping

**Why:** If a host is compromised, local logs are the first thing tampered
with. Real-time shipping means you have evidence even after a wipe.

**Action:** `vector` or `journald` → external sink (Loki, Datadog, ELK,
CloudWatch — whichever your team already operates). Ship at minimum:
- `journalctl -u alma-frontend`
- `auditd` logs
- Reverse proxy access + error logs
- `auth.log`, `syslog`

Set up alerts on:
- Process exec from `/tmp`/`/var/tmp`/`/dev/shm`
- Outbound connection denied by firewall (potential C2 attempt)
- AIDE integrity check failure
- New SSH key in any `authorized_keys`
- New cron entry
- Sustained CPU > 80% on the app process (cryptominer signal)

### 13. Containerize (optional, evaluate)

**Why:** Defense in depth — adds a kernel-level isolation layer on top of
systemd hardening. **But** it is non-trivial added operational complexity
and only buys meaningful additional protection if the systemd unit is
*not* already hardened. With items 3–4 in place, this is a P2 / nice-to-have,
not a must.

If you go this route: distroless or `node:22-slim` base, run as non-root
in the container, `--read-only`, `--cap-drop=ALL`, no shell in the image.
Decide first whether the team wants to operate Podman/Docker in prod.

---

## P3 — ongoing posture

### 14. Subscribe to advisories

- **GitHub watch** `vercel/next.js` security advisories.
- **Next.js blog RSS** for security posts.
- **Ubuntu USN** mailing list for the LTS in use.
- **NVD / GHSA feeds** filtered for `next`, `react`, `node`.

A real (not shared) inbox or a #security Slack channel that someone reads
daily. Not a list nobody monitors.

### 15. Quarterly hardening review

Run `systemd-analyze security alma-frontend` and `lynis audit system`
quarterly. Track score over time. Address regressions.

---

# Incident Response Runbook

Captured from the actual response we just executed. Keep this current as
the environment evolves.

## 0. Triggers (when to invoke this)

- Anomalous process detected (high CPU/RAM, masquerading name, deleted
  binary).
- Outbound connection to a destination not on the egress allowlist.
- AIDE / FIM alert on a sensitive path.
- Unexpected new user, SSH key, cron entry.
- Customer or third party reports a credential leak / data exposure.

## 1. Contain — DO NOT REBOOT

Volatile evidence (memory-resident binaries, network state, deleted
file contents in `/proc/<pid>/exe`) is destroyed on reboot.

```bash
# 1. Block egress to the C2 destination first (silent, non-alerting)
sudo iptables -A OUTPUT -d <c2-ip> -j DROP

# 2. Network-isolate the host except management/forensics path
#    (cloud SG: detach from app SG, attach forensics-only SG)
```

## 2. Capture volatile evidence (before killing anything)

```bash
mkdir /tmp/forensics-$(date +%s) && cd $_

# Process tree + open files + network sockets
ps auxef                     > processes.txt
ss -tnpu                     > sockets.txt
netstat -panW                > netstat.txt 2>/dev/null
lsof -nP                     > lsof.txt 2>/dev/null

# For each suspect PID:
for pid in <PIDs>; do
  cp /proc/$pid/exe ./bin-$pid 2>/dev/null    # recovers deleted/unlinked binaries
  cp /proc/$pid/maps ./maps-$pid
  cp /proc/$pid/environ ./env-$pid
  ls -la /proc/$pid/fd/      > fd-$pid.txt
  cat /proc/$pid/status      > status-$pid.txt
done

# Filesystem oddities
find /tmp /var/tmp /dev/shm -type f -mtime -7 -ls > recent-tmp.txt
find /etc/cron.* -type f -ls                      > crons.txt

# Memory image (optional, large; needs LiME or AVML installed)
# avml memory.img
```

Hash everything (`sha256sum * > HASHES`), then move off-host.

## 3. Eradicate

```bash
# Kill suspects only after artifacts are recovered
sudo kill -9 <PIDs>

# Remove staging files
sudo rm -f /var/tmp/<implant-files>

# Hunt persistence
sudo systemctl list-unit-files --state=enabled
sudo crontab -l ; for u in $(cut -d: -f1 /etc/passwd); do sudo crontab -u $u -l 2>/dev/null; done
ls -la /etc/cron.* /etc/systemd/system/ /var/spool/cron/
cat /etc/ld.so.preload 2>/dev/null
grep -rE 'curl|wget|nc |bash -i' /etc/profile.d/ ~/.bashrc /root/.bashrc 2>/dev/null
ls -la /root/.ssh/ /home/*/.ssh/
sudo grep -E '^[^#]*ALL' /etc/sudoers /etc/sudoers.d/*
diff <(getent passwd) <(known-good-passwd-snapshot)
```

## 4. Rotate everything reachable from the compromised process

- `/etc/alma-frontend.env` and any `LoadCredential=` secrets
- API tokens for the backend at `auto.digital.almafconsultora.com`
- JWT signing keys
- DB credentials
- Force-revoke all active user sessions
- The OTP backend may have been observed → notify users; consider forced
  re-verification
- All SSH keys for service accounts that touched this host

## 5. Investigate scope

- Pull reverse-proxy access logs for the suspected compromise window —
  look for unusual `POST` to RSC endpoints (`Next-Action` header, large
  RSC payloads) or unusual user-agents.
- Pull egress/firewall logs for any other host that contacted the same
  C2 destination → lateral movement check.
- Review backend API logs for unauthorized data access.
- If PII / financial data was reachable, engage DPO; assess notification
  obligations under applicable regulation.

## 6. Rebuild on clean infrastructure

**Do not patch in place.** Assume full host compromise.

- Provision a new host from the immutable image (item 10).
- Restore configuration from version-controlled source.
- Restore secrets from the secret manager (not from the compromised host).
- Deploy the latest CI artifact, verifying its sha256.
- Switch DNS / load balancer to the new host.
- Decommission the compromised host (snapshot for forensics first; then
  destroy, do not reuse).

## 7. Post-incident

- Write up the timeline within 48h while details are fresh.
- Identify what controls failed, what controls would have caught it
  earlier, and add the missing ones to this document.
- File the CVE / exploitation method in an internal tracker so future
  similar reports are recognized faster.
- Notify hosting provider and (where appropriate) the abuse contact for
  the C2 ASN.

---

## Implementation roadmap

| Week | Items |
|---|---|
| 1 | P0: 1 (egress), 3 (user), 4 (systemd unit), 5 (secrets) |
| 2 | P0: 2 (CI deploy flow, remove toolchain from prod) |
| 3 | P1: 7 (reverse proxy), 8 (unattended-upgrades), 9 (auditd) |
| 4 | P1: 10 (immutable infra, Packer baseline) |
| 5–6 | P2: 11 (AIDE), 12 (centralized logs), evaluate 13 (containers) |
| Ongoing | P3: 14 (advisories), 15 (quarterly review) |

When this plan is fully executed, the breach class observed in the prior
incident is contained at multiple layers: the RCE itself is harder
(patches + audit gate); the post-exploitation activity is constrained
(non-root user, no toolchain, read-only FS, locked-down systemd); the
C2 callback is dropped (egress allowlist); and the activity is detected
in real time (auditd, FIM, central logs).
