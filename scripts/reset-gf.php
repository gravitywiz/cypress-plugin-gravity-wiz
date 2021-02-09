<?php
function gwiz_reset_gravity_forms() {
	global $wpdb;

	print "Dropping Gravity Forms tables...";
	GFFormsModel::drop_tables();

	print "Dropping Gravity Forms Add-on tables...";

	$tables = array(
		$wpdb->prefix . 'gf_addon_feed',
		$wpdb->prefix . 'gf_addon_payment_callback',
		$wpdb->prefix . 'gf_addon_payment_transaction',
	);

	foreach ( $tables as $table ) {
		$wpdb->query( "DROP TABLE IF EXISTS $table" );
	}

	print "Initializing Gravity Forms";
	gf_upgrade()->upgrade( null, true );
	update_option( 'gform_pending_installation', false );
}

gwiz_reset_gravity_forms();