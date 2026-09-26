#!/bin/sh
set -eu

wp() { php -d memory_limit=512M /usr/local/bin/wp "$@"; }

wp core download --version=7.1.2 --force
wp config create --dbname=clog_test --dbuser=root --dbpass=clog-test --dbhost=db --skip-check
wp config set GRAPHQL_DEBUG true --raw
wp core install --url=http://clog.test --title=Clog --admin_user=clog-test --admin_password=clog-test-password --admin_email=clog@example.test --skip-email
if [ "${CLOG_BROWSER_TESTS:-0}" = 1 ]; then
    wp option update home http://wordpress:8080
    wp option update siteurl http://wordpress:8080
fi
wp plugin install wp-graphql --version=2.23.1 --activate
wp plugin activate clog
wp clog seed --user=clog-test
if [ "${CLOG_BROWSER_TESTS:-0}" = 1 ]; then
    wp rewrite structure '/%postname%/'
    exec php -d memory_limit=512M /usr/local/bin/wp server --host=0.0.0.0 --port=8080
fi
wp eval-file wp-content/plugins/clog/tests/integration/runtime.php --user=clog-test
wp eval-file wp-content/plugins/clog/tests/integration/queries.php --user=clog-test
wp eval-file wp-content/plugins/clog/tests/integration/migration.php --user=clog-test
wp clog migration status --user=clog-test
wp clog migration plan --user=clog-test
if [ "${CLOG_EXPORT_SCHEMA:-0}" = 1 ]; then
    wp eval-file wp-content/plugins/clog/tests/export-schema.php --user=clog-test > /exports/schema.graphql
fi
