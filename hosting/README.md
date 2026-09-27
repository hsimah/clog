# Hosting Clog

Deployment is managed externally. Clog requires PHP 8.3 or newer, PDO SQLite,
mbstring, and a web server. This directory provides optional nginx/PHP-FPM
configuration examples; replace example hostnames, paths, users, and service
names to fit your environment. The application receives its public origin,
database path, and session directory through environment variables.
Development and packaging use Composer to install locked framework packages.

## Build and verify elsewhere

```sh
scripts/php.sh composer install --no-interaction --prefer-dist
scripts/php.sh composer build-generators
scripts/php.sh composer check-generated
scripts/node.sh npm ci
scripts/node.sh npm run check
scripts/test-standalone.sh
scripts/test-standalone-browser.sh
scripts/package-standalone.sh
scripts/php.sh php standalone/tests/package.php
```

The artifact is `build/clog-standalone.tar.gz`. It contains compiled frontend
assets, generated entity classes/manifests, the standalone server, locked production
dependencies, and hosting configuration. Packaging installs `--no-dev` dependencies
in an isolated staging directory. No Composer command runs on the deployed host.
The PHP test wrapper currently uses the existing PHP build image; that image is
only a development tool.

## Run locally

After installing PHP dependencies and building the client:

```sh
scripts/standalone-dev.sh install
bash -c 'read -r -s -p "Local password: " CLOG_NEW_PASSWORD; printf "\n"; printf "%s" "$CLOG_NEW_PASSWORD" | scripts/standalone-dev.sh user:add admin editor'
# The command above handles account creation; start the server below.
scripts/standalone-dev.sh serve
```

For fish, the account-creation command can instead be written as:

```fish
read -s -P 'Local password: ' CLOG_NEW_PASSWORD
printf '%s' "$CLOG_NEW_PASSWORD" | scripts/standalone-dev.sh user:add admin editor
set -e CLOG_NEW_PASSWORD
```

Open `http://localhost:8280/`. Overview is the home page; routes and assets are
served from the domain root. Sign in at `/auth/login`. This uses PHP's development server and
stores the database/sessions in ignored `.standalone/`. Stop it with Ctrl+C.
For frontend hot reload, use `CLOG_PROXY_TARGET=http://localhost:8280` with Vite
on the host. Containerized Vite needs an origin it can reach from its network.
Use nginx/FPM for production.

## Example nginx/PHP-FPM installation

Use a supported OS providing PHP **8.3 or newer**, PHP-FPM, PDO SQLite, mbstring,
and OPcache. Package and service names depend on the OS/PHP version. The paths in
these templates assume Debian-style `www-data`, `/etc/nginx`, and `/run/php`.
nginx must have permission to connect to the FPM socket.

1. Extract the artifact into `/opt/clog`. Keep application source owned by the
   deployment account and read-only to the FPM user.
2. Create private writable data directories:

   ```sh
   sudo install -d -o www-data -g www-data -m 0700 /var/lib/clog /var/lib/clog/sessions
   ```

3. Install the database and create an account. The password is read from stdin,
   so it does not appear in command arguments:

   ```sh
   sudo -u www-data env CLOG_DB=/var/lib/clog/clog.sqlite \
     php /opt/clog/server/standalone/cli.php install
   read -rsp 'New password: ' CLOG_NEW_PASSWORD; echo
   printf '%s' "$CLOG_NEW_PASSWORD" | sudo -u www-data env CLOG_DB=/var/lib/clog/clog.sqlite \
     php /opt/clog/server/standalone/cli.php user:add admin editor
   unset CLOG_NEW_PASSWORD
   ```

   Use `reader` instead of `editor` for a read-only account. Passwords must be
   12–72 bytes. There is no public registration or email dependency.
4. Copy `clog-fpm.conf` into the installed PHP-FPM `pool.d` directory. Set
   `CLOG_ORIGIN` to the actual public HTTPS origin. Disable the distribution's
   default pool if nothing else uses it; otherwise include its workers in the
   host memory budget. Install `clog-php.ini` in FPM's `conf.d` directory.
5. Install `clog-fastcgi.conf` as `/etc/nginx/snippets/clog-fastcgi.conf` and adapt
   `clog-nginx.conf` for your hostname and existing TLS certificates. It belongs
   in nginx's `http` context. If nginx already owns this hostname, merge the
   locations into that server instead of adding a duplicate server.
6. Validate nginx and PHP-FPM configuration with `nginx -t` and the installed
   FPM binary's `-t` option, then reload their services. Open `/auth/login`.

All requests reach a fixed front controller; arbitrary `.php` paths are never
executed. Only `/assets/` is served from disk. The database, vendor source and
session files are outside the web document root. Login has an nginx rate limit;
GraphQL requires a session, CSRF header, JSON POST, and bounded query depth/cost.
Sessions expire after eight hours. Clean old session files with the OS's scheduled
session cleanup, configured for `/var/lib/clog/sessions` (see tmpfiles template).

## Database and backups

SQLite uses WAL, full synchronous durability, a three-second busy timeout, a 2 MiB
connection page cache, and foreign keys. Transactions acquire the writer lock
before writes; nested transactions use savepoints. Keep the database on a local
filesystem. Do not put it on an SMB/NFS share.

Create a consistent live backup with the CLI (destination must not already exist):

```sh
sudo -u www-data env CLOG_DB=/var/lib/clog/clog.sqlite \
  php /opt/clog/server/standalone/cli.php backup /var/lib/clog/backup-2026-09-26.sqlite
```

Copy backups to separate storage. The backup includes user password hashes. To restore,
stop the Clog FPM pool, move the current database **and its `-wal`/`-shm` sidecars**
into a recovery directory, install the backup as `clog.sqlite` owned by `www-data`,
clear session files to sign everyone out, and restart FPM. Rehearse restoration
before relying on backups. Never replace a database beneath running workers.

The installer creates fresh entity tables from the generated SQLite installer.
It also upgrades version 1 prototype databases to version 2 without replacing
records or accounts; back up first and rerun `install` before serving requests.
A current version is a no-op. Unknown schemas are refused. Importing data from
other systems requires a separate, reviewed migration.

## Updates and operation

Build releases off-device. Stop the Clog pool, back up the database, replace the
application artifact, run the explicit installer/migration command for that
release, and restart FPM so OPcache sees the new code. Keep the previous artifact
with the database backup. Deployment automation belongs to the operator.

`/healthz` checks that the database can open and has the expected schema version.
Errors go to PHP-FPM logs; avoid logging request bodies or session tokens.

Start with two on-demand workers and a 64 MiB PHP request allocation limit. The
32 MiB OPcache is shared across workers. These are tuning defaults, not measured
host memory figures or a process RSS cap. Measure idle and concurrent search/write
load on the target host, including other FPM pools, OS services, and file cache.
Measure performance on the target host before choosing worker counts.

## Development

The [dependency guide](../server/docs/dependencies.md) records the published packages,
generator targets and runtime compatibility. The handwritten manifests
and checked-in prototype libraries have been removed. The standalone CI/release
workflow installs the lock, verifies generation and the API schema, tests SQLite,
HTTP and browser behavior, and checks the exact production archive.

SQLite uniqueness and ordering use Clog's Unicode lowercase collation through
application indexes and explicit query ordering. LIKE uses SQLite's built-in ASCII
case-insensitive matching. Accent folding is not provided. The supported database
upgrade handles the standalone prototype's SQLite database.
