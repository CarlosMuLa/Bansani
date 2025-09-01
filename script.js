document.addEventListener('DOMContentLoaded', () => {

    const serviceCost = {"LVL1": 1, "LVL2": 2, "LVL3": 4};
    const allFieldsets = document.querySelectorAll('.categories details fieldset');
    const selectedHistory = {};

    const TOTAL_COMPONENTS = 49;
    const MONTHLY_COST = 12000;

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
        for (const k in selectedHistory) delete selectedHistory[k];

        allFieldsets.forEach(fieldset => {
            const firstRadio = fieldset.querySelector('input[type="radio"]');
            if (!firstRadio) return;

            const preguntaId = firstRadio.name;
            const selected = fieldset.querySelector(`input[type="radio"][name="${preguntaId}"]:checked`);
            if (!selected) return;

            const respuestaTxt = (selected.nextSibling?.textContent || selected.value || '').trim().toLowerCase();
            if (respuestaTxt === 'no') return;

            const categoria = fieldset.closest('details')?.querySelector('summary')?.textContent?.trim() || 'Sin categoría';
            const nivel = fieldset.className.trim();

            // Obtén descripción: atributo data-title o texto antes del primer label
            let titulo = fieldset.getAttribute('data-title');
            if (!titulo) {
                const fragments = [];
                for (const node of fieldset.childNodes) {
                    if (node.nodeType === 1 && node.tagName === 'LABEL') break;
                    if (node.nodeType === 1 && node.tagName === 'P') fragments.push(node.textContent.trim());
                    else if (node.nodeType === 3) {
                        const t = node.textContent.replace(/\s+/g,' ').trim();
                        if (t) fragments.push(t);
                    }
                }
                titulo = fragments.join(' ').trim();
            }

            const attr = fieldset.getAttribute('data-services');
            const serviceCodes = attr
                ? attr.split(/[,;]+/).map(s => s.trim()).filter(Boolean)
                : [preguntaId];

            serviceCodes.forEach(code => {
                selectedHistory[code] = {
                    codigo: code,
                    pregunta: preguntaId,
                    categoria,
                    nivel,
                    titulo,
                    respuesta: 'Sí',
                    costo: serviceCost[nivel] || 1
                };
            });
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
        document.querySelectorAll('.plan-output').forEach(n => n.remove());

        if (!document.getElementById('planStyles')) {
            const st = document.createElement('style');
            st.id = 'planStyles';
            st.textContent = `
            .plan-output { margin-top:24px; font-family:Arial, sans-serif; }
            .deliverables-table { width:100%; border-collapse:collapse; font-size:12px; }
            .deliverables-table th, .deliverables-table td { border:1px solid #d0d4dc; vertical-align:top; padding:8px 10px; }
            .deliverables-table th { background:#143e7c; color:#fff; font-weight:600; text-align:center; }
            .deliverables-table td.nivel-col { width:70px; font-weight:600; background:#f2f5f8; }
            .deliverables-table td.componentes-col { width:260px; background:#f8f9fb; }
            .deliverables-table ul { list-style:none; margin:0; padding:0; }
            .deliverables-table li::before { content:"* "; color:#143e7c; font-weight:600; }
            .nivel-tag-LVL1 { color:#143e7c; }
            .nivel-tag-LVL2 { color:#8a4d00; }
            .nivel-tag-LVL3 { color:#5a2c91; }
            .plan-notes{
            margin-top:18px;
                background:linear-gradient(135deg,#f0f8f3 0%, #e3f5e8 100%);
                border:1px solid #c6e7d2;
                padding:18px 22px;
                border-radius:14px;
                color:#1f4d2b;
                font-size:13px;
                line-height:1.55;
                box-shadow:0 2px 4px rgba(0,0,0,.04);
                position:relative;
                overflow:hidden;
            }
                .plan-notes::after {
                content:"";
                position:absolute;
                width:160px;
                height:160px;
                right:-40px;
                top:-40px;
                background:radial-gradient(circle at 30% 30%, rgba(109,207,143,.35), rgba(49,168,97,0));
                transform:rotate(25deg);
                pointer-events:none;
            }
            .plan-notes-title {
                font-weight:600;
                font-size:14px;
                text-transform:uppercase;
                letter-spacing:.5px;
                margin-bottom:10px;
                display:flex;
                align-items:center;
                gap:8px;
                color:#1d5e34;
            }
            .plan-notes-title::before {
                content:"🌿";
                font-size:18px;
            }
            .plan-notes ul {
                list-style:none;
                margin:0;
                padding:0;
            }
            .plan-notes li {
                position:relative;
                margin:6px 0 8px;
                padding-left:22px;
            }
            .plan-notes li::before {
                content:"";
                position:absolute;
                left:0;
                top:6px;
                width:12px;
                height:12px;
                background:radial-gradient(circle at 30% 30%, #6dcf8f, #31a861);
                border-radius:3px;
                transform:rotate(45deg);
                box-shadow:0 0 0 2px #f0f8f3;
            }
            .plan-notes a {
                color:#247a45;
                text-decoration:underline;
            }
            .plan-notes a:hover {
                text-decoration:none;
            }
            
            `
            ;
            document.head.appendChild(st);
        }

        // Agrupa servicios seleccionados totales por nivel
        const levelMap = {};
        const nivelOrder = ['LVL1','LVL2','LVL3'];
        const allServices = months.flat(); // ya ordenados antes por updateResults

        allServices.forEach(s => {
            if (!levelMap[s.nivel]) levelMap[s.nivel] = { all: [], months: [] };
            levelMap[s.nivel].all.push(s);
        });

        // Inicializa matriz months por nivel
        months.forEach((monthServices, mIdx) => {
            nivelOrder.forEach(nv => {
                if (!levelMap[nv]) levelMap[nv] = { all: [], months: [] };
                if (!levelMap[nv].months[mIdx]) levelMap[nv].months[mIdx] = [];
            });
            monthServices.forEach(s => {
                levelMap[s.nivel].months[mIdx].push(s);
            });
        });

        const container = document.createElement('div');
        container.className = 'plan-output';

        const table = document.createElement('table');
        table.className = 'deliverables-table';

        // Header
        const thead = document.createElement('thead');
        const htr = document.createElement('tr');
        htr.innerHTML = `
            <th>Nivel</th>
            <th>Componentes seleccionados por el cliente para su proyecto</th>
            ${months.map((_,i)=>`<th>Entregas Mes ${i+1}</th>`).join('')}
        `;
        thead.appendChild(htr);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');

        nivelOrder.forEach(nv => {
            const data = levelMap[nv];
            if (!data) return; // si no hay ninguno
            if (data.all.length === 0 && months.length === 0) return;

            const tr = document.createElement('tr');

            const nivelCell = document.createElement('td');
            nivelCell.className = 'nivel-col';
            nivelCell.textContent = 'Nivel ' + nv.replace('LVL','');
            tr.appendChild(nivelCell);

            const compCell = document.createElement('td');
            compCell.className = 'componentes-col';
            const listAll = document.createElement('ul');
            data.all.forEach(s => {
                const li = document.createElement('li');
                // Texto: código - título (si existe)
                li.textContent = `${s.codigo}${s.titulo ? ' - ' + s.titulo : ''}`;
                listAll.appendChild(li);
            });
            compCell.appendChild(listAll);
            tr.appendChild(compCell);

            // Meses
            months.forEach((_, idx) => {
                const mCell = document.createElement('td');
                const arr = (data.months[idx] || []);
                if (arr.length) {
                    const ul = document.createElement('ul');
                    arr.forEach(s => {
                        const li = document.createElement('li');
                        li.textContent = `${s.codigo}${s.titulo ? ' - ' + s.titulo : ''}`;
                        ul.appendChild(li);
                    });
                    mCell.appendChild(ul);
                }
                tr.appendChild(mCell);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);
        

        const selectedCount = allServices.length;
        const monthsCount = months.length;
        const totalCost = monthsCount * MONTHLY_COST;
        const notes = document.createElement('div');
        notes.className = 'plan-notes';
        notes.innerHTML = `
            <div class="plan-notes-title">NOTAS:</div>
            <ul>
                <li>El cliente eligió ${selectedCount} componentes de ${TOTAL_COMPONENTS} totales que tiene la metodología Bansani.</li>
                <li>Los entregables van en función de los niveles: Nivel 1 (4 componentes/mes), Nivel 2 (2 componentes/mes), Nivel 3 (1 componente/mes).</li>
                <li>Costo total del proyecto: ${monthsCount} ${monthsCount===1?'mes':'meses'} de trabajo por ${(MONTHLY_COST)} MXN / mensuales = ${(totalCost)} MXN + IVA por ${selectedCount} componentes.</li>
                <li>Tendrás un equipo de expertos en sostenibilidad enfocados en tu proyecto.</li>
            </ul>
        `;
        if (selectedCount > 0) {
            document.body.appendChild(container);
            container.appendChild(notes);
        }
    }

    function updateResults(services = []) {
        document.querySelectorAll('.plan-output').forEach(n => n.remove());
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