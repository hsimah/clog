#!/bin/sh
set -eu

wp() { php -d memory_limit=512M /usr/local/bin/wp "$@"; }

wp core download --version=7.1.2 --force
wp config create --dbname=clog_test --dbuser=root --dbpass=clog-test --dbhost=db --skip-check
wp config set GRAPHQL_JWT_AUTH_SECRET_KEY clog-isolated-integration-tests
wp core install --url=http://clog.test --title=Clog --admin_user=clog-test --admin_password=clog-test-password --admin_email=clog@example.test --skip-email
wp plugin install wp-graphql --activate
wp plugin install https://github.com/wp-graphql/wp-graphql-jwt-authentication/archive/refs/tags/v0.7.0.zip --activate
wp plugin activate clog
wp clog seed --user=clog-test
if [ "${CLOG_BROWSER_TESTS:-0}" = 1 ]; then
    wp rewrite structure '/%postname%/'
    exec php -d memory_limit=512M /usr/local/bin/wp server --host=0.0.0.0 --port=8080
fi
wp eval-file wp-content/plugins/clog/tests/integration/runtime.php --user=clog-test
