<?php
/** Same-origin cookie session bootstrap for the app and its GraphQL transport. */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function clog_graphql_session(): void {
	nocache_headers();
	header( 'Cache-Control: private, no-store, max-age=0' );
	header( 'Vary: Cookie', false );
	wp_send_json( [
		'userId' => (string) get_current_user_id(),
		'nonce' => is_user_logged_in() ? wp_create_nonce( 'wp_graphql' ) : null,
		'canWrite' => current_user_can( 'edit_posts' ),
	] );
}
add_action( 'wp_ajax_clog_graphql_session', 'clog_graphql_session' );
add_action( 'wp_ajax_nopriv_clog_graphql_session', 'clog_graphql_session' );

function clog_logout(): void {
	nocache_headers();
	if ( ( $_SERVER['REQUEST_METHOD'] ?? '' ) !== 'POST' ) {
		wp_send_json_error( [ 'message' => 'POST required.' ], 405 );
	}
	check_ajax_referer( 'wp_graphql' );
	wp_logout();
	wp_send_json_success();
}
add_action( 'wp_ajax_clog_logout', 'clog_logout' );
