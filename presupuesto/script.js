const APP_NAME = "Presupuesto_Dental";

// ─── Colores por marca para el modal ───
const MARCA_CONFIG = {
    neodent:    { color: 'blue',   activo: 'border-blue-500 bg-blue-50 text-blue-700',   franja: 'from-blue-400 to-blue-600' },
    neobiotech: { color: 'purple', activo: 'border-purple-500 bg-purple-50 text-purple-700', franja: 'from-purple-400 to-purple-600' },
    mis:        { color: 'rose',   activo: 'border-rose-500 bg-rose-50 text-rose-700',   franja: 'from-rose-400 to-rose-600' },
};

let marcaSeleccionada = null;

// ══════════════════════════════════════════════════
//  INICIALIZACIÓN
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosOdontograma();

    document.getElementById('btn-agregar-manual').addEventListener('click', agregarFilaManual);
    document.getElementById('btn-recalcular').addEventListener('click', cargarDatosOdontograma);
    document.getElementById('btn-imprimir').addEventListener('click', () => window.print());
    document.getElementById('btn-agregar-implante').addEventListener('click', abrirModalImplante);

    // Modal: cerrar
    document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-overlay').addEventListener('click', cerrarModal);

    // Modal: selección de marca
    document.querySelectorAll('.marca-btn').forEach(btn => {
        btn.addEventListener('click', () => seleccionarMarca(btn.dataset.marca));
    });

    // Modal: seleccionar todos
    document.getElementById('modal-seleccionar-todos').addEventListener('click', toggleSeleccionarTodos);

    // Modal: agregar al presupuesto
    document.getElementById('modal-agregar').addEventListener('click', agregarInsumosDesdeModal);

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });
});

// ══════════════════════════════════════════════════
//  UTILIDADES DE MONEDA
// ══════════════════════════════════════════════════
function formatearMoneda(valor) {
    if (isNaN(valor)) return 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 })
        .format(valor).replace('$', '').trim();
}

function parsearMoneda(str) {
    if (!str) return 0;
    const num = parseInt(str.toString().replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
}

// ══════════════════════════════════════════════════
//  TABLA DE PRESUPUESTO
// ══════════════════════════════════════════════════
function calcularTotal() {
    let total = 0;
    document.querySelectorAll('.precio-item').forEach(input => {
        total += parsearMoneda(input.value);
    });
    document.getElementById('total-presupuesto').value = formatearMoneda(total);
}

function crearFila(diente, hallazgo, sugerencia, precioSugerido = 0, isManual = false) {
    const tbody = document.getElementById('lista-tratamientos');
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition-colors item-row group";

    let tdDiente     = `<td class="p-4 font-bold text-slate-700">${diente}</td>`;
    let tdHallazgo   = `<td class="p-4 text-slate-600 text-sm">${hallazgo}</td>`;
    let tdTratamiento = `<td class="p-4 text-slate-800 font-medium">${sugerencia}</td>`;

    if (isManual) {
        tdDiente      = `<td class="p-4"><input type="text" placeholder="Ej: 16" class="w-16 p-2 rounded bg-white border border-slate-200 focus:border-amber-400 outline-none text-sm font-bold text-slate-700"></td>`;
        tdHallazgo    = `<td class="p-4"><input type="text" placeholder="Ej: Observación" class="w-full p-2 rounded bg-white border border-slate-200 focus:border-amber-400 outline-none text-sm text-slate-600"></td>`;
        tdTratamiento = `<td class="p-4"><input type="text" placeholder="Ej: Limpieza General" class="w-full p-2 rounded bg-white border border-slate-200 focus:border-amber-400 outline-none font-medium text-slate-800"></td>`;
    }

    tr.innerHTML = `
        ${tdDiente}
        ${tdHallazgo}
        ${tdTratamiento}
        <td class="p-4">
            <div class="relative flex items-center">
                <span class="absolute left-3 text-slate-400 text-sm font-bold">$</span>
                <input type="text" value="${precioSugerido > 0 ? formatearMoneda(precioSugerido) : ''}" placeholder="0"
                    class="precio-item w-full pl-7 pr-3 py-2 rounded bg-white border border-slate-200 focus:border-amber-500 outline-none transition text-right font-medium text-slate-700">
            </div>
        </td>
        <td class="p-4 text-center">
            <button class="btn-eliminar p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 outline-none">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    `;

    const inputPrecio = tr.querySelector('.precio-item');
    inputPrecio.addEventListener('input', (e) => {
        let val = parsearMoneda(e.target.value);
        e.target.value = val > 0 ? formatearMoneda(val) : '';
        calcularTotal();
    });

    tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        tr.style.transition = 'opacity 0.2s';
        tr.style.opacity = '0';
        setTimeout(() => { tr.remove(); calcularTotal(); }, 200);
    });

    tbody.appendChild(tr);
    calcularTotal();
}

