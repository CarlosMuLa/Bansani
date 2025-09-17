document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: Handles the main diagnostic form submission ---
    const diagnosticForm = document.getElementById('diagnostic-form');
    
    if (diagnosticForm) {
        diagnosticForm.addEventListener('submit', function(event) {
            // This is the key: it stops the page from reloading.
            event.preventDefault(); 

            const categorias = [];
            if (document.querySelector('input[name="Lugar"]:checked')?.value === "si") categorias.push("Lugar");
            if (document.querySelector('input[name="Comunidad"]:checked')?.value === "si") categorias.push("Comunidad");
            if (document.querySelector('input[name="Materiales"]:checked')?.value === "si") categorias.push("Materiales");
            if (document.querySelector('input[name="Agua"]:checked')?.value === "si") categorias.push("Agua");
            if (document.querySelector('input[name="Educacion"]:checked')?.value === "si") categorias.push("Educacion");
            if (document.querySelector('input[name="Gestion"]:checked')?.value === "si") categorias.push("Gestion");
            if (document.querySelector('input[name="Salud"]:checked')?.value === "si") categorias.push("Salud");
            if (document.querySelector('input[name="Energia"]:checked')?.value === "si") categorias.push("Energia");
            
            // Save categories for the next step
            window.selectedCategorias = categorias;
            
            // Now, show the modal
            document.getElementById('cliente-modal').style.display = 'block';
        });
    }

    // --- PART 2: Handles the logic for the modal itself ---
    const clientForm = document.getElementById('cliente-form');
    const modal = document.getElementById('cliente-modal');
    const modalInner = document.querySelector('#cliente-modal > div');

    // This function is called ONLY if the API responds with success
    function showNextStepOptions() {
        const categorias = window.selectedCategorias || [];
        const modalContent = `
            <button id="close-modal-btn" style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
            <h2>¡Gracias! Tus datos fueron enviados.</h2>
            <p style="margin-bottom:18px;">¿Cómo prefieres continuar?</p>
            <button id="cotizar-btn" style="background:#1846a3; color:#fff; border:none; border-radius:6px; padding:12px 0; width:100%; font-size:1.1rem; font-weight:600; cursor:pointer; margin-bottom:12px;">Cotizar por mi cuenta</button>
            <button id="esperar-btn" style="background:#fff; color:#1846a3; border:2px solid #1846a3; border-radius:6px; padding:12px 0; width:100%; font-size:1.1rem; font-weight:600; cursor:pointer;">Esperar contacto de especialista</button>
        `;
        modalInner.innerHTML = modalContent;

        // Assign events to the new buttons
        document.getElementById('cotizar-btn').onclick = function() {
            // Note: I uncommented this line for you.
            const url = `/bansani/cotizador/?categorias=${categorias.join("+")}`;
            window.location.href = url;
        };

        document.getElementById('esperar-btn').onclick = function() {
            modalInner.innerHTML = `
                <button id="close-modal-btn" style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                <h2>¡Perfecto!</h2>
                <p>Un especialista se pondrá en contacto contigo pronto.</p>
            `;
            document.getElementById('close-modal-btn').onclick = () => modal.style.display = 'none';
        };
        
        document.getElementById('close-modal-btn').onclick = () => modal.style.display = 'none';
    }

    // Handles the contact form submission inside the modal
    if (clientForm) {
        clientForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(clientForm);
            formData.append('action', 'send_clientify_contact');

            const submitButton = clientForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    showNextStepOptions(); // SUCCESS: Show the next step
                } else {
                    const errorMessage = result.data?.message || 'Ocurrió un error desconocido.';
                    alert('Hubo un error: ' + errorMessage);
                    submitButton.textContent = 'Continuar';
                    submitButton.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error en la petición:', error);
                alert('Hubo un problema de conexión. Por favor, inténtalo de nuevo.');
                submitButton.textContent = 'Continuar';
                submitButton.disabled = false;
            });
        });
    }

    // Close modal functionality
    const closeModalButton = document.getElementById('close-modal-btn');
    if(closeModalButton) {
        closeModalButton.onclick = function() {
            modal.style.display = 'none';
        };
    }
});
