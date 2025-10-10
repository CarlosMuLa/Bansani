<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

// BEGIN ENQUEUE PARENT ACTION
// AUTO GENERATED - Do not modify or remove comment markers above or below:

if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) )
            $uri = get_template_directory_uri() . '/rtl.css';
        return $uri;
    }
endif;
add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );
         
if ( !function_exists( 'child_theme_configurator_css' ) ):
    function child_theme_configurator_css() {
        wp_enqueue_style( 'chld_thm_cfg_child', trailingslashit( get_stylesheet_directory_uri() ) . 'style.css', array( 'hello-elementor','hello-elementor','hello-elementor-theme-style','hello-elementor-header-footer' ) );
    }
endif;
add_action( 'wp_enqueue_scripts', 'child_theme_configurator_css', 99999 );

// END ENQUEUE PARENT ACTION

//shortcode for number of posts 
function wpb_total_posts() {
	$total = wp_count_posts($type = 'proyectos-bnzero')->publish;
	return $total;
}
add_shortcode ('total_posts','wpb_total_posts');

function enqueue_isotope_scripts() {
    wp_enqueue_script('jquery');
    wp_enqueue_script('isotope', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js', array('jquery'), null, true);
    wp_enqueue_script('custom-isotope', get_template_directory_uri() . '/js/custom-isotope.js', array('jquery', 'isotope'), null, true);
}
add_action('wp_enqueue_scripts', 'enqueue_isotope_scripts');

function add_custom_acordeon_script() {
    if (is_page()) { // Verifica si ests en una p谩gina
        ?>
        <script type="text/javascript">
            jQuery(document).ready(function($) {
                // Al hacer clic en un encabezado de acorde贸n
                $('.eael-accordion-header').on('click', function() {
                    // Cierra todos los acordeones
                    $('.eael-accordion-header').removeClass('active');
                    $('.eael-accordion-content').slideUp();

                    // Abre el acorde贸n clickeado
                    $(this).addClass('active');
                    $('#' + $(this).attr('aria-controls')).slideDown();
                });
            });
        </script>
        <?php
    }
}
add_action('wp_footer', 'add_custom_acordeon_script');

function diagnostic_form_scripts() {
    // Only load on pages where you need the form
    // You can adjust this condition based on your needs
    if (is_page('diagnostico') || is_page('diagnostic-form') || is_page('cotizador')   ) {
        wp_localize_script('jquery', 'diagnostic_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('diagnostic_form_nonce')
        ));
    }
}

function force_utf8_recursive($array) {
    foreach ($array as $key => $value) {
        if (is_array($value)) {
            $array[$key] = force_utf8_recursive($value);
        } elseif (is_string($value)) {
            // mb_convert_encoding es más robusto que utf8_encode
            $array[$key] = mb_convert_encoding($value, 'UTF-8', 'auto');
        }
    }
    return $array;
}

add_action('wp_enqueue_scripts', 'diagnostic_form_scripts');


add_action('wp_ajax_send_clientify_contact', 'send_clientify_contact'); 
add_action('wp_ajax_nopriv_send_clientify_contact', 'send_clientify_contact'); 

function send_clientify_contact() {
 // Verify nonce for security

if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'diagnostic_form_nonce')) {

wp_send_json_error(array('message' => 'Verificación de seguridad fallida'));

    wp_die();

  }

 

  // Sanitize and validate input data

  $nombre = '';

  $correo = '';

  $telefono = '';

  if (isset($_POST['client_info_json'])) {

    // --- CASE 1: Data comes from the cookie ---

   

    // Decode the JSON string back into a PHP object

    $client_info = json_decode(stripslashes($_POST['client_info_json']));



    // Get the data from the decoded object

    $nombre = sanitize_text_field($client_info->nombre);

    $correo = sanitize_email($client_info->correo);

    $telefono = sanitize_text_field($client_info->telefono);



  } else {

    // --- CASE 2: Data comes from the modal form ---

    $nombre = isset($_POST['nombre']) ? sanitize_text_field($_POST['nombre']) : '';

    $correo = isset($_POST['correo']) ? sanitize_email($_POST['correo']) : '';

    $telefono = isset($_POST['telefono']) ? sanitize_text_field($_POST['telefono']) : '';

  }

  $categorias = isset($_POST['categorias']) ? stripslashes($_POST['categorias']) : null;

$servicios = isset($_POST['services']) ? sanitize_text_field($_POST['services']) : null;