function agregarFilaManual() {
    crearFila('', '', '', 0, true);
}

// ══════════════════════════════════════════════════
//  MODAL DE IMPLANTE
// ══════════════════════════════════════════════════
function abrirModalImplante() {
    marcaSeleccionada = null;
    document.getElementById('modal-diente').value = '';
    document.getElementById('modal-lista-insumos').innerHTML = '<p class="text-slate-400 text-sm text-center py-6">← Seleccioná una marca primero</p>';
    document.getElementById('modal-seleccionar-todos').classList.add('hidden');
    actualizarContadorModal();
    document.getElementById('modal-implante').classList.remove('hidden');
    // Limpiar selección de marca
    document.querySelectorAll('.marca-btn').forEach(b => {
        b.className = 'marca-btn flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all border-slate-200 text-slate-500 bg-slate-50 hover:border-slate-300';
    });
    // Resetear franja
    document.getElementById('modal-franja').className = 'h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500';
}

function cerrarModal() {
    document.getElementById('modal-implante').classList.add('hidden');
    marcaSeleccionada = null;
}

function seleccionarMarca(marca) {
    marcaSeleccionada = marca;
    const cfg = MARCA_CONFIG[marca];

    // Actualizar franja
    document.getElementById('modal-franja').className = `h-1.5 w-full bg-gradient-to-r ${cfg.franja}`;

    // Resaltar botón activo
    document.querySelectorAll('.marca-btn').forEach(b => {
        const estesMarca = b.dataset.marca === marca;
        b.className = estesMarca
            ? `marca-btn flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${cfg.activo}`
            : 'marca-btn flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all border-slate-200 text-slate-500 bg-slate-50 hover:border-slate-300';
    });

    // Cargar insumos desde datos.js (TARIFARIO_PRECIOS) o localStorage
    let items = [];
    if (typeof TARIFARIO_PRECIOS !== 'undefined' && TARIFARIO_PRECIOS[marca]) {
        // Intentar cargar desde localStorage (el usuario pudo haber editado precios)
        const guardado = localStorage.getItem('TarifarioImplantes');
        if (guardado) {
            try {
                const local = JSON.parse(guardado);
                if (Array.isArray(local[marca]) && local[marca].length > 0) {
                    items = local[marca];
                } else {
                    items = TARIFARIO_PRECIOS[marca];
                }
            } catch(e) { items = TARIFARIO_PRECIOS[marca]; }
        } else {
            items = TARIFARIO_PRECIOS[marca];
        }
    }

    const lista = document.getElementById('modal-lista-insumos');
    if (!items || items.length === 0) {
        lista.innerHTML = '<p class="text-slate-400 text-sm text-center py-6">Sin insumos definidos para esta marca.</p>';
        document.getElementById('modal-seleccionar-todos').classList.add('hidden');
        return;
    }

    document.getElementById('modal-seleccionar-todos').classList.remove('hidden');

    lista.innerHTML = items.map((item, i) => {
        const precioTexto = item.precio > 0
            ? `<span class="text-xs font-bold text-emerald-600 ml-auto pl-3 whitespace-nowrap">$${formatearMoneda(item.precio)}</span>`
            : `<span class="text-xs text-slate-300 ml-auto pl-3 whitespace-nowrap">Sin precio</span>`;
        const colorCheck = { blue: 'accent-blue-600', purple: 'accent-purple-600', rose: 'accent-rose-600' }[cfg.color] || '';
        return `
          <label class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
            <input type="checkbox" class="insumo-check w-4 h-4 rounded ${colorCheck} flex-shrink-0"
                   data-nombre="${item.nombre.replace(/"/g, '&quot;')}"
                   data-precio="${item.precio}"
                   onchange="actualizarContadorModal()">
            <span class="text-sm text-slate-700 font-medium flex-1">${item.nombre}</span>
            ${precioTexto}
          </label>`;
    }).join('');

    actualizarContadorModal();
}

