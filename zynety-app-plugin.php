<?php
/**
 * Plugin Name: Zynety Logistics App Settings & API
 * Description: Core logic, Settings, and REST API for the Zynety Logistics React App.
 * Version: 2.0
 * Author: Pritsim Solutions
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ==============================================
// 1. SETTINGS PAGE
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
                <tr valign="top"><th scope="row">Two Wheeler Base / Per KM (₹)</th><td><input type="number" name="zynety_bike_base" value="<?php echo esc_attr(get_option('zynety_bike_base', 16)); ?>" style="width:80px"/> / <input type="number" name="zynety_bike_rate" value="<?php echo esc_attr(get_option('zynety_bike_rate', 16)); ?>" style="width:80px"/></td></tr>
                <tr valign="top"><th scope="row">Truck Base / Per KM (₹)</th><td><input type="number" name="zynety_truck_base" value="<?php echo esc_attr(get_option('zynety_truck_base', 36)); ?>" style="width:80px"/> / <input type="number" name="zynety_truck_rate" value="<?php echo esc_attr(get_option('zynety_truck_rate', 16)); ?>" style="width:80px"/></td></tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// ==============================================
// 1.5 ADMIN META BOX (Order Status)
// ==============================================
add_action('add_meta_boxes', function() {
    add_meta_box('zynety_order_status', 'Update Order Status', 'zynety_order_status_html', 'zynety_booking', 'side', 'high');
});

function zynety_order_status_html($post) {
    $current_status = get_post_meta($post->ID, 'status', true) ?: 'pending';
    // User requested options: pending, confirmed, on process, completed, closed
    $statuses = ['pending', 'confirmed', 'on_process', 'driver_assigned', 'in_transit', 'completed', 'closed'];
    wp_nonce_field('zynety_save_status', 'zynety_status_nonce');
    echo '<select name="zynety_status" style="width:100%">';
    foreach ($statuses as $status) {
        $selected = ($status === $current_status) ? 'selected' : '';
        echo '<option value="' . esc_attr($status) . '" ' . $selected . '>' . esc_html(ucwords(str_replace('_', ' ', $status))) . '</option>';
    }
    echo '</select>';
}

add_action('save_post', function($post_id) {
    if (!isset($_POST['zynety_status_nonce']) || !wp_verify_nonce($_POST['zynety_status_nonce'], 'zynety_save_status')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    if (isset($_POST['zynety_status'])) {
        update_post_meta($post_id, 'status', sanitize_text_field($_POST['zynety_status']));
    }
});

// ==============================================
// 2. CUSTOM POST TYPES
// ==============================================
add_action('init', 'zynety_register_cpts');
function zynety_register_cpts() {
    register_post_type('zynety_booking', [
        'labels'       => ['name' => 'App Bookings', 'singular_name' => 'Booking'],
        'public'       => true,
        'show_ui'      => true,
        'show_in_rest' => true,          // ← enables WP built-in REST API as fallback
        'rest_base'    => 'zynety_booking',
        'menu_icon'    => 'dashicons-calendar-alt',
        'supports'     => ['title', 'custom-fields', 'author'],
    ]);

    // Register all meta fields with REST API support so /wp/v2/zynety_booking returns meta
    $meta_fields = [
        'pickup_address', 'pickup_pincode', 'drop_address', 'drop_pincode',
        'sender_name', 'sender_phone', 'receiver_name', 'receiver_phone',
        'service_type', 'total_price', 'distance_km', 'payment_id',
        'status', 'driver_id', 'driver_name', 'user_email', 'booking_ref',
    ];
    foreach ($meta_fields as $field) {
        register_post_meta('zynety_booking', $field, [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => '__return_true',
        ]);
    }
}


// ==============================================
// 3. CORS HEADERS (Allow React App)
// ==============================================
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function( $value ) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Zynety-Token');
        return $value;
    });
});

// Handle preflight OPTIONS
add_action('init', function() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Zynety-Token');
        exit(0);
    }
});

// ==============================================
// 4. REST API ENDPOINTS
// ==============================================
add_action('rest_api_init', 'zynety_register_routes');
function zynety_register_routes() {

    // Auth (login + signup)
    register_rest_route('zynety/v1', '/auth', [
        'methods'  => 'POST',
        'callback' => 'zynety_api_auth',
        'permission_callback' => '__return_true'
    ]);

    // Create booking
    register_rest_route('zynety/v1', '/bookings', [
        ['methods' => 'POST', 'callback' => 'zynety_api_create_booking', 'permission_callback' => '__return_true'],
        ['methods' => 'GET',  'callback' => 'zynety_api_get_bookings',   'permission_callback' => '__return_true'],
    ]);

    // Single booking
    register_rest_route('zynety/v1', '/bookings/(?P<id>\d+)', [
        ['methods' => 'GET',   'callback' => 'zynety_api_get_single_booking', 'permission_callback' => '__return_true'],
        ['methods' => 'PATCH', 'callback' => 'zynety_api_update_booking_status', 'permission_callback' => '__return_true'],
    ]);

    // Driver: pending requests
    register_rest_route('zynety/v1', '/driver-requests', [
        'methods'  => 'GET',
        'callback' => 'zynety_api_driver_requests',
        'permission_callback' => '__return_true'
    ]);

    // Profile Settings
    register_rest_route('zynety/v1', '/profile', [
        'methods'  => 'POST',
        'callback' => 'zynety_api_update_profile',
        'permission_callback' => '__return_true'
    ]);
}

// ==============================================
// 5. AUTH
// ==============================================
function zynety_api_auth(WP_REST_Request $request) {
    $email    = sanitize_email($request['email']);
    $password = sanitize_text_field($request['password']);
    $action   = sanitize_text_field($request['action']); // 'login' | 'signup'
    $role     = isset($request['role']) ? sanitize_text_field($request['role']) : 'customer';

    if (empty($email) || empty($password)) {
        return new WP_Error('missing_creds', 'Email and Password are required', ['status' => 400]);
    }

    if ($action === 'signup') {
        if (email_exists($email) || username_exists($email)) {
            return new WP_Error('exists', 'An account with this email already exists.', ['status' => 400]);
        }
        $user_id = wp_create_user($email, $password, $email);
        if (is_wp_error($user_id)) return $user_id;

        $user = new WP_User($user_id);
        $user->set_role('subscriber');
        update_user_meta($user_id, 'zynety_role', $role);
        update_user_meta($user_id, 'zynety_display_name', '');
        update_user_meta($user_id, 'zynety_phone', '');
    } else {
        $user = wp_authenticate($email, $password);
        if (is_wp_error($user)) {
            return new WP_Error('invalid_login', 'Invalid email or password.', ['status' => 401]);
        }
        // Refresh role from meta (supports customer vs driver)
        $saved_role = get_user_meta($user->ID, 'zynety_role', true);
        if ($saved_role) $role = $saved_role;
    }

    // Generate a simple auth token tied to user
    $token = wp_hash($user->ID . $email . wp_salt());
    // Store the token so we can verify API calls later
    update_user_meta($user->ID, 'zynety_auth_token', $token);
    update_user_meta($user->ID, 'zynety_email', $email);

    return rest_ensure_response([
        'status'       => 'success',
        'user_id'      => $user->ID,
        'email'        => $email,
        'display_name' => get_user_meta($user->ID, 'zynety_display_name', true) ?: explode('@', $email)[0],
        'phone'        => get_user_meta($user->ID, 'zynety_phone', true) ?: '',
        'company'      => get_user_meta($user->ID, 'zynety_company', true) ?: '',
        'address'      => get_user_meta($user->ID, 'zynety_address', true) ?: '',
        'role'         => $role,
        'auth_token'   => $token,
        'message'      => 'Authenticated successfully'
    ]);
}

// ==============================================
// 6. CREATE BOOKING (POST)
// ==============================================
function zynety_api_create_booking(WP_REST_Request $request) {
    $params = $request->get_json_params();
    if (!$params) $params = $request->get_body_params();

    $user_id        = isset($params['user_id'])        ? intval($params['user_id'])              : 0;
    $sender_name    = sanitize_text_field($params['sender_name']   ?? '');
    $sender_phone   = sanitize_text_field($params['sender_phone']  ?? '');
    $pickup         = sanitize_text_field($params['pickup']        ?? $params['pickup_address'] ?? '');
    $pickup_pincode = sanitize_text_field($params['pickup_pincode'] ?? '');
    $receiver_name  = sanitize_text_field($params['receiver_name'] ?? '');
    $receiver_phone = sanitize_text_field($params['receiver_phone'] ?? '');
    $drop           = sanitize_text_field($params['drop']          ?? $params['drop_address'] ?? '');
    $drop_pincode   = sanitize_text_field($params['drop_pincode']  ?? '');
    $service        = sanitize_text_field($params['service']       ?? 'bike');
    $price          = floatval($params['price']                    ?? 0);
    $payment_id     = sanitize_text_field($params['payment_id']    ?? '');
    $distance       = sanitize_text_field($params['distance']      ?? '');

    // Resolve real WordPress user_id from auth_token header if user_id is 0
    if ($user_id === 0) {
        $token_header = isset($_SERVER['HTTP_X_ZYNETY_TOKEN']) ? sanitize_text_field($_SERVER['HTTP_X_ZYNETY_TOKEN']) : '';
        $user_email_param = sanitize_email($params['user_email'] ?? '');
        if (!empty($user_email_param)) {
            $wp_user = get_user_by('email', $user_email_param);
            if ($wp_user) $user_id = $wp_user->ID;
        }
    }

    // Get user email for persistent lookup
    $user_email_for_meta = '';
    if ($user_id > 0) {
        $wp_user = get_user_by('id', $user_id);
        if ($wp_user) $user_email_for_meta = $wp_user->user_email;
    }

    $ref = 'ZYN-' . strtoupper(substr(md5(time() . rand()), 0, 6));
    $post_id = wp_insert_post([
        'post_title'  => $ref . ': ' . $pickup_pincode . ' → ' . $drop_pincode,
        'post_type'   => 'zynety_booking',
        'post_status' => 'publish',
        'post_author' => $user_id,
    ]);

    if (is_wp_error($post_id)) return $post_id;

    $meta = [
        'sender_name'    => $sender_name,
        'sender_phone'   => $sender_phone,
        'pickup_address' => $pickup,
        'pickup_pincode' => $pickup_pincode,
        'receiver_name'  => $receiver_name,
        'receiver_phone' => $receiver_phone,
        'drop_address'   => $drop,
        'drop_pincode'   => $drop_pincode,
        'service_type'   => $service,
        'total_price'    => $price,
        'distance_km'    => $distance,
        'payment_id'     => $payment_id,
        'booking_ref'    => $ref,
        'user_email'     => $user_email_for_meta,  // ← persist email for lookup
        'status'         => 'confirmed',
        'driver_id'      => 0,
        'driver_name'    => '',
    ];
    foreach ($meta as $key => $value) {
        update_post_meta($post_id, $key, $value);
    }

    return rest_ensure_response([
        'status'      => 'success',
        'booking_id'  => $post_id,
        'booking_ref' => get_the_title($post_id),
    ]);
}

// ==============================================
// 7. GET BOOKINGS (for a user or all)
// ==============================================
function zynety_api_get_bookings(WP_REST_Request $request) {
    $user_id    = intval($request->get_param('user_id') ?? 0);
    $user_email = sanitize_email($request->get_param('user_email') ?? '');
    $status     = sanitize_text_field($request->get_param('status') ?? '');

    // If user_id is 0 or 1 (likely a mock ID), try resolving real ID by email
    if (($user_id <= 1) && !empty($user_email)) {
        $wp_user = get_user_by('email', $user_email);
        if ($wp_user) $user_id = $wp_user->ID;
    }

    $args = [
        'post_type'      => 'zynety_booking',
        'posts_per_page' => 100,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
    ];

    if ($user_id > 0) {
        // Find by WordPress post author
        $args['author'] = $user_id;
    } elseif (!empty($user_email)) {
        // Fallback: search by stored user_email meta
        $args['meta_query'] = [['key' => 'user_email', 'value' => $user_email, 'compare' => '=']];
    }

    if (!empty($status)) {
        $existing_meta = $args['meta_query'] ?? [];
        $args['meta_query'] = array_merge($existing_meta, [['key' => 'status', 'value' => $status]]);
    }

    $posts = get_posts($args);
    $bookings = [];

    foreach ($posts as $post) {
        $meta = get_post_meta($post->ID);
        $bookings[] = [
            'id'             => $post->ID,
            'ref'            => $post->post_title,
            'date'           => $post->post_date,
            'sender_name'    => $meta['sender_name'][0]    ?? '',
            'sender_phone'   => $meta['sender_phone'][0]   ?? '',
            'pickup_address' => $meta['pickup_address'][0] ?? '',
            'pickup_pincode' => $meta['pickup_pincode'][0] ?? '',
            'receiver_name'  => $meta['receiver_name'][0]  ?? '',
            'receiver_phone' => $meta['receiver_phone'][0] ?? '',
            'drop_address'   => $meta['drop_address'][0]   ?? '',
            'drop_pincode'   => $meta['drop_pincode'][0]   ?? '',
            'service_type'   => $meta['service_type'][0]   ?? 'bike',
            'total_price'    => $meta['total_price'][0]    ?? 0,
            'distance_km'    => $meta['distance_km'][0]    ?? '',
            'payment_id'     => $meta['payment_id'][0]     ?? '',
            'status'         => $meta['status'][0]         ?? 'pending',
            'driver_name'    => $meta['driver_name'][0]    ?? '',
        ];
    }

    return rest_ensure_response(['status' => 'success', 'bookings' => $bookings]);
}

// ==============================================
// 8. GET SINGLE BOOKING
// ==============================================
function zynety_api_get_single_booking(WP_REST_Request $request) {
    $id   = intval($request['id']);
    $post = get_post($id);
    if (!$post || $post->post_type !== 'zynety_booking') {
        return new WP_Error('not_found', 'Booking not found', ['status' => 404]);
    }
    $meta = get_post_meta($id);
    return rest_ensure_response([
        'status'  => 'success',
        'booking' => [
            'id'             => $id,
            'ref'            => $post->post_title,
            'date'           => $post->post_date,
            'pickup_address' => $meta['pickup_address'][0] ?? '',
            'pickup_pincode' => $meta['pickup_pincode'][0] ?? '',
            'drop_address'   => $meta['drop_address'][0]   ?? '',
            'drop_pincode'   => $meta['drop_pincode'][0]   ?? '',
            'service_type'   => $meta['service_type'][0]   ?? '',
            'total_price'    => $meta['total_price'][0]    ?? 0,
            'distance_km'    => $meta['distance_km'][0]    ?? '',
            'status'         => $meta['status'][0]         ?? 'pending',
            'driver_name'    => $meta['driver_name'][0]    ?? '',
        ]
    ]);
}

// ==============================================
// 9. UPDATE BOOKING STATUS (for driver accept/complete)
// ==============================================
function zynety_api_update_booking_status(WP_REST_Request $request) {
    $id     = intval($request['id']);
    $params = $request->get_json_params();
    if (!$params) $params = $request->get_body_params();

    $allowed_statuses = ['pending', 'confirmed', 'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    $new_status = sanitize_text_field($params['status'] ?? '');

    if (!in_array($new_status, $allowed_statuses)) {
        return new WP_Error('invalid_status', 'Invalid status value.', ['status' => 400]);
    }

    $post = get_post($id);
    if (!$post || $post->post_type !== 'zynety_booking') {
        return new WP_Error('not_found', 'Booking not found', ['status' => 404]);
    }

    update_post_meta($id, 'status', $new_status);
    if (!empty($params['driver_id'])) update_post_meta($id, 'driver_id', intval($params['driver_id']));
    if (!empty($params['driver_name'])) update_post_meta($id, 'driver_name', sanitize_text_field($params['driver_name']));

    return rest_ensure_response(['status' => 'success', 'booking_id' => $id, 'new_status' => $new_status]);
}

// ==============================================
// 10. DRIVER REQUESTS (pending bookings)
// ==============================================
function zynety_api_driver_requests(WP_REST_Request $request) {
    $posts = get_posts([
        'post_type'      => 'zynety_booking',
        'posts_per_page' => 20,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
        'meta_query'     => [['key' => 'status', 'value' => 'confirmed']],
    ]);

    $requests = [];
    foreach ($posts as $post) {
        $meta = get_post_meta($post->ID);
        $requests[] = [
            'id'             => $post->ID,
            'ref'            => $post->post_title,
            'date'           => $post->post_date,
            'pickup_address' => $meta['pickup_address'][0] ?? '',
            'pickup_pincode' => $meta['pickup_pincode'][0] ?? '',
            'drop_address'   => $meta['drop_address'][0]   ?? '',
            'drop_pincode'   => $meta['drop_pincode'][0]   ?? '',
            'service_type'   => $meta['service_type'][0]   ?? 'bike',
            'total_price'    => $meta['total_price'][0]    ?? 0,
            'distance_km'    => $meta['distance_km'][0]    ?? '',
            'sender_name'    => $meta['sender_name'][0]    ?? '',
            'sender_phone'   => $meta['sender_phone'][0]   ?? '',
        ];
    }

    return rest_ensure_response(['status' => 'success', 'requests' => $requests]);
}

// ==============================================
// 11. UPDATE PROFILE
// ==============================================
function zynety_api_update_profile(WP_REST_Request $request) {
    $params = $request->get_json_params() ?: [];
    $user_id = intval($params['user_id'] ?? 0);
    $email = sanitize_email($params['user_email'] ?? '');
    
    // Resolve real user_id from email if mock fallback (0 or 1) was sent
    if (($user_id <= 1) && !empty($email)) {
        $wp_user = get_user_by('email', $email);
        if ($wp_user) $user_id = $wp_user->ID;
    }

    if ($user_id <= 0) {
        return new WP_Error('invalid_user', 'Invalid user.', ['status' => 400]);
    }

    if (isset($params['display_name'])) {
        update_user_meta($user_id, 'zynety_display_name', sanitize_text_field($params['display_name']));
    }
    if (isset($params['phone'])) {
        update_user_meta($user_id, 'zynety_phone', sanitize_text_field($params['phone']));
    }
    if (isset($params['company'])) {
        update_user_meta($user_id, 'zynety_company', sanitize_text_field($params['company']));
    }
    if (isset($params['address'])) {
        update_user_meta($user_id, 'zynety_address', sanitize_textarea_field($params['address']));
    }

    return rest_ensure_response([
        'status'       => 'success',
        'message'      => 'Profile updated successfully',
        'display_name' => get_user_meta($user_id, 'zynety_display_name', true),
        'phone'        => get_user_meta($user_id, 'zynety_phone', true),
        'company'      => get_user_meta($user_id, 'zynety_company', true),
        'address'      => get_user_meta($user_id, 'zynety_address', true),
    ]);
}

