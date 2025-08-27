document.addEventListener('DOMContentLoaded', () => {

    const serviceCost = {"LVL1": 1, "LVL2": 2, "LVL3": 4};
    const allFieldsets = document.querySelectorAll('.categories details fieldset');
    const selectedHistory = {};

    const params = new URLSearchParams(window.location.search);
    const categoriasParam = params.get('categorias');
    const categoriasSeleccionadas = categoriasParam ? categoriasParam.split(" ") : [];

    const categoriesContainer = document.querySelector('.categories');
    if (categoriesContainer) {
        categoriesContainer.querySelectorAll('.category details').forEach(detail => {
            const categoria = detail.getAttribute('data-categories');
            detail.style.display = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(categoria)
                ? ''
                : 'none';
        });

        // Oculta columnas vacías
        categoriesContainer.querySelectorAll('.category').forEach(cat => {
            const visible = Array.from(cat.querySelectorAll('details')).some(d => d.style.display !== 'none');
            cat.style.display = visible ? '' : 'none';
            if (visible) cat.style.flex = '';
        });

        const visibles = categoriesContainer.querySelectorAll('.category:not([style*="display: none"])');
        if (visibles.length === 1) {
            visibles[0].style.flex = '1 1 100%';
        }
    }

    function getSelectedServices() {
        // Limpia historial previo
        for (const k in selectedHistory) delete selectedHistory[k];

        allFieldsets.forEach(fieldset => {
            const firstRadio = fieldset.querySelector('input[type="radio"]');
            if (!firstRadio) return;
            const name = firstRadio.name;
            const selected = fieldset.querySelector(`input[type="radio"][name="${name}"]:checked`);
            const category = fieldset.closest('details')?.querySelector('summary')?.textContent?.trim() || 'Sin categoría';
            const nivel = fieldset.className;

            if (selected) {
                const respuesta = (selected.nextSibling?.textContent || '').trim();
                if (respuesta.toLowerCase() !== 'no') {
                    selectedHistory[name] = {
                        categoria: category,
                        grupo: name,
                        respuesta,
                        nivel,
                        costo: serviceCost[nivel] || 1
                    };
                }
            }
        });
        return Object.values(selectedHistory);
    }

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
        if (currentMonth.length) months.push(currentMonth);
        return months;
    }

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

    function updateResults(services = []) {
        document.querySelectorAll('table').forEach(t => t.remove());
        services.sort((a, b) => serviceCost[b.nivel] - serviceCost[a.nivel]);
        const months = distributeServicesByMonth(services, 4);
        renderTable(months);
    }

    function refresh() {
        const services = getSelectedServices();
        updateResults(services);
    }

    allFieldsets.forEach(fieldset => {
        fieldset.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', refresh);
        });
    });

    // Init
    refresh();
});