<?php
/**
 * Plugin Name: Zynety Logistics App Settings & API
 * Description: Core logic, Settings, and REST API for the Zynety Logistics React App.
 * Version: 1.1
 * Author: Pritsim Solutions
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ==============================================
// 1. SETTINGS PAGE (Config)
// ==============================================
add_action('admin_menu', 'zynety_app_settings_menu');
function zynety_app_settings_menu() {
    add_menu_page('Zynety App', 'Zynety App', 'manage_options', 'zynety-app-settings', 'zynety_app_settings_page', 'dashicons-car', 30);
}

add_action('admin_init', 'zynety_app_register_settings');
function zynety_app_register_settings() {
    $options = ['zynety_bike_base', 'zynety_bike_rate', 'zynety_truck_base', 'zynety_truck_rate', 'zynety_packers_base', 'zynety_intercity_rate'];
    foreach($options as $opt) register_setting('zynety_app_options_group', $opt);
}

function zynety_app_settings_page() {
    ?>
    <div class="wrap">
        <h1>Zynety Logistics - App Configuration</h1>
        <form method="post" action="options.php">
            <?php settings_fields('zynety_app_options_group'); ?>
            <table class="form-table">
                <tr valign="top"><th scope="row">Two Wheeler Base / Per KM (₹)</th><td><input type="number"name="zynety_bike_base"value="<?php echo esc_attr(get_option('zynety_bike_base', 16)); ?>"style="width:80px"/> / <input type="number"name="zynety_bike_rate"value="<?php echo esc_attr(get_option('zynety_bike_rate', 8)); ?>"style="width:80px"/></td></tr>
                <tr valign="top"><th scope="row">Truck Base / Per KM (₹)</th><td><input type="number"name="zynety_truck_base"value="<?php echo esc_attr(get_option('zynety_truck_base', 36)); ?>"style="width:80px"/> / <input type="number"name="zynety_truck_rate"value="<?php echo esc_attr(get_option('zynety_truck_rate', 18)); ?>"style="width:80px"/></td></tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// ==============================================
// 2. CUSTOM POST TYPES (Database)
// ==============================================
add_action('init', 'zynety_register_cpts');
function zynety_register_cpts() {
    register_post_type('zynety_booking', [
        'labels' => ['name' => 'App Bookings', 'singular_name' => 'Booking'],
        'public' => true,
        'show_ui' => true,
        'menu_icon' => 'dashicons-calendar-alt',
        'supports' => ['title', 'custom-fields', 'author'],
    ]);
}

// ==============================================
// 3. REST API ENDPOINTS
// ==============================================
add_action('rest_api_init', function () {
    // Auth Endpoint
    register_rest_route('zynety/v1', '/auth', [
        'methods' => 'POST',
        'callback' => 'zynety_api_auth',
        'permission_callback' => '__return_true'
    ]);
    
    // Create Booking Endpoint
    register_rest_route('zynety/v1', '/bookings', [
        'methods' => 'POST',
        'callback' => 'zynety_api_create_booking',
        'permission_callback' => '__return_true'
    ]);
});

function zynety_api_auth(WP_REST_Request $request) {
    if(!isset($request['phone']) || empty($request['phone'])) return new WP_Error('no_phone', 'Phone number required', ['status' => 400]);
    $phone = sanitize_text_field($request['phone']);
    $role = isset($request['role']) ? sanitize_text_field($request['role']) : 'customer';
    
    // Basic mock logic: In production, send OTP and verify. For now, auto-login or create WP User by phone.
    $user = get_user_by('login', $phone);
    if(!$user) {
        $user_id = wp_insert_user(['user_login' => $phone, 'user_pass' => wp_generate_password(), 'role' => 'subscriber']);
        if(is_wp_error($user_id)) return $user_id;
        $user = get_userdata($user_id);
    }
    
    return rest_ensure_response([
        'status' => 'success',
        'user_id' => $user->ID,
        'phone' => $phone,
        'role' => $role,
        'message' => 'Authenticated successfully'
    ]);
}

function zynety_api_create_booking(WP_REST_Request $request) {
    $params = $request->get_json_params();
    if(!$params) $params = $request->get_body_params();
    
    $user_id = isset($params['user_id']) ? intval($params['user_id']) : 0;
    $pickup = sanitize_text_field($params['pickup']);
    $drop = sanitize_text_field($params['drop']);
    
    $post_id = wp_insert_post([
        'post_title' => 'Booking: ' . $pickup . ' to ' . $drop,
        'post_type' => 'zynety_booking',
        'post_status' => 'publish',
        'post_author' => $user_id
    ]);
    
    if(is_wp_error($post_id)) return $post_id;
    
    update_post_meta($post_id, 'pickup_pincode', $pickup);
    update_post_meta($post_id, 'drop_pincode', $drop);
    update_post_meta($post_id, 'service_type', sanitize_text_field($params['service']));
    update_post_meta($post_id, 'total_price', floatval($params['price']));
    update_post_meta($post_id, 'status', 'pending');
    
    return rest_ensure_response(['status' => 'success', 'booking_id' => $post_id]);
}
