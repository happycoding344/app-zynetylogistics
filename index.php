<?php
/**
 * Zynety Logistics - App Entry Point
 * This file replaces the static index.html with a dynamic one that bootstraps WordPress,
 * fetches pricing settings from our plugin, and injects it into the React app instantly!
 */

// 1. Boot up WordPress silently (Assuming this is hosted in public_html/app/)
$wp_load_path = dirname(dirname(__FILE__)) . '/wp-load.php';
if (file_exists($wp_load_path)) {
    require_once $wp_load_path;
}

// 2. Fetch the configurable pricing data
// If WP isn't loaded (e.g., local test), fallback gracefully
$config = array(
    'bike' => array(
        'base' => function_exists('get_option') ? (float) get_option('zynety_bike_base', 16) : 16,
        'rate' => function_exists('get_option') ? (float) get_option('zynety_bike_rate', 8) : 8
    ),
    'truck' => array(
        'base' => function_exists('get_option') ? (float) get_option('zynety_truck_base', 36) : 36,
        'rate' => function_exists('get_option') ? (float) get_option('zynety_truck_rate', 18) : 18
    ),
    'packers' => array(
        'base' => function_exists('get_option') ? (float) get_option('zynety_packers_base', 80) : 80,
        'rate' => 40 // Typically fixed for packers
    ),
    'intercity' => array(
        'base' => function_exists('get_option') ? (float) get_option('zynety_intercity_rate', 12) * 2 : 24,
        'rate' => function_exists('get_option') ? (float) get_option('zynety_intercity_rate', 12) : 12
    )
);

// 3. Read the Vite compiled HTML template
$html_path = dirname(__FILE__) . '/dist/index.html';
if (!file_exists($html_path)) {
    die("React App not built yet. Please run 'npm run build' inside the app folder.");
}

$html = file_get_contents($html_path);

// 4. Inject the WP configuration directly into the React App's memory
$script = "<script>window.ZynetyConfig = " . json_encode($config) . ";</script>";
$html = str_replace('<head>', '<head>' . "\n    " . $script, $html);

// 5. Output the final dynamic app
echo $html;
