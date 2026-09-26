#!/bin/sh
# Exercise the exact production ZIP in an empty, disposable WordPress installation.
set -eu
wp() { php -d memory_limit=512M /usr/local/bin/wp "$@"; }
wp core download --version=7.1.2 --force
wp config create --dbname=clog_test --dbuser=root --dbpass=clog-test --dbhost=db --skip-check
wp config set GRAPHQL_DEBUG true --raw
wp core install --url=http://clog.test --title=Clog --admin_user=clog-test --admin_password=clog-test-password --admin_email=clog@example.test --skip-email
wp plugin install wp-graphql --version=2.23.1 --activate
wp plugin install /artifacts/clog.zip --activate
wp clog seed --user=clog-test
wp eval-file /runner/integration/release.php --user=clog-test
wp eval-file /runner/integration/runtime.php --user=clog-test
wp eval-file /runner/integration/queries.php --user=clog-test
wp eval-file /runner/integration/migration.php --user=clog-test
# Simulate WordPress replacing plugin files after a guarded migration. The data
# left by the migration fixture must survive an install/update of the ZIP.
wp eval-file /runner/integration/release-snapshot.php --user=clog-test > /tmp/clog-before.json
wp plugin install /artifacts/clog.zip --force --activate
wp eval-file /runner/integration/release-snapshot.php --user=clog-test > /tmp/clog-after.json
cmp /tmp/clog-before.json /tmp/clog-after.json
wp eval-file /runner/integration/release.php --user=clog-test
printf '%s\n' 'PASS production ZIP fresh install, legacy fixture upgrade/restore and plugin replacement'
# Exercise authentication and deep-route HTML from the installed ZIP over HTTP.
wp option update home http://127.0.0.1:8080
wp option update siteurl http://127.0.0.1:8080
wp rewrite structure '/%postname%/'
wp server --host=0.0.0.0 --port=8080 > /tmp/clog-release-http.log 2>&1 &
SERVER_PID=$!
trap 'result=$?; if [ "$result" -ne 0 ]; then cat /tmp/clog-release-http.log; fi; kill "$SERVER_PID" 2>/dev/null || true' EXIT
for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl -fsS http://127.0.0.1:8080/wp-login.php > /dev/null 2>&1; then break; fi
    sleep 1
done
STATUS=$(curl -sS -o /tmp/clog-anonymous.html -w '%{http_code}' http://127.0.0.1:8080/clog/inventory/307/)
printf 'Anonymous deep-route status: %s\n' "$STATUS"
[ "$STATUS" = 302 ]
curl -fsS -c /tmp/clog-release-cookies http://127.0.0.1:8080/wp-login.php > /dev/null
curl -sS -b /tmp/clog-release-cookies -c /tmp/clog-release-cookies --data-urlencode log=clog-test --data-urlencode pwd=clog-test-password --data testcookie=1 http://127.0.0.1:8080/wp-login.php > /dev/null
curl -fsS -b /tmp/clog-release-cookies http://127.0.0.1:8080/clog/inventory/307/ > /tmp/clog-release.html
wp eval-file /runner/integration/release-http.php --user=clog-test > /tmp/clog-release-assets
while IFS= read -r asset; do
    curl -fsS "$asset" > /dev/null
done < /tmp/clog-release-assets
printf '%s\n' 'PASS production ZIP cookie authentication, deep-route HTML and compiled asset delivery'