$costo_cotizacion = isset($_POST['cost']) ? floatval($_POST['cost']) : 0;

  $nombre_clean = trim(preg_replace('/\s+/', ' ', $nombre)); // normalize spaces

  if ($nombre_clean === '') {

    $first_name = '';

    $last_name = '';

  } else {

    $parts = explode(' ', $nombre_clean);

    $first_name = sanitize_text_field(array_shift($parts));

    $last_name = sanitize_text_field(implode(' ', $parts)); // can be empty if only one word

  }

  // Validate required fields

  if (empty($first_name) || empty($correo) || empty($telefono)) {

    wp_send_json_error(array('message' => 'Todos los campos son requeridos'));

    wp_die();

  }

 

  if (!is_email($correo)) {

    wp_send_json_error(array('message' => 'Por favor ingresa un correo válido'));

    wp_die();

  }

 

  // Get API key from wp-config.php

  if (!defined('CLIENTFY_API_KEY')) {

    error_log('Clientify API Key not defined in wp-config.php');

    wp_send_json_error(array('message' => 'Error de configuración del servidor'));

    wp_die();

  }

 

  $clientify_api_key = CLIENTFY_API_KEY;

 

  // Prepare data for Clientify API

// 1 for the diagnostic form

// 2 for the cotizador form

  $clientify_data = array(

  'first_name' => $first_name,

'last_name' => $last_name,

  'email'   => $correo,

  'phone'   => $telefono);

if($categorias)

{
    $categorias_array = json_decode($categorias, true);
    if (is_array($categorias_array)) {
        // Si sí, ahora unimos el array en un string separado por comas
        $valor_final = implode(', ', $categorias_array);
    } else {
        // Si no era un JSON, o la decodificación falló, usamos el valor original tal cual
        $valor_final = $categorias_raw;
    }

$clientify_data['custom_fields'][] = array(

'field' => "diagnostico",

'value' => $valor_final

);
$clientify_data['tags'] = ['prospecto-bansani'];

}

else

{

$clientify_data['custom_fields'][] = array(

'field' => "Cotizacion",

'value' => $servicios

);
if ($costo_cotizacion>0) {
    $clientify_data['custom_fields'][] = array(

'field' => "costo",

'value' => number_format($costo_cotizacion,2,'.',',')

);
}
}

$clientify_data['tags'] = ['prospecto-bansani-diagnostico'];

}

$clientify_data_utf8 = force_utf8_recursive($clientify_data);
$body = json_encode($clientify_data_utf8);
if ($body === false) {
    error_log('Error al codificar los datos a JSON. Datos: ' . print_r($clientify_data_utf8, true));
    wp_send_json_error(array('message' => 'Error interno del servidor al procesar los datos.'));
    wp_die();
}
 

  // Clientify API configuration

  $clientify_api_url = 'https://api.clientify.net/v1/contacts/'; // Adjust endpoint as needed

 // CORRECT - Only sends the JSON data

 error_log('Datos finales a enviar a Clientify: ' . print_r($clientify_data_utf8, true));


  // Make API call to Clientify

  $response = wp_remote_post($clientify_api_url, array(

    'headers' => array(

      'Authorization' => 'Token ' . $clientify_api_key,

      'Content-Type' => 'application/json'

    ),

    'body' => $body,

    'timeout' => 60

  ));

 

  // Check for errors

  if (is_wp_error($response)) {

    error_log('Clientify API Error: ' . $response->get_error_message());

    wp_send_json_error(array('message' => 'Error al conectar con el servidor. Por favor, intenta de nuevo.'));

    wp_die();

  }

 

  $response_code = wp_remote_retrieve_response_code($response);

  $response_body = wp_remote_retrieve_body($response);

 

  if ($response_code >= 200 && $response_code < 300) {

    // Success

    wp_send_json_success(array(

      'message' => 'Datos enviados correctamente',

      'clientify_response' => json_decode($response_body)

    ));

  } else {

    // API returned an error

    error_log('Clientify API Response Error: Code ' . $response_code . ' - Body: ' . $response_body);

   

    // Try to parse error message from Clientify

    $error_data = json_decode($response_body, true);

    $error_message = 'Error al procesar la solicitud';

   

    if (isset($error_data['message'])) {

      $error_message = $error_data['message'];

    } elseif (isset($error_data['error'])) {

      $error_message = $error_data['error'];

    }

   

    wp_send_json_error(array('message' => $error_message));

  }

 

  wp_die();

}