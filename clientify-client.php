// 1. Creamos el "endpoint" para que WordPress escuche las peticiones AJAX.
// 'wp_ajax_nopriv_' es para usuarios no logueados (tus visitantes).
// 'send_clientify_contact' es el nombre único de nuestra acción.
add_action('wp_ajax_nopriv_send_clientify_contact', 'handle_clientify_form');
add_action('wp_ajax_send_clientify_contact', 'handle_clientify_form'); // Para usuarios logueados también

function handle_clientify_form() {
    // 2. Verificación de seguridad (Nonce). Es vital para evitar ataques.
    // Lo crearemos en el formulario HTML en el siguiente paso.
    if (!isset($_POST['security']) || !wp_verify_nonce($_POST['security'], 'clientify_nonce')) {
        wp_send_json_error(['message' => 'Error de seguridad. Inténtalo de nuevo.']);
        wp_die();
    }

    // 3. Obtener la API Key de forma segura desde wp-config.php
    $apiKey = defined('CLIENTIFY_API_KEY') ? CLIENTIFY_API_KEY : '';
    if (empty($apiKey)) {
        wp_send_json_error(['message' => 'Error de configuración del servidor.']);
        wp_die();
    }

    // 4. Obtener los datos del usuario que JavaScript envió por POST.
    // Usamos sanitize_text_field y sanitize_email para limpiar los datos.
    $nombre = isset($_POST['nombre']) ? sanitize_text_field($_POST['nombre']) : '';
    $email = isset($_POST['correo']) ? sanitize_email($_POST['correo']) : '';
    $telefono = isset($_POST['telefono']) ? sanitize_text_field($_POST['telefono']) : '';

    // Validar que los campos no estén vacíos
    if (empty($nombre) || empty($email)) {
        wp_send_json_error(['message' => 'Nombre y correo son obligatorios.']);
        wp_die();
    }

    // 5. Preparar y ejecutar la llamada a la API de Clientify
    $apiUrl = 'https://api.clientify.com/v1/contacts/';
    $body = json_encode([
        'first_name' => $nombre,
        'email'      => $email,
        'phones'     => [['phone' => $telefono]], // Ajusta esto según la API de Clientify
    ]);

    $args = [
        'body'      => $body,
        'headers'   => [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Token ' . $apiKey,
        ],
        'timeout'   => 15, // Aumentar tiempo de espera por si la API es lenta
    ];

    $response = wp_remote_post($apiUrl, $args);

    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'Error de conexión con el servicio.']);
        wp_die();
    }

    $response_code = wp_remote_retrieve_response_code($response);

    // Si la API devuelve un código de éxito (200-299), enviamos una respuesta de éxito.
    if ($response_code >= 200 && $response_code < 300) {
        wp_send_json_success(['message' => '¡Datos enviados correctamente!']);
    } else {
        // Si no, enviamos un error con el mensaje de la API si es posible.
        wp_send_json_error(['message' => 'El servicio devolvió un error. Código: ' . $response_code]);
    }

    wp_die(); // Siempre terminar la ejecución de AJAX con wp_die()
}