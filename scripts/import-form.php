<?php
function gwiz_import_form( $export_path, $form_title = null ) {
	require_once( \GFCommon::get_base_path() . '/export.php' );

	$filename  = basename( $export_path, '.json' );
	$json_path = realpath( $export_path );

	//print 'Importing form: ' . $filename . '.json';

	$existing_forms = \GFAPI::get_forms();

	/**
	 * Un-restrict database object type temporarily to prevent issues during import.
	 */
	add_filter( 'gppa_object_type_restricted_database', '__return_false', 100 );

	/**
	 * Disable form sanitization as it causes LMTs to get malformed. For some reason, this issue does not appear to
	 * happen when importing through the UI.
	 */
	add_filter( 'gform_disable_form_settings_sanitization', '__return_true', 100 );

	if ( ! empty( $form_title ) ) {
		add_action( 'gform_forms_post_import', function( $forms ) use ($form_title) {
			foreach ( $forms as $form ) {
				$form['title'] = $form_title;
				\GFAPI::update_form( $form );
			}
		} );
	}

	\GFExport::import_file( $json_path );

	/**
	 * Figure out what form(s) was just imported by comparing the existing forms array to the forms array after importing.
	 */
	$imported_forms = array_diff( array_map( 'serialize', \GFAPI::get_forms() ), array_map( 'serialize', $existing_forms ) );
	$imported_forms = array_values( array_map( 'unserialize', $imported_forms ) );

	foreach ( $imported_forms as $form ) {
		\GFFormsModel::update_form_active( $form['id'], true );

		$page = array(
			'post_type'    => 'page',
			'post_content' => '[gravityform id=' . $form['id'] . ']',
			'post_name'    => sanitize_title_with_dashes( $filename ),
			'post_parent'  => 0,
			'post_author'  => 1,
			'post_status'  => 'publish',
			'post_title'   => $form['title'],
		);

		wp_insert_post( $page );
	}

	remove_filter( 'gppa_object_type_restricted_database', '__return_false', 100 );
	remove_filter( 'gform_disable_form_settings_sanitization', '__return_true', 100 );

	return $imported_forms;
}

/** @var array $args Arg provided by WP-CLI */
$args[1] = isset( $args[1] ) ? $args[1] : null;
echo json_encode( gwiz_import_form( $args[0], $args[1] ) );