function toggleSeleccionarTodos() {
    const checks = document.querySelectorAll('.insumo-check');
    const todosChecked = Array.from(checks).every(c => c.checked);
    checks.forEach(c => c.checked = !todosChecked);
    actualizarContadorModal();
}

function actualizarContadorModal() {
    const n = document.querySelectorAll('.insumo-check:checked').length;
    document.getElementById('modal-contador').textContent = `${n} insumo${n !== 1 ? 's' : ''} seleccionado${n !== 1 ? 's' : ''}`;
    document.getElementById('modal-agregar').disabled = n === 0 || !marcaSeleccionada;
}

function agregarInsumosDesdeModal() {
    if (!marcaSeleccionada) return;
    const diente = document.getElementById('modal-diente').value.trim() || '—';
    const marcaNombre = { neodent: 'Neodent', neobiotech: 'Neobiotech', mis: 'MIS' }[marcaSeleccionada] || marcaSeleccionada;
    const checks = document.querySelectorAll('.insumo-check:checked');

    checks.forEach(check => {
        const nombre = check.dataset.nombre;
        const precio = parseInt(check.dataset.precio, 10) || 0;
        crearFila(diente, marcaNombre, nombre, precio, false);
    });

    cerrarModal();
}

// ══════════════════════════════════════════════════
//  CARGA DESDE ODONTOGRAMA
// ══════════════════════════════════════════════════
function sugerirTratamiento(tipo) {
    if (tipo === 'caries') return "Restauración Simple/Compuesta";
    if (tipo === 'restauracion_defectuosa') return "Recambio de Restauración";
    if (tipo === 'ausencia') return "Implante Dental / Prótesis";
    return "Evaluación Adicional";
}

function cargarDatosOdontograma() {
    const tbody = document.getElementById('lista-tratamientos');
    tbody.innerHTML = '';

    const histStr = localStorage.getItem('HistorialClinico');
    if (!histStr) {
        crearFila('-', 'Sin datos', 'No se ha detectado historial dental.', 0, false);
        return;
    }

    const hist = JSON.parse(histStr);
    const eventos = hist.filter(item =>
        item.tipo_app === 'Odontograma_Digital' &&
        ['caries', 'restauracion_defectuosa', 'ausencia'].includes(item.type)
    );

    if (eventos.length === 0) {
        crearFila('N/A', 'Paciente Sano / Evaluado', 'Control preventivo', 0, false);
        return;
    }

    const agrupados = {};
    eventos.forEach(ev => {
        const key = `${ev.diente}-${ev.type}`;
        if (!agrupados[key]) {
            agrupados[key] = { diente: ev.diente, tipo: ev.type, hallazgo: ev.detalle, caras: ev.face ? [ev.face] : [] };
        } else if (ev.face && !agrupados[key].caras.includes(ev.face)) {
            agrupados[key].caras.push(ev.face);
            agrupados[key].hallazgo += `, ${ev.detalle.replace('Caries en ', '')}`;
        }
    });

    Object.values(agrupados).forEach(item => {
        crearFila(item.diente, item.hallazgo, sugerirTratamiento(item.tipo), 0);
    });
}
