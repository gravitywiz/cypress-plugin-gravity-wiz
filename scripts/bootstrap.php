<?php
/**
 * Gravity Wiz Acceptance Test Bootstrap template.
 *
 * Be sure to call do_action( 'gwiz_acceptance_test_bootstrap' ); in the _bootstrap.php file that is requiring this file.
 */
require_once( ABSPATH . 'wp-includes/wp-db.php' );
require_once( ABSPATH . 'wp-admin/includes/taxonomy.php' );

if ( ! function_exists( '_delete_all_posts' ) ) {
	function _delete_all_posts() {
		global $wpdb;

		$all_posts = $wpdb->get_results( "SELECT ID, post_type from {$wpdb->posts}", ARRAY_A );
		if ( ! $all_posts ) {
			return;
		}

		foreach ( $all_posts as $data ) {
			if ( 'attachment' === $data['post_type'] ) {
				wp_delete_attachment( $data['ID'], true );
			} else {
				wp_delete_post( $data['ID'], true );
			}
		}
	}
}

add_action( 'gwiz_acceptance_test_bootstrap', 'bootstrap_flush_rewrite_rules' );
function bootstrap_flush_rewrite_rules() {
	global $wp_rewrite;

	$wp_rewrite->set_permalink_structure( '/%postname%/' );
	$wp_rewrite->flush_rules();
}

add_action( 'gwiz_acceptance_test_bootstrap', 'add_form_ajax_mu_plugin' );
function add_form_ajax_mu_plugin() {
	$plugin_path = WPMU_PLUGIN_DIR . '/gwiz-test-helper.php';

	wp_mkdir_p( WPMU_PLUGIN_DIR );
	$plugin_file_handle = fopen( $plugin_path, 'w' ) or die( 'Unable to open file for writing.' );

	print 'Adding AJAX Query Param MU Plugin.';

	$contents = <<<'FILE'
<?php
/**
 * Plugin Name: Gravity Wiz - Cypress Test Helpers
 * Description: This plugin is automatically added whenever Gravity Wiz acceptance tests are ran to add behavior that is needed.
 */
add_filter( 'gform_form_args', 'enable_form_ajax' );
function enable_form_ajax( $args ) {
	if ( isset( $_GET['gform-ajax'] ) && $_GET['gform-ajax'] ) {
		$args['ajax'] = true;
	}

	return $args;
}

/**
 * Add legacy filter to enable legacy markup for acceptance tests
 */
add_filter( 'gform_enable_legacy_markup', 'gwiz_legacy_check' );
function gwiz_legacy_check( $value ) {
	if ( rgget( 'enable_legacy' ) ) {
		return boolval( rgget( 'enable_legacy' ) );
	}

	return $value;
}

/**
 * Output what wp_mail() is sending to a flat file rather than actually emailing it so assertions can be made on what
 * is email adn when.
 */
if ( get_option( 'gwiz_cypress_mail_output_path' ) ) {
	function wp_mail( $to, $subject, $message, $headers = '', $attachments = array() ) {
		$path     = get_option( 'gwiz_cypress_mail_output_path' );
		$filename = sanitize_file_name( uniqid( '', true ) . '-' . $subject ) . '.json';

		try {
			$email = @fopen( $path . '/' . $filename, "w" );

			if ( ! $email ) {
				throw new Exception( 'Unable to open file for writing.' );
			}

			fwrite( $email, json_encode( func_get_args() ) );
			fclose( $email );

			return true;
		} catch ( Exception $e ) {
			return false;
		}
	}
}
FILE;

	fwrite( $plugin_file_handle, $contents );
	fclose( $plugin_file_handle );
}

add_action( 'gwiz_acceptance_test_bootstrap', 'bootstrap_update_admin_password' );
function bootstrap_update_admin_password() {
	/* Update admin password */
	wp_set_password( 'admin', 1 );
}

