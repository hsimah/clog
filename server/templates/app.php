<?php
/**
 * Minimal HTML shell for the Clog React app.
 * Bypasses wp_head()/wp_footer() to avoid theme interference.
 */

$assets    = clog_get_vite_assets();
$dist_url  = plugins_url( 'dist/', dirname( __FILE__ ) );
$asset_url = plugins_url( 'assets/', dirname( __FILE__ ) );
nocache_headers();
header( 'Cache-Control: private, no-store, max-age=0' );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clog</title>
    <link rel="icon" type="image/png" href="<?php echo esc_url( $asset_url . 'clog-white.png' ); ?>" media="(prefers-color-scheme: dark)" />
    <link rel="icon" type="image/png" href="<?php echo esc_url( $asset_url . 'clog.png' ); ?>" media="(prefers-color-scheme: light)" />
    <?php foreach ( $assets['css'] as $css_file ) : ?>
    <link rel="stylesheet" href="<?php echo esc_url( $dist_url . $css_file ); ?>" />
    <?php endforeach; ?>
</head>
<body>
    <div id="root"></div>
    <script id="clog-config" type="application/json"><?php echo wp_json_encode( [
        'ajaxUrl' => admin_url( 'admin-ajax.php', 'relative' ),
        'graphqlUrl' => wp_make_link_relative( graphql_get_endpoint_url() ),
        'loginUrl' => wp_login_url( home_url( '/clog' ) ),
    ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); ?></script>
    <?php if ( $assets['js'] ) : ?>
    <script type="module" src="<?php echo esc_url( $dist_url . $assets['js'] ); ?>"></script>
    <?php endif; ?>
</body>
</html>
