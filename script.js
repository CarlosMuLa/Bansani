document.addEventListener('DOMContentLoaded', () => {
    const serviceCost = {"LVL1": 1, "LVL2": 2, "LVL3": 4};
    const allFieldsets = document.querySelectorAll('.categories details fieldset');

    // Guarda el historial de selecciones por grupo
    const selectedHistory = {};

    // Obtiene los servicios seleccionados y sus niveles
    function getSelectedServices() {
        const selectedServices = [];
        allFieldsets.forEach(fieldset => {
            const firstRadio = fieldset.querySelector('input[type="radio"]');
            if (!firstRadio) return;
            const name = firstRadio.name;
            const selected = fieldset.querySelector(`input[type="radio"][name="${name}"]:checked`);
            const category = fieldset.closest('details')?.querySelector('summary')?.textContent?.trim() || 'Sin categoría';
            const nivel = fieldset.className; // LVL1, LVL2, LVL3

            // Si la respuesta es "No", no la agregues pero conserva el historial
            if (selected) {
                const respuesta = selected.nextSibling.textContent.trim();
                if (respuesta.toLowerCase() !== "no") {
                    selectedHistory[name] = {
                        categoria: category,
                        grupo: name,
                        respuesta: respuesta,
                        nivel: nivel,
                        costo: serviceCost[nivel] || 1
                    };
                }
            }
        });

        // Devuelve todos los servicios guardados en el historial
        return Object.values(selectedHistory);
    }

    // Distribuye los servicios por mes según el costo máximo permitido
    function distributeServicesByMonth(services, maxCostPerMonth = 4) {
        const months = [];
        let currentMonth = [];
        let currentCost = 0;

        services.forEach(service => {
            if (currentCost + service.costo > maxCostPerMonth) {
                months.push(currentMonth);
                currentMonth = [];
                currentCost = 0;
            }
            currentMonth.push(service);
            currentCost += service.costo;
        });
        if (currentMonth.length > 0) months.push(currentMonth);
        return months;
    }

    // Genera la tabla en HTML
    function renderTable(months) {
        let html = `<table border="1"><tr><th>Mes</th><th>Servicios</th></tr>`;
        months.forEach((month, idx) => {
            html += `<tr><td>Mes ${idx + 1}</td><td>`;
            month.forEach(service => {
                html += `<div>${service.categoria} - ${service.grupo} - ${service.respuesta} (${service.nivel})</div>`;
            });
            html += `</td></tr>`;
        });
        html += `</table>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // Cuando cambie una selección, actualiza la tabla
    function updateResults() {
        // Elimina tablas previas
        document.querySelectorAll('table').forEach(t => t.remove());
        const selectedServices = getSelectedServices();
        // Opcional: ordenar por nivel para priorizar LVL2 y LVL1
        selectedServices.sort((a, b) => serviceCost[b.nivel] - serviceCost[a.nivel]);
        const months = distributeServicesByMonth(selectedServices, 4);
        renderTable(months);
    }

    // Listeners
    allFieldsets.forEach(fieldset => {
        fieldset.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', updateResults);
        });
    });

    // Inicializa la tabla al cargar
    updateResults();
});