function dismiss_gwiz_welcome_pointer( $user_id ) {
	/* Dismiss Gravity Wiz Pointer */
	$dismissed_pointers = get_user_meta( $user_id, 'dismissed_wp_pointers' );

	if ( is_string( $dismissed_pointers ) ) {
		$dismissed_pointers = explode( ',', $dismissed_pointers );
	}

	$dismissed_pointers[] = 'gwp_welcome';

	update_user_meta( $user_id, 'dismissed_wp_pointers', implode( ',', $dismissed_pointers ) );
}

function add_test_user( $username, $role = 'subscriber' ) {
	$userData = array(
		'user_login' => $username,
		'first_name' => $username,
		'last_name'  => $username,
		'user_pass'  => $username,
		'user_email' => $username . '@mail.com',
		'user_url'   => '',
		'role'       => $role,
	);

	$user = wp_insert_user( $userData );

	if ( is_wp_error( $user ) ) {
		throw new Exception( $user->get_error_message() );
	}

	dismiss_gwiz_welcome_pointer( $user );
}

add_action( 'gwiz_acceptance_test_bootstrap', 'bootstrap_setup_users' );
function bootstrap_setup_users() {
	global $wpdb;

	$wpdb->query( "TRUNCATE TABLE {$wpdb->users};" );
	$wpdb->query( "TRUNCATE TABLE {$wpdb->usermeta};" );

	/* Users are cached, flush after truncating table */
	wp_cache_flush();

	$admins = array( 'admin', 'admin1', 'admin2', 'admin3', 'admin4', 'admin5' );

	foreach ( $admins as $admin ) {
		add_test_user( $admin, 'administrator' );
	}

	$subscribers = array( 'subscriber', 'subscriber2' );

	foreach ( $subscribers as $subscriber ) {
		add_test_user( $subscriber );
	}
}

add_action( 'gwiz_acceptance_test_bootstrap', 'bootstrap_add_terms' );
function bootstrap_add_terms() {
	global $wpdb;

	$wpdb->query( "TRUNCATE TABLE {$wpdb->terms};" );
	$wpdb->query( "TRUNCATE TABLE {$wpdb->termmeta};" );
	$wpdb->query( "TRUNCATE TABLE {$wpdb->term_relationships};" );
	$wpdb->query( "TRUNCATE TABLE {$wpdb->term_taxonomy};" );

	wp_create_category( 'Uncategorized' );
	wp_create_category( 'Another Category' );

	$and_another_cat = wp_create_category( 'And Another Category' );
	$some_other_cat  = wp_create_category( 'Some Other Category' );
	$some_crazy_cat  = wp_create_category( 'Some Crazy Category' );

	add_term_meta( $and_another_cat, 'test_1', 'ABC' );
	add_term_meta( $some_other_cat, 'test_2', '123' );

	add_term_meta( $some_crazy_cat, 'test_1', 'ABC' );
	add_term_meta( $some_crazy_cat, 'test_2', '123' );
}

add_action( 'gwiz_acceptance_test_bootstrap', 'bootstrap_reset_posts' );
function bootstrap_reset_posts() {
	global $wpdb;

	_delete_all_posts();
	$wpdb->query( "TRUNCATE TABLE {$wpdb->posts};" );

	wp_insert_post( array(
		'post_type'    => 'post',
		'post_content' => '',
		'post_name'    => sanitize_title_with_dashes( 'Hello world!' ),
		'post_parent'  => 0,
		'post_author'  => 1,
		'post_status'  => 'publish',
		'post_title'   => 'Hello world!',
	) );
}

add_action( 'gwiz_acceptance_test_bootstrap', 'bootstrap_remove_smooth_scrolling' );
function bootstrap_remove_smooth_scrolling() {
	wp_update_custom_css_post( 'html { scroll-behavior: auto !important; }' );
}

/* Bootstrap! */
do_action( 'gwiz_acceptance_test_bootstrap' );