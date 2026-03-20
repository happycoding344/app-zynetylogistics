<?php
/**
 * Plugin Name: Zynety Logistics App Settings
 * Description: Management panel for the Zynety Logistics React App. Adds a settings page to configure delivery base fares, per KM rates, and driver incentives.
 * Version: 1.0
 * Author: Pritsim Solutions
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// Add menu to WP Admin
add_action('admin_menu', 'zynety_app_settings_menu');
function zynety_app_settings_menu() {
    add_menu_page('Zynety App', 'Zynety App', 'manage_options', 'zynety-app-settings', 'zynety_app_settings_page', 'dashicons-car', 30);
}

// Register Settings
add_action('admin_init', 'zynety_app_register_settings');
function zynety_app_register_settings() {
    register_setting('zynety_app_options_group', 'zynety_bike_base');
    register_setting('zynety_app_options_group', 'zynety_bike_rate');
    register_setting('zynety_app_options_group', 'zynety_truck_base');
    register_setting('zynety_app_options_group', 'zynety_truck_rate');
    register_setting('zynety_app_options_group', 'zynety_packers_base');
    register_setting('zynety_app_options_group', 'zynety_intercity_rate');
}

// Settings Page HTML
function zynety_app_settings_page() {
    ?>
    <div class="wrap">
        <h1>Zynety Logistics App - Pricing Configuration</h1>
        <p>Update pricing values here. The React app (at /app) will automatically fetch these new rates.</p>
        <form method="post" action="options.php">
            <?php settings_fields('zynety_app_options_group'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Two Wheeler - Base Charge (₹)</th>
                    <td><input type="number" name="zynety_bike_base" value="<?php echo esc_attr(get_option('zynety_bike_base', 16)); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Two Wheeler - Per KM Rate (₹)</th>
                    <td><input type="number" name="zynety_bike_rate" value="<?php echo esc_attr(get_option('zynety_bike_rate', 8)); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Truck - Base Charge (₹)</th>
                    <td><input type="number" name="zynety_truck_base" value="<?php echo esc_attr(get_option('zynety_truck_base', 36)); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Truck - Per KM Rate (₹)</th>
                    <td><input type="number" name="zynety_truck_rate" value="<?php echo esc_attr(get_option('zynety_truck_rate', 18)); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Packers & Movers - Base Charge (₹)</th>
                    <td><input type="number" name="zynety_packers_base" value="<?php echo esc_attr(get_option('zynety_packers_base', 80)); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Intercity - Per KM Rate (₹)</th>
                    <td><input type="number" name="zynety_intercity_rate" value="<?php echo esc_attr(get_option('zynety_intercity_rate', 12)); ?>" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
