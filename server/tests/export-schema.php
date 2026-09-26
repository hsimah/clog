<?php

if (!current_user_can('manage_options')) {
    WP_CLI::error('Schema export requires an administrator.');
}
\Clog\Runtime\Clog::instance()->tables()->requireReady();
$schema = \GraphQL\Utils\SchemaPrinter::doPrint(\WPGraphQL::get_schema());
echo rtrim((string) preg_replace('/[ \t]+$/m', '', $schema)) . "\n